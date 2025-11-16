// src/services/melhorEnvioAuthService.js
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

/**
 * Obtém um access token válido do Melhor Envio
 * Verifica se o token atual está expirado e renova automaticamente se necessário
 * @returns {Promise<string>} - Access token válido
 */
async function getValidAccessToken() {
  try {
    // 1. Buscar o token atual do banco de dados
    let tokenData = await prisma.melhorEnvioAuth.findUnique({
      where: { id: 1 }
    });

    // Se não existe dados de token no banco, inicializar com os dados do .env
    if (!tokenData) {
      console.log('Nenhum token encontrado no banco. Inicializando com dados do .env...');
      
      const currentTime = Math.floor(Date.now() / 1000); // Timestamp atual em segundos
      
      tokenData = await prisma.melhorEnvioAuth.create({
        data: {
          id: 1,
          accessToken: process.env.MELHOR_ENVIO_ACCESS_TOKEN,
          refreshToken: process.env.MELHOR_ENVIO_REFRESH_TOKEN,
          expiresIn: 2592000, // 30 dias em segundos
          updatedAt: new Date()
        }
      });
      
      console.log('Token inicializado no banco de dados.');
    }

    // 2. Verificar se o token está expirado
    const currentTime = Math.floor(Date.now() / 1000);
    const tokenAge = Math.floor((Date.now() - tokenData.updatedAt.getTime()) / 1000);
    const isExpired = tokenAge >= tokenData.expiresIn;

    console.log(`Token age: ${tokenAge}s, Expires in: ${tokenData.expiresIn}s, Is expired: ${isExpired}`);

    // 3. Se o token não está expirado, retornar o token atual
    if (!isExpired) {
      console.log('Token ainda válido. Retornando token existente.');
      return tokenData.accessToken;
    }

    // 4. Se o token está expirado, renovar usando o refresh token
    console.log('Token expirado. Renovando...');
    
    const newTokenData = await renewAccessToken(tokenData.refreshToken);
    
    // 5. Atualizar o token no banco de dados
    const updatedTokenData = await prisma.melhorEnvioAuth.update({
      where: { id: 1 },
      data: {
        accessToken: newTokenData.access_token,
        refreshToken: newTokenData.refresh_token,
        expiresIn: newTokenData.expires_in,
        updatedAt: new Date()
      }
    });

    console.log('Token renovado e salvo no banco de dados.');
    return updatedTokenData.accessToken;

  } catch (error) {
    console.error('Erro ao obter access token:', error);
    throw new Error('Falha ao obter access token válido: ' + error.message);
  }
}

/**
 * Renova o access token usando o refresh token
 * @param {string} refreshToken - Refresh token para renovação
 * @returns {Promise<Object>} - Dados do novo token
 */
async function renewAccessToken(refreshToken) {
  try {
    const response = await axios.post(
      `${process.env.MELHOR_ENVIO_ORIGIN}/oauth/token`,
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.MELHOR_ENVIO_USER_ID,
        client_secret: process.env.MELHOR_ENVIO_SECRET,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': process.env.USER_AGENT || 'Node.js Client'
        }
      }
    );

    if (!response.data.access_token) {
      throw new Error('Resposta inválida da API - access_token não encontrado');
    }

    console.log('Token renovado com sucesso via API do Melhor Envio.');
    
    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in || 2592000 // Default para 30 dias se não especificado
    };

  } catch (error) {
    console.error('Erro ao renovar access token:', error.response?.data || error.message);
    
    // Se falhar a renovação, tentar usar os dados originais do .env como fallback
    console.log('Falha na renovação. Tentando usar dados do .env como fallback...');
    
    return {
      access_token: process.env.MELHOR_ENVIO_ACCESS_TOKEN,
      refresh_token: process.env.MELHOR_ENVIO_REFRESH_TOKEN,
      expires_in: 2592000
    };
  }
}

/**
 * Força a renovação do token mesmo se não estiver expirado
 * Útil para testes ou quando há problemas com o token atual
 * @returns {Promise<string>} - Novo access token
 */
async function forceTokenRenewal() {
  try {
    console.log('Forçando renovação do token...');
    
    const tokenData = await prisma.melhorEnvioAuth.findUnique({
      where: { id: 1 }
    });

    if (!tokenData) {
      throw new Error('Nenhum token encontrado no banco para renovação forçada');
    }

    const newTokenData = await renewAccessToken(tokenData.refreshToken);
    
    const updatedTokenData = await prisma.melhorEnvioAuth.update({
      where: { id: 1 },
      data: {
        accessToken: newTokenData.access_token,
        refreshToken: newTokenData.refresh_token,
        expiresIn: newTokenData.expires_in,
        updatedAt: new Date()
      }
    });

    console.log('Token forçadamente renovado com sucesso.');
    return updatedTokenData.accessToken;

  } catch (error) {
    console.error('Erro na renovação forçada do token:', error);
    throw error;
  }
}

/**
 * Obtém informações sobre o token atual
 * @returns {Promise<Object>} - Informações do token
 */
async function getTokenInfo() {
  try {
    const tokenData = await prisma.melhorEnvioAuth.findUnique({
      where: { id: 1 }
    });

    if (!tokenData) {
      return { message: 'Nenhum token encontrado no banco' };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const tokenAge = Math.floor((Date.now() - tokenData.updatedAt.getTime()) / 1000);
    const isExpired = tokenAge >= tokenData.expiresIn;
    const timeUntilExpiry = tokenData.expiresIn - tokenAge;

    return {
      hasToken: true,
      isExpired,
      tokenAge: `${Math.floor(tokenAge / 86400)} dias, ${Math.floor((tokenAge % 86400) / 3600)} horas`,
      timeUntilExpiry: isExpired ? 'Expirado' : `${Math.floor(timeUntilExpiry / 86400)} dias, ${Math.floor((timeUntilExpiry % 86400) / 3600)} horas`,
      lastUpdated: tokenData.updatedAt.toISOString(),
      expiresInSeconds: tokenData.expiresIn
    };

  } catch (error) {
    console.error('Erro ao obter informações do token:', error);
    return { error: error.message };
  }
}

module.exports = {
  getValidAccessToken,
  renewAccessToken,
  forceTokenRenewal,
  getTokenInfo
};
