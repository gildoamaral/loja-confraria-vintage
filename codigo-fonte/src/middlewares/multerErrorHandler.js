// Arquivo: src/middlewares/multerErrorHandler.js
const multer = require('multer');
const { upload } = require('./multer.js'); // Importa sua configuração base do multer

const handleUpload = (req, res, next) => {
  // Usamos a configuração que aceita até 5 imagens no campo 'images'
  const uploader = upload.array('images', 5);

  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: `Um ou mais arquivos excedem o limite de 5MB.` });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'Ocorreu um erro inesperado durante o upload.' });
    }
    // Se não houver erro, passa para o próximo passo (o controller)
    next();
  });
};

module.exports = handleUpload;