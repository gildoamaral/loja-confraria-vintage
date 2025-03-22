// src/routes/Produtos.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();
//GET
router.get('/', async (req, res) => {
  try {
    const produtos = await prisma.produtos.findMany({
      select: {
        id: true,
        nome: true,
        preco: true,
        imagem: true,
        quantidade: true,
      },
    });
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// POST - Criar produto
router.post('/', async (req, res) => {
  const { nome, descricao, preco, imagem, quantidade } = req.body;

  if (!nome || !preco || !imagem || quantidade === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  try {
    const novoProduto = await prisma.produtos.create({
      data: {
        nome,
        descricao,
        preco,
        imagem,
        quantidade,
      },
    });
    res.status(201).json(novoProduto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// PUT - Atualizar produto
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
