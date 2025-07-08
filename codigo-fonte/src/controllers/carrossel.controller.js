const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { deleteImageVersionsFromS3 } = require('../services/s3Service.js');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, bucketName } = require('../config/aws.js');
const crypto = require('crypto');
const sharp = require('sharp');

const getCarrosselImagens = async (req, res) => {
  try {
    const imagens = await prisma.carrosselImagem.findMany({
      where: { ativo: true },
      orderBy: { posicao: 'asc' },
      take: 3,
    });
    res.json(imagens);
  } catch (error) {
    console.error("Erro ao buscar imagens do carrossel:", error);
    res.status(500).json({ error: "Erro ao buscar as imagens do carrossel." });
  }
};

const createCarrosselImagem = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo de imagem enviado.' });
  }

  const cropData = req.body.crop ? JSON.parse(req.body.crop) : null;
  const link = req.body.link || null;

  if (!cropData) {
    return res.status(400).json({ error: 'Dados de corte da imagem ausentes.' });
  }
  
  try {
    const count = await prisma.carrosselImagem.count();
    if (count >= 3) {
      return res.status(400).json({ error: "Limite de 3 imagens atingido. Exclua uma para adicionar uma nova." });
    }

    // --- Validação de Limites (A CORREÇÃO) ---
    const image = sharp(req.file.buffer);
    const metadata = await image.metadata(); // Pega as dimensões da imagem original

    // Garante que as coordenadas do corte sejam inteiros
    let left = Math.round(cropData.x);
    let top = Math.round(cropData.y);
    let width = Math.round(cropData.width);
    let height = Math.round(cropData.height);

    // Garante que a área de corte não saia dos limites da imagem original
    if (left + width > metadata.width) {
      width = metadata.width - left;
    }
    if (top + height > metadata.height) {
      height = metadata.height - top;
    }
    // Garante que as coordenadas de início não sejam negativas
    if (left < 0) left = 0;
    if (top < 0) top = 0;


    // Corta a imagem com as coordenadas validadas
    const croppedImageBuffer = await image
      .extract({ left, top, width, height })
      .toBuffer();

    // ... O resto da sua função (redimensionamento e upload) continua exatamente igual ...
    const baseFileName = crypto.randomBytes(16).toString('hex');
    const sizes = {
      thumbnail: { width: 250, height: 141 },
      medium: { width: 800, height: 450 },
      large: { width: 1920, height: 1080 },
    };
    
    const uploadedUrls = {};
    const uploadPromises = [];

    for (const sizeName in sizes) {
      const { sizeWidth, sizeHeight } = sizes[sizeName];
      const fileName = `carrossel/${baseFileName}-${sizeName}.webp`;

      const processedBuffer = await sharp(croppedImageBuffer)
        .resize(sizes[sizeName].width, sizes[sizeName].height)
        .webp({ quality: 80 })
        .toBuffer();
      
      const params = { Bucket: bucketName, Key: fileName, Body: processedBuffer, ContentType: 'image/webp' };
      const command = new PutObjectCommand(params);
      
      uploadPromises.push(s3Client.send(command).then(() => {
        uploadedUrls[sizeName] = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      }));
    }

    await Promise.all(uploadPromises);

    const novaImagem = await prisma.carrosselImagem.create({
      data: {
        urls: uploadedUrls,
        link: link,
        posicao: count,
      },
    });

    res.status(201).json(novaImagem);

  } catch (error) {
    console.error("Erro ao criar imagem do carrossel:", error);
    res.status(500).json({ error: "Erro ao criar a imagem do carrossel." });
  }
};

// --- Função de DELETAR (CORRIGIDO) ---
const deleteCarrosselImagem = async (req, res) => {
  const { id } = req.params;
  try {
    const imagemParaDeletar = await prisma.carrosselImagem.findUnique({ where: { id } });
    if (!imagemParaDeletar) {
      return res.status(404).json({ error: 'Imagem do carrossel não encontrada.' });
    }
    await deleteImageVersionsFromS3(imagemParaDeletar.urls);
    await prisma.carrosselImagem.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar imagem do carrossel:", error);
    res.status(500).json({ error: 'Erro ao deletar a imagem do carrossel.' });
  }
};

// --- Atualiza o module.exports ---
module.exports = {
  getCarrosselImagens,
  createCarrosselImagem,
  deleteCarrosselImagem,
};