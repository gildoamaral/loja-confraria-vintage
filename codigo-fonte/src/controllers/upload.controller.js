const cloudinary = require('../config/cloudinary.js');
const crypto = require('crypto');
const sharp = require('sharp');

const uploadImage = async (req, res) => {
  // 1. O Multer agora nos dá um array 'req.files'. Verificamos se ele existe e não está vazio.
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
  }

  try {
    // 2. Usamos Promise.all para processar todos os arquivos enviados em paralelo.
    const uploadResults = await Promise.all(
      req.files.map(async (file) => {
        const baseFileName = crypto.randomBytes(16).toString('hex');

        const sizes = {
          thumbnail: { width: 250, height: 250 },
          medium: { width: 800, height: 800 },
          large: { width: 1200, height: 1200 },
        };

        const uploadedUrls = {};

        // Para cada arquivo, processamos os 3 tamanhos.
        for (const sizeName in sizes) {
          const { width, height } = sizes[sizeName];

          const processedImageBuffer = await sharp(file.buffer)
            .resize(width, height, { fit: 'cover' })
            .webp({ quality: 80 })
            .toBuffer();

          // Upload para Cloudinary
          const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                resource_type: 'image',
                folder: 'produtos', // Coloca todas as imagens na pasta "produtos"
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
        
        // Retorna um objeto com as URLs das 3 versões para este arquivo específico
        return { originalName: file.originalname, urls: uploadedUrls };
      })
    );

    // 3. Retorna um array de resultados, um para cada imagem enviada.
    return res.status(201).json(uploadResults);

  } catch (error) {
    console.error("Erro no processamento ou upload de imagens:", error);
    return res.status(500).json({ error: 'Falha ao processar ou fazer upload das imagens.' });
  }
};

module.exports = {
  uploadImage,
};