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
      // "Inclua" os dados da relação 'imagens' na busca
      include: {
        imagens: {
          // Ordena para garantir que a imagem principal (posição 0) venha primeiro
          orderBy: {
            posicao: 'asc',
          },
          // Pega apenas 1 imagem. Super eficiente para a página de listagem!
          take: 1,
        },
      },
    });
    res.json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos com imagens:", error);
    res.status(500).json({ error: "Erro ao buscar produtos." });
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
  // 1. A estrutura do body agora espera um array de objetos de imagem
  const {
    nome,
    descricao,
    preco,
    quantidade,
    tamanho,
    cor,
    categoria,
    ocasiao,
    precoPromocional,
    uploadResults, // <-- MUDANÇA: Recebe o resultado completo do upload
  } = req.body;

  // 2. Validação atualizada
  if (
    !nome ||
    !preco ||
    !quantidade ||
    !uploadResults || // Verifica se os resultados do upload existem
    !Array.isArray(uploadResults) ||
    uploadResults.length === 0
  ) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes ou nenhuma imagem foi enviada.' });
  }

  try {
    // 3. Cria o produto e as imagens relacionadas com o novo formato
    const novoProduto = await prisma.produtos.create({
      data: {
        nome,
        descricao: descricao || null,
        preco: parseFloat(preco),
        quantidade: parseInt(quantidade, 10),
        tamanho,
        cor,
        categoria,
        ocasiao: ocasiao || null,
        precoPromocional: precoPromocional ? parseFloat(precoPromocional) : null,
        
        // Mágica do Prisma com o campo JSON
        imagens: {
          create: uploadResults.map((result, index) => ({
            // Para cada imagem enviada, salvamos o objeto de URLs no campo 'urls'
            urls: result.urls, // <-- MUDANÇA: Salva o objeto {thumbnail, medium, large}
            posicao: index,
          })),
        },
      },
      include: {
        imagens: true,
      },
    });

    return res.status(201).json(novoProduto);

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return res.status(500).json({ error: 'Erro interno ao criar produto.' });
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
