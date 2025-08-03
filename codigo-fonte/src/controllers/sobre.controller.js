const { PrismaClient } = require('@prisma/client');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, bucketName } = require('../config/aws.js');
const crypto = require('crypto');
const sharp = require('sharp');

const prisma = new PrismaClient();

// Função para processar e fazer upload da imagem para S3
const uploadImageToS3 = async (imageBuffer) => {
  const baseFileName = crypto.randomBytes(16).toString('hex');
  
  const sizes = {
    thumbnail: { width: 250, height: 250 },
    medium: { width: 800, height: 800 },
    large: { width: 1200, height: 1200 },
  };

  const uploadedUrls = {};

  for (const sizeName in sizes) {
    const { width, height } = sizes[sizeName];
    const fileName = `sobre/${baseFileName}-${sizeName}.webp`;

    const processedImageBuffer = await sharp(imageBuffer)
      .resize(width, height, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: processedImageBuffer,
      ContentType: 'image/webp',
    });

    await s3Client.send(command);
    uploadedUrls[sizeName] = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  }

  return uploadedUrls;
};

// Buscar todas as seções da página sobre
const getSobreSecoes = async (req, res) => {
  try {
    const secoes = await prisma.conteudoSobreNos.findMany({
      orderBy: { secao: 'asc' }
    });
    
    res.json(secoes);
  } catch (error) {
    console.error('Erro ao buscar seções:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar uma seção específica
const updateSobreSecao = async (req, res) => {
  const { secao } = req.params;
  const { titulo, texto } = req.body;

  try {
    let updateData = { titulo, texto };

    // Se uma nova imagem foi enviada, faz o upload
    if (req.file) {
      const imageUrls = await uploadImageToS3(req.file.buffer);
      updateData.urlsImagem = imageUrls;
    }

    // Usa upsert para criar se não existir ou atualizar se existir
    const sobreSecao = await prisma.conteudoSobreNos.upsert({
      where: { secao },
      update: updateData,
      create: {
        secao,
        titulo,
        texto,
        urlsImagem: updateData.urlsImagem || {}
      }
    });

    res.json(sobreSecao);
  } catch (error) {
    console.error('Erro ao atualizar seção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getSobreSecoes,
  updateSobreSecao
};
