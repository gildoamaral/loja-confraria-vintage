const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/auth/status
 * @desc    Verifica o token JWT no cookie e retorna o status/dados do usuário
 * @access  Public (a lógica de proteção está no middleware)
 */
router.get('/status', protect, (req, res) => {
  if (req.user) {
    // Se o middleware `protect` encontrou e verificou o usuário
    res.status(200).json(req.user);
  } else {
    // Se não há usuário logado (sem token ou token inválido)
    res.status(204).send(); // 204 No Content é uma boa resposta para "não logado"
  }
});

module.exports = router;