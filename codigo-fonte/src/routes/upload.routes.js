const { Router } = require('express');
const { upload } = require('../middlewares/multer.js');
const { uploadImage } = require('../controllers/upload.controller.js');
const multer = require('multer'); // Importe o multer aqui também

const uploadRouter = Router();

// --- CÓDIGO NOVO ABAIXO ---

// 1. Criamos uma função para tratar os erros do Multer
const handleMulterError = (req, res, next) => {
  // Usamos o middleware upload.array() que já tínhamos
  const uploader = upload.array('images', 5);

  uploader(req, res, (err) => {
    // 2. Verificamos se o erro é uma instância do MulterError
    if (err instanceof multer.MulterError) {
      // Se o erro for de limite de tamanho de arquivo
      if (err.code === 'LIMIT_FILE_SIZE') {
        // Retornamos uma resposta JSON clara com status 400
        return res.status(400).json({ error: 'Um ou mais arquivos excedem o limite de 7MB.' });
      }
      // Para outros erros do Multer, retornamos a mensagem padrão do erro
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // Para outros erros inesperados
      return res.status(500).json({ error: 'Ocorreu um erro inesperado durante o upload.' });
    }

    // 3. Se não houver erro, passamos para o próximo passo (nosso controller uploadImage)
    next();
  });
};


// 4. Usamos nossa nova função na rota
uploadRouter.post('/upload', handleMulterError, uploadImage);

module.exports = uploadRouter;