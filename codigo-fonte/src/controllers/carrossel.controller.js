const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { deleteImageVersionsFromCloudinary } = require('../services/cloudinaryService.js');
const cloudinary = require('../config/cloudinary.js');
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

    // Processamento e upload para Cloudinary
    const baseFileName = crypto.randomBytes(16).toString('hex');
    const sizes = {
      thumbnail: { width: 250, height: 141 },
      medium: { width: 800, height: 450 },
      large: { width: 1920, height: 1080 },
    };
    
    const uploadedUrls = {};
    const uploadPromises = [];

    for (const sizeName in sizes) {
      const { width, height } = sizes[sizeName];

      const processedBuffer = await sharp(croppedImageBuffer)
        .resize(width, height)
        .webp({ quality: 100 })
        .toBuffer();
      
      const uploadPromise = new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'carrossel', // Coloca todas as imagens na pasta "carrossel"
            public_id: `${baseFileName}-${sizeName}`,
            format: 'webp',
          },
          (error, result) => {
            if (error) reject(error);
            else {
              uploadedUrls[sizeName] = result.secure_url;
              resolve();
            }
          }
        ).end(processedBuffer);
      });
      
      uploadPromises.push(uploadPromise);
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
    await deleteImageVersionsFromCloudinary(imagemParaDeletar.urls);
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