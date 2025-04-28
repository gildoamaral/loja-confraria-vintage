// src/routes/Produtos.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const AuthAdmin = require('../middlewares/AuthAdmin'); // Importa o middleware AuthAdmin

const prisma = new PrismaClient();
const router = express.Router();

// GET - Obter todos os produtos
router.get('/', async (req, res) => {
  try {
    const produtos = await prisma.produtos.findMany({
      select: {
        id: true,
        nome: true,
        descricao: true,
        preco: true,
        imagem: true,
        quantidade: true,
        cor: true,
        tamanho: true
      },
    });
    res.json(produtos);
  } catch (error) {
    console.error("Erro detalhado:", error); 
    res.status(500).json({ error: 'Erro ao buscar produtos', details: error.message });
  }
});

// Obter produto especifico
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const produto = await prisma.produtos.findUnique({
      where: {
        id: String(id),
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        preco: true,
        imagem: true,
        quantidade: true,
        cor: true,
        tamanho: true
      },
    });

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(produto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar o produto' });
  }
});


// POST 
router.post('/', /*AuthAdmin,*/ async (req, res) => {
  const { nome, descricao, preco, imagem, quantidade, tamanho, cor } = req.body;

  if (!nome || !preco || !imagem || quantidade === undefined || !tamanho || !cor) {
    return res.status(400).json({ 
      error: 'Campos obrigatórios faltando: nome, preco, imagem, quantidade, tamanho ou cor' 
    });
  }

  const tamanhosValidos = ['P', 'M', 'G', 'GG'];
  const coresValidas = ['VERMELHO', 'AZUL', 'AMARELO', 'VERDE', 'PRETO', 'BRANCO', 'ROSA'];

  if (!tamanhosValidos.includes(tamanho.toUpperCase())) {
    return res.status(400).json({ error: `Tamanho inválido. Valores permitidos: ${tamanhosValidos.join(', ')}` });
  }

  if (!coresValidas.includes(cor.toUpperCase())) {
    return res.status(400).json({ error: `Cor inválida. Valores permitidos: ${coresValidas.join(', ')}` });
  }

  try {
    const novoProduto = await prisma.produtos.create({
      data: {
        nome,
        descricao,
        preco,
        imagem,
        quantidade,
        tamanho: tamanho.toUpperCase(),
        cor: cor.toUpperCase(),         
      },
    });
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error("Erro detalhado:", error); 
    res.status(500).json({ error: 'Erro ao criar produto', details: error.message });
  }
});

// PUT - Atualizar produto
router.put('/:id', /*AuthAdmin,*/ async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, imagem, quantidade } = req.body;

  try {
    // Verifica se o produto existe
    const produtoExistente = await prisma.produtos.findUnique({
      where: { id },
    });

    if (!produtoExistente) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const produtoAtualizado = await prisma.produtos.update({
      where: { id },
      data: {
        nome,
        descricao,
        preco,
        imagem,
        quantidade,
      },
    });
    res.json(produtoAtualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// DELETE - Excluir produto
router.delete('/:id', /*AuthAdmin,*/ async (req, res) => {
  const { id } = req.params;

  try {
    // Verifica se o produto existe
    const produtoExistente = await prisma.produtos.findUnique({
      where: { id },
    });

    if (!produtoExistente) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    await prisma.produtos.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
});

module.exports = router;
