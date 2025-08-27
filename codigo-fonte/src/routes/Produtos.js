// src/routes/Produtos.js
const express = require('express');
const { PrismaClient, Ocasiao } = require('@prisma/client');
const AuthAdmin = require('../middlewares/AuthAdmin'); // Importa o middleware AuthAdmin
const { deleteImageVersionsFromS3 } = require('../services/s3Service.js');

const prisma = new PrismaClient();
const router = express.Router();

// GET - Obter até 5 produtos em destaque HOMEPAGE
router.get('/destaques', async (req, res) => {
  try {
    const produtosEmDestaque = await prisma.produtos.findMany({
      where: {
        ativo: true,
        emDestaque: true, // A mágica acontece aqui!
      },
      take: 5, // Limita o resultado a no máximo 5 produtos
      include: {
        imagens: {
          orderBy: { posicao: 'asc' },
          take: 1, // Pega apenas a primeira imagem para o card
        },
      },
    });
    res.json(produtosEmDestaque);
  } catch (error) {
    console.error("Erro ao buscar produtos em destaque:", error);
    res.status(500).json({ error: "Erro ao buscar produtos em destaque." });
  }
});

// GET - Obter todos os produtos
router.get('/', async (req, res) => {
  try {
    const { includeInactive, page = 1, limit = 25, ocasiao } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Condições de filtro
    const whereConditions = {};
    
    // Filtro de produtos ativos
    if (includeInactive !== 'true') {
      whereConditions.ativo = true;
    }

    // Filtro por ocasião
    if (ocasiao) {
      if (ocasiao === 'CONFRARIA') {
        whereConditions.ocasiao = null;
      } else {
        whereConditions.ocasiao = ocasiao;
      }
    }

    const [produtos, totalProdutos] = await Promise.all([
      prisma.produtos.findMany({
        where: whereConditions,
        skip: skip,
        take: limitNum,
        include: {
          imagens: {
            orderBy: {
              posicao: 'asc',
            },
            take: 1,
          },
        },
        orderBy: { nome: 'asc' },
      }),
      prisma.produtos.count({
        where: whereConditions,
      })
    ]);

    res.json({
      produtos,
      totalPages: Math.ceil(totalProdutos / limitNum),
      currentPage: pageNum,
      totalProdutos,
      hasNextPage: pageNum < Math.ceil(totalProdutos / limitNum),
      hasPreviousPage: pageNum > 1,
    });
  } catch (error) {
    console.error("Erro ao buscar produtos com imagens:", error);
    res.status(500).json({ error: "Erro ao buscar produtos." });
  }
});

// GET - Produtos ADM ESTOQUE
router.get('/estoque/paginated', AuthAdmin, async (req, res) => {
  // Pega os parâmetros da URL, com valores padrão
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Novos parâmetros para pesquisa, filtros e ordenação
  const { 
    search, 
    categoria, 
    ocasiao, 
    ativo, 
    orderBy = 'criadoEm', 
    orderDirection = 'desc' 
  } = req.query;

  try {
    // Constrói as condições de filtro
    const whereConditions = {};
    
    // Filtro de pesquisa por nome
    if (search && search.trim()) {
      whereConditions.nome = {
        contains: search.trim()
        // Removido mode: 'insensitive' pois MySQL não suporta (já é case-insensitive por padrão)
      };
    }
    
    // Filtro por categoria
    if (categoria && categoria !== 'TODAS') {
      whereConditions.categoria = categoria;
    }
    
    // Filtro por ocasião
    if (ocasiao && ocasiao !== 'TODAS') {
      if (ocasiao === 'SEM_OCASIAO') {
        whereConditions.ocasiao = null;
      } else {
        whereConditions.ocasiao = ocasiao;
      }
    }
    
    // Filtro por status ativo
    if (ativo && ativo !== 'TODOS') {
      whereConditions.ativo = ativo === 'true';
    }

    // Constrói a ordenação
    const orderByObject = {};
    orderByObject[orderBy] = orderDirection;

    // Busca os produtos e o total de produtos em duas chamadas paralelas
    const [produtos, totalProdutos] = await prisma.$transaction([
      prisma.produtos.findMany({
        where: whereConditions,
        skip: skip,
        take: limit,
        orderBy: orderByObject,
        include: {
          imagens: {
            orderBy: { posicao: 'asc' },
            take: 1, // Pega apenas a imagem principal para a tabela
          },
        },
      }),
      prisma.produtos.count({
        where: whereConditions,
      }),
    ]);

    res.json({
      produtos,
      totalPages: Math.ceil(totalProdutos / limit),
      currentPage: page,
      totalProdutos,
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
    peso,
    altura,
    largura,
    comprimento,
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
        peso: peso ? parseFloat(peso) : null,
        altura: altura ? parseFloat(altura) : null,
        largura: largura ? parseFloat(largura) : null,
        comprimento: comprimento ? parseFloat(comprimento) : null,
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
    ativo,
    nome,
    descricao,
    preco,
    peso,
    altura,
    largura,
    comprimento,
    precoPromocional,
    quantidade,
    tamanho,
    cor,
    categoria,
    ocasiao,
    emDestaque,
  } = req.body;

  try {
    const produtoExistente = await prisma.produtos.findUnique({ where: { id } });
    if (!produtoExistente) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Verifica se a intenção é marcar o produto como destaque (de false para true)
    if (emDestaque === true && !produtoExistente.emDestaque) {
      const totalEmDestaque = await prisma.produtos.count({
        where: { emDestaque: true },
      });

      // Se já existem 5 ou mais, retorna um erro claro
      if (totalEmDestaque >= 5) {
        return res.status(400).json({ 
          error: 'Limite de 5 produtos em destaque já foi atingido. Remova o destaque de outro produto antes de adicionar este.' 
        });
      }
    }

    // A lógica para atualizar as imagens é mais complexa (deletar as antigas, fazer novo upload, etc.)
    // e deve ser tratada em uma rota separada. Por enquanto, esta rota atualizará apenas os dados de texto.
    const dataToUpdate = {
      ativo,
      nome,
      descricao,
      preco: preco ? parseFloat(preco) : undefined,
      peso: peso !== undefined ? (peso ? parseFloat(peso) : null) : undefined,
      altura: altura !== undefined ? (altura ? parseFloat(altura) : null) : undefined,
      largura: largura !== undefined ? (largura ? parseFloat(largura) : null) : undefined,
      comprimento: comprimento !== undefined ? (comprimento ? parseFloat(comprimento) : null) : undefined,
      precoPromocional: precoPromocional !== undefined ? (precoPromocional ? parseFloat(precoPromocional) : null) : undefined,
      quantidade: quantidade ? parseInt(quantidade, 10) : undefined,
      tamanho,
      cor,
      categoria,
      ocasiao,
      emDestaque
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
