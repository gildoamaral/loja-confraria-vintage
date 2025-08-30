// routes/freteRoutes.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { escolherEmbalagem } = require('../services/freteService.js');
const { getValidAccessToken } = require('../services/melhorEnvioAuthService.js');
const axios = require('axios');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/calcular', async (req, res) => {
  const { cepDestino, userId, pedidoId } = req.body;

  if (!cepDestino) {
    return res.status(400).json({ error: 'CEP de destino é obrigatório.' });
  }

  try {
    let pedidoCarrinho;
    
    // 1. Tentativas de buscar o pedido carrinho em ordem de prioridade
    if (pedidoId) {
      // Se fornecido pedidoId específico
      pedidoCarrinho = await prisma.pedidos.findUnique({
        where: { id: pedidoId },
        include: {
          itens: {
            include: {
              produto: true
            }
          }
        }
      });
    } else if (userId) {
      // Se fornecido userId, busca o carrinho deste usuário
      pedidoCarrinho = await prisma.pedidos.findFirst({
        where: {
          usuarioId: parseInt(userId),
          status: 'CARRINHO'
        },
        include: {
          itens: {
            include: {
              produto: true
            }
          }
        },
        orderBy: {
          criadoEm: 'desc'
        }
      });
    } else {
      // Fallback: busca o último pedido em carrinho
      pedidoCarrinho = await prisma.pedidos.findFirst({
        where: {
          status: 'CARRINHO'
        },
        include: {
          itens: {
            include: {
              produto: true
            }
          }
        },
        orderBy: {
          criadoEm: 'desc'
        }
      });
    }

    if (!pedidoCarrinho || !pedidoCarrinho.itens || pedidoCarrinho.itens.length === 0) {
      return res.status(400).json({ error: 'Nenhum item encontrado no carrinho.' });
    }

    console.log(`Calculando frete para ${pedidoCarrinho.itens.length} itens`);

    // 2. Usar nosso serviço para escolher a embalagem e calcular o peso
    const { embalagemEscolhida, pesoTotal, embalagemInfo } = escolherEmbalagem(pedidoCarrinho.itens);

    console.log('Dados da embalagem:', embalagemInfo);

    // 3. Chamar a API do Melhor Envio
    const dadosParaMelhorEnvio = {
      from: { postal_code: '45820440' }, // CEP de origem
      to: { postal_code: cepDestino.replace(/\D/g, '') }, // Remove formatação do CEP
      products: [{
        height: embalagemEscolhida.altura,
        width: embalagemEscolhida.largura,
        length: embalagemEscolhida.comprimento,
        weight: pesoTotal,
      }],
      services: "1,2,3" // SEDEX, PAC, etc.
    };

    console.log("Enviando para Melhor Envio:", dadosParaMelhorEnvio);
    
    // Obter token válido do banco de dados
    const accessToken = await getValidAccessToken();
    
    const response = await axios.post(
      `${process.env.MELHOR_ENVIO_ORIGIN}/api/v2/me/shipment/calculate`,
      dadosParaMelhorEnvio,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 4. Processar e retornar as opções de frete
    const opcoesDeFrete = response.data.map(opcao => ({
      id: opcao.id,
      name: opcao.name,
      price: parseFloat(opcao.price),
      delivery_time: opcao.delivery_time,
      company: opcao.company,
      codigo: opcao.id
    }));

    console.log('Opções de frete retornadas:', opcoesDeFrete);

    res.status(200).json(opcoesDeFrete);

  } catch (error) {
    console.error('Erro ao calcular frete:', error.response?.data || error.message);
    
    // Se for erro da API do Melhor Envio, tentar retornar uma resposta mais amigável
    if (error.response?.status === 400) {
      return res.status(400).json({ 
        error: 'Não foi possível calcular o frete para este CEP. Verifique se o CEP está correto.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Erro interno no servidor ao calcular frete.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;