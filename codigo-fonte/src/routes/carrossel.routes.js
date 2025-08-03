const { Router } = require('express');
const AuthAdmin = require('../middlewares/AuthAdmin');
const { upload } = require('../middlewares/multer');
const multer = require('multer');
const { 
  getCarrosselImagens, 
  createCarrosselImagem, 
  deleteCarrosselImagem 
} = require('../controllers/carrossel.controller.js');

const carrosselRouter = Router();

// Middleware para tratamento de erro do Multer
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

carrosselRouter.get('/', getCarrosselImagens);

carrosselRouter.post('/', AuthAdmin, handleSingleImageError, createCarrosselImagem);

carrosselRouter.delete('/:id', AuthAdmin, deleteCarrosselImagem);

module.exports = carrosselRouter;