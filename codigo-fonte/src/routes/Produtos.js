// src/routes/Produtos.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Rota GET para obter todos os produtos
router.get('/', async (req, res) => {

  try {

    const produtos = await prisma.produtos.findMany();
    res.json(produtos);

  } catch (err) {

    console.error('Erro ao obter produtos:', err);
    res.status(500).send('Erro no servidor');

  }
});


// Rota POST para adicionar um novo produto
router.post('/', async (req, res) => {
  const { nome, descricao, preco, imagem } = req.body;

  try {

    const novoProduto = await prisma.produtos.create({
      data: {
        nome,
        descricao,
        preco,
        imagem
      },
    });

    console.log(`Novo produto registrado: ${nome}, ${descricao}, ${preco}`);
    res.status(201).send('Produto registrado com sucesso!');

  } catch (err) {

    console.error('Erro ao registrar produto:', err);
    res.status(500).send('Erro no servidor');

  }
});

module.exports = router;
