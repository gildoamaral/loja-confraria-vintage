const { Router } = require('express');
const AuthAdmin = require('../middlewares/AuthAdmin');
const { upload } = require('../middlewares/multer.js');
const { uploadImage } = require('../controllers/upload.controller.js');
const multer = require('multer'); // Importe o multer aqui também

const uploadRouter = Router();

const handleMulterError = (req, res, next) => {
  const uploader = upload.array('images', 5);

  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Um ou mais arquivos excedem o limite de 7MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'Ocorreu um erro inesperado durante o upload.' });
    }

    next();
  });
};


uploadRouter.post('/upload', AuthAdmin, handleMulterError, uploadImage);

module.exports = uploadRouter;