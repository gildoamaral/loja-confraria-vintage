const { PrismaClient } = require('@prisma/client');
const cloudinary = require('../config/cloudinary.js');
const { deleteImageVersionsFromCloudinary } = require('../services/cloudinaryService.js');
const crypto = require('crypto');
const sharp = require('sharp');

const prisma = new PrismaClient();

// Função para processar e fazer upload da imagem para Cloudinary
const uploadImageToCloudinary = async (imageBuffer) => {
  const baseFileName = crypto.randomBytes(16).toString('hex');
  
  const sizes = {
    thumbnail: { width: 250, height: 250 },
    medium: { width: 800, height: 800 },
    large: { width: 1200, height: 1200 },
  };

  const uploadedUrls = {};

  for (const sizeName in sizes) {
    const { width, height } = sizes[sizeName];

    const processedImageBuffer = await sharp(imageBuffer)
      .resize(width, height, { fit: 'cover' })
      .webp({ quality: 100 })
      .toBuffer();

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'sobre', // Coloca todas as imagens na pasta "sobre"
          public_id: `${baseFileName}-${sizeName}`,
          format: 'webp',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(processedImageBuffer);
    });

    uploadedUrls[sizeName] = uploadResult.secure_url;
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
      // 1. Primeiro, busca a seção atual para verificar se já tem imagem
      const secaoAtual = await prisma.conteudoSobreNos.findUnique({
        where: { secao }
      });

      // 2. Se existe uma seção com imagem anterior, deleta do Cloudinary
      if (secaoAtual && secaoAtual.urlsImagem && Object.keys(secaoAtual.urlsImagem).length > 0) {
        console.log(`Deletando imagem anterior da seção "${secao}"...`);
        await deleteImageVersionsFromCloudinary(secaoAtual.urlsImagem);
      }

      // 3. Faz upload da nova imagem
      const imageUrls = await uploadImageToCloudinary(req.file.buffer);
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
