// src/routes/Produtos.js
const express = require('express');
const { PrismaClient, Ocasiao } = require('@prisma/client');
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
        precoPromocional: true,
        imagem: true,
        quantidade: true,
        cor: true,
        tamanho: true,
        categoria: true,
        ocasiao: true,
      },
    });
    res.json(produtos);
  } catch (error) {
    console.error("Erro detalhado:", error);
    res.status(500).json({ error: 'Erro ao buscar produtos', details: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const produto = await prisma.produtos.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        descricao: true,
        preco: true,
        precoPromocional: true,
        imagem: true,
        quantidade: true,
        cor: true,
        tamanho: true,
        categoria: true,
        ocasiao: true,
      },
    });
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(produto);
  } catch (error) {
    console.error("Erro detalhado:", error);
    res.status(500).json({ error: 'Erro ao buscar o produto', details: error.message });
  }
});


// POST 
router.post('/', AuthAdmin, async (req, res) => {
  const {
    nome,
    descricao,
    preco,
    precoPromocional,
    imagem,
    quantidade,
    tamanho,
    cor,
    categoria,
    ocasiao
  } = req.body;

  console.log('req.body.image: ', req.body.imagem);
  if (!nome || preco == null || !imagem || quantidade == null || !tamanho || !cor || !categoria) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  const data = {
    nome,
    descricao: descricao || null,          
    preco: parseFloat(preco),
    imagem,
    quantidade: parseInt(quantidade, 10),
    tamanho,
    cor,
    categoria,
    precoPromocional: null,                  
    ocasiao: null                            
  };

  console.log('Dados do produto da imagem: ', data.imagem);

  if (req.body.hasOwnProperty('precoPromocional')) {
    data.precoPromocional = precoPromocional != null
      ? parseFloat(precoPromocional)
      : null;
  }

  if (req.body.hasOwnProperty('ocasiao')) {
    if (ocasiao == null || ocasiao === '') {
      data.ocasiao = null;
    } else {
      const ocasiaoFormatado = String(ocasiao).toUpperCase();

      if (!Object.values(Ocasiao).includes(ocasiaoFormatado)) {
        return res.status(400).json({ error: 'Ocasiao inválido.' });
      }
      data.ocasiao = ocasiaoFormatado;
    }
  }

  try {
    const novoProduto = await prisma.produtos.create({ data });
    return res.status(201).json(novoProduto);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return res.status(500).json({ error: 'Erro ao criar produto.' });
  }
});


// PUT - Atualizar produto
router.put('/:id', AuthAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    nome,
    descricao,
    preco,
    precoPromocional,
    imagem,
    quantidade,
    tamanho,
    cor,
    categoria,
    ocasiao
  } = req.body;

  try {
    const existente = await prisma.produtos.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const dataToUpdate = {};

    if (nome !== undefined) dataToUpdate.nome = nome;
    if (descricao !== undefined) dataToUpdate.descricao = descricao;
    if (preco !== undefined) dataToUpdate.preco = parseFloat(preco);
    if (precoPromocional !== undefined) dataToUpdate.precoPromocional = parseFloat(precoPromocional);
    if (imagem !== undefined) dataToUpdate.imagem = imagem;
    if (quantidade !== undefined) dataToUpdate.quantidade = parseInt(quantidade, 10);
    if (tamanho !== undefined) dataToUpdate.tamanho = tamanho;
    if (cor !== undefined) dataToUpdate.cor = cor;
    if (categoria !== undefined) dataToUpdate.categoria = categoria;
    if (ocasiao !== undefined) dataToUpdate.ocasiao = ocasiao;

    const atualizado = await prisma.produtos.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.json(atualizado);
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    return res.status(500).json({ error: 'Erro interno', details: err.message });
  }
});


// DELETE - Excluir produto
router.delete('/:id', AuthAdmin, async (req, res) => {
  const { id } = req.params;
  console.log(`Requisição DELETE recebida para o ID: ${id}`);

  try {
    const produtoExistente = await prisma.produtos.findUnique({
      where: { id },
    });

    if (!produtoExistente) {
      console.log('Produto não encontrado no banco de dados.');
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    console.log('Produto encontrado:', produtoExistente);

    await prisma.produtos.delete({
      where: { id },
    });

    console.log('Produto excluído com sucesso.');
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
});


module.exports = router;
