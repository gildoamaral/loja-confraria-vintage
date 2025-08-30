// routes/freteRoutes.js

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { escolherEmbalagem } from '../services/freteService.js';
// Supondo que você tenha um serviço para se comunicar com a API do Melhor Envio
// import { calcularFreteMelhorEnvio } from '../services/melhorEnvioService.js';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/calcular', async (req, res) => {
  const { itens, cepDestino } = req.body; // Esperamos um array de itens e o CEP

  if (!itens || !Array.isArray(itens) || itens.length === 0 || !cepDestino) {
    return res.status(400).json({ error: 'Dados inválidos. Forneça "itens" e "cepDestino".' });
  }

  try {
    // 1. Buscar os dados completos dos produtos no banco
    const idsProdutos = itens.map(item => item.produtoId);
    const produtosDoBanco = await prisma.produtos.findMany({
      where: {
        id: { in: idsProdutos },
      },
    });

    // Mapear para ter acesso fácil por ID
    const produtosMap = new Map(produtosDoBanco.map(p => [p.id, p]));

    const itensCompletos = itens.map(item => {
      const produto = produtosMap.get(item.produtoId);
      if (!produto) {
        throw new Error(`Produto com ID ${item.produtoId} não encontrado.`);
      }
      return {
        ...item,
        produto, // Anexa os dados completos do produto
      };
    });

    // 2. Usar nosso serviço para escolher a embalagem e calcular o peso
    const { embalagemEscolhida, pesoTotal } = escolherEmbalagem(itensCompletos);

    // 3. (AQUI VOCÊ CHAMA A API DO MELHOR ENVIO)
    // Os dados que você vai enviar para o Melhor Envio são:
    const dadosParaMelhorEnvio = {
      cepOrigem: "45820-440",
      cepDestino: cepDestino,
      peso: pesoTotal, // 
      altura: embalagemEscolhida.altura, // 
      largura: embalagemEscolhida.largura,
      comprimento: embalagemEscolhida.comprimento, // 
    };

    console.log("Enviando para Melhor Envio:", dadosParaMelhorEnvio);
    
    // const opcoesDeFrete = await calcularFreteMelhorEnvio(dadosParaMelhorEnvio);
    
    // MOCK DE RESPOSTA (substitua pela chamada real)
    const opcoesDeFrete = [
        { nome: "SEDEX", valor: 35.50, prazo: 3 },
        { nome: "PAC", valor: 22.90, prazo: 7 },
    ];


    res.status(200).json(opcoesDeFrete);

  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    res.status(500).json({ error: error.message || 'Erro interno no servidor.' });
  }
});

export default router;