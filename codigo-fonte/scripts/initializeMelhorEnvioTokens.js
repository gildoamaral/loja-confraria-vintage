// scripts/initializeMelhorEnvioTokens.js
// Script para inicializar os tokens do Melhor Envio no banco de dados

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function initializeTokens() {
  try {
    console.log('🚀 Inicializando tokens do Melhor Envio no banco de dados...');

    // Verificar se os tokens estão no .env
    if (!process.env.MELHOR_ENVIO_ACCESS_TOKEN || !process.env.MELHOR_ENVIO_REFRESH_TOKEN) {
      console.error('❌ MELHOR_ENVIO_ACCESS_TOKEN e MELHOR_ENVIO_REFRESH_TOKEN devem estar definidos no .env');
      process.exit(1);
    }

    // Verificar se já existe um registro
    const existingToken = await prisma.melhorEnvioAuth.findUnique({
      where: { id: 1 }
    });

    if (existingToken) {
      console.log('ℹ️  Token já existe no banco de dados.');
      console.log('Token atual expires in:', existingToken.expiresIn, 'segundos');
      console.log('Última atualização:', existingToken.updatedAt.toISOString());
      
      const tokenAge = Math.floor((Date.now() - existingToken.updatedAt.getTime()) / 1000);
      const isExpired = tokenAge >= existingToken.expiresIn;
      
      console.log('Idade do token:', Math.floor(tokenAge / 86400), 'dias');
      console.log('Status:', isExpired ? '❌ Expirado' : '✅ Válido');
      
      return;
    }

    // Criar novo registro com os tokens do .env
    const newToken = await prisma.melhorEnvioAuth.create({
      data: {
        id: 1,
        accessToken: process.env.MELHOR_ENVIO_ACCESS_TOKEN,
        refreshToken: process.env.MELHOR_ENVIO_REFRESH_TOKEN,
        expiresIn: 2592000, // 30 dias em segundos
        updatedAt: new Date()
      }
    });

    console.log('✅ Tokens inicializados com sucesso no banco de dados!');
    console.log('Token expires in:', newToken.expiresIn, 'segundos (30 dias)');
    console.log('Criado em:', newToken.updatedAt.toISOString());

  } catch (error) {
    console.error('❌ Erro ao inicializar tokens:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se este arquivo for chamado diretamente
if (require.main === module) {
  initializeTokens();
}

module.exports = { initializeTokens };
