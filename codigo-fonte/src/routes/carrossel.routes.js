const { Router } = require('express');
const AuthAdmin = require('../middlewares/AuthAdmin');
const { upload } = require('../middlewares/multer'); // Precisamos do 'upload' para pegar o arquivo
const { 
  getCarrosselImagens, 
  createCarrosselImagem, 
  deleteCarrosselImagem 
} = require('../controllers/carrossel.controller.js');

const carrosselRouter = Router();

// Rota pública para buscar as imagens
carrosselRouter.get('/', getCarrosselImagens);

// Rota de admin para CRIAR a imagem (agora faz upload e processamento)
// Ela espera um único arquivo no campo 'image'
carrosselRouter.post('/', AuthAdmin, upload.single('image'), createCarrosselImagem);

// Rota de admin para DELETAR uma imagem
carrosselRouter.delete('/:id', AuthAdmin, deleteCarrosselImagem);

module.exports = carrosselRouter;