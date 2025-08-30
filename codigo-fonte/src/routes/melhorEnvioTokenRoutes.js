// src/routes/melhorEnvioTokenRoutes.js
const express = require('express');
const { 
  getValidAccessToken, 
  forceTokenRenewal, 
  getTokenInfo 
} = require('../services/melhorEnvioAuthService.js');
const AuthAdmin = require('../middlewares/AuthAdmin');

const router = express.Router();

/**
 * GET /api/melhor-envio-token/info
 * Obtém informações sobre o token atual
 */
router.get('/info', AuthAdmin, async (req, res) => {
  try {
    const tokenInfo = await getTokenInfo();
    res.json(tokenInfo);
  } catch (error) {
    console.error('Erro ao obter informações do token:', error);
    res.status(500).json({ error: 'Erro ao obter informações do token' });
  }
});

/**
 * POST /api/melhor-envio-token/refresh
 * Força a renovação do token
 */
router.post('/refresh', AuthAdmin, async (req, res) => {
  try {
    const newToken = await forceTokenRenewal();
    res.json({ 
      message: 'Token renovado com sucesso',
      success: true,
      tokenPreview: newToken.substring(0, 20) + '...' // Mostra apenas o início por segurança
    });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(500).json({ 
      error: 'Erro ao renovar token',
      message: error.message 
    });
  }
});

/**
 * GET /api/melhor-envio-token/validate
 * Valida e obtém um token (renova automaticamente se necessário)
 */
router.get('/validate', AuthAdmin, async (req, res) => {
  try {
    const validToken = await getValidAccessToken();
    res.json({ 
      message: 'Token validado com sucesso',
      success: true,
      isValid: true,
      tokenPreview: validToken.substring(0, 20) + '...' // Mostra apenas o início por segurança
    });
  } catch (error) {
    console.error('Erro ao validar token:', error);
    res.status(500).json({ 
      error: 'Erro ao validar token',
      message: error.message 
    });
  }
});

module.exports = router;
