// src/routes/Produtos.js
const express = require('express');
const { PrismaClient, Ocasiao } = require('@prisma/client');
const AuthAdmin = require('../middlewares/AuthAdmin'); // Importa o middleware AuthAdmin
const { deleteImageVersionsFromS3 } = require('../services/s3Service.js');

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

// GET - Produtos paginados
router.get('/estoque/paginated', AuthAdmin, async (req, res) => {
  // Pega os parâmetros da URL, com valores padrão de página 1 e limite 10
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Busca os produtos e o total de produtos em duas chamadas paralelas
    const [produtos, totalProdutos] = await prisma.$transaction([
      prisma.produtos.findMany({
        skip: skip,
        take: limit,
        orderBy: { nome: 'asc' },
        include: {
          imagens: {
            orderBy: { posicao: 'asc' },
            take: 1, // Pega apenas a imagem principal para a tabela
          },
        },
      }),
      prisma.produtos.count(),
    ]);

    res.json({
      produtos,
      totalPages: Math.ceil(totalProdutos / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Erro ao buscar produtos paginados:", error);
    res.status(500).json({ error: "Erro ao buscar produtos." });
  }
});

// GET - Obter produto por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const produto = await prisma.produtos.findUnique({
      where: { id },
      include: {
        imagens: {
          // Ordena para garantir que a imagem principal (posição 0) venha primeiro
          orderBy: {
            posicao: 'asc',
          },
        }
      }
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
  // Removemos 'imagem' da desestruturação, pois ela não é mais um campo editável aqui
  const {
    nome,
    descricao,
    preco,
    precoPromocional,
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

    // A lógica para atualizar as imagens é mais complexa (deletar as antigas, fazer novo upload, etc.)
    // e deve ser tratada em uma rota separada. Por enquanto, esta rota atualizará apenas os dados de texto.
    const dataToUpdate = {
      nome,
      descricao,
      preco: preco ? parseFloat(preco) : undefined,
      precoPromocional: precoPromocional !== undefined ? (precoPromocional ? parseFloat(precoPromocional) : null) : undefined,
      quantidade: quantidade ? parseInt(quantidade, 10) : undefined,
      tamanho,
      cor,
      categoria,
      ocasiao,
    };

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
  
  try {
    // 1. Primeiro, buscamos o produto E as imagens relacionadas que precisam ser deletadas.
    const produtoParaDeletar = await prisma.produtos.findUnique({
      where: { id },
      include: {
        imagens: true, // Crucial: precisamos das informações das imagens
      },
    });

    if (!produtoParaDeletar) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // 2. Se o produto tiver imagens, deletamos cada uma do S3.
    if (produtoParaDeletar.imagens && produtoParaDeletar.imagens.length > 0) {
      // Importe o seu s3Service no topo do arquivo se ainda não o fez
      // const { deleteImageVersionsFromS3 } = require('../services/s3Service.js');
      
      console.log(`Deletando ${produtoParaDeletar.imagens.length} imagem(ns) do S3...`);
      // Criamos uma promessa para cada deleção de imagem
      const deletePromises = produtoParaDeletar.imagens.map(imagem => 
        deleteImageVersionsFromS3(imagem.urls)
      );
      // Esperamos que todas as imagens sejam deletadas do S3
      await Promise.all(deletePromises);
    }

    // 3. Finalmente, após limpar o S3, deletamos o produto do banco de dados.
    // A deleção em cascata do Prisma já cuidará de remover os registros da tabela 'produto_imagens'.
    await prisma.produtos.delete({
      where: { id },
    });

    console.log('Produto e imagens associadas foram excluídos com sucesso.');
    res.status(204).send(); // Resposta de sucesso sem conteúdo

  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
});


module.exports = router;
