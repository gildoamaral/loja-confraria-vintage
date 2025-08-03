const { Router } = require('express');
const AuthAdmin = require('../middlewares/AuthAdmin');
const { upload } = require('../middlewares/multer');
const multer = require('multer');
const { 
  getSobreSecoes, 
  updateSobreSecao 
} = require('../controllers/sobre.controller.js');

const sobreRouter = Router();

// Middleware para tratamento de erro do Multer (consistente com upload.routes)
const handleSingleImageError = (req, res, next) => {
  const uploader = upload.single('image');

  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'O arquivo excede o limite de 7MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'Ocorreu um erro inesperado durante o upload.' });
    }

    next();
  });
};

// Rota pública para buscar as seções
sobreRouter.get('/', getSobreSecoes);

// Rota de admin para atualizar uma seção (com upload de imagem)
sobreRouter.put('/:secao', AuthAdmin, handleSingleImageError, updateSobreSecao);

module.exports = sobreRouter;
