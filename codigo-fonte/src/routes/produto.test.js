const request = require('supertest');
const express = require('express');
const router = require('./Produtos');

// Mock do Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    produtos: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

// Mock do middleware AuthAdmin
jest.mock('../middlewares/AuthAdmin', () => (req, res, next) => next());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use('/produtos', router);

describe('Rotas de Produtos', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /produtos', () => {
    it('deve retornar todos os produtos com status 200', async () => {
      const mockProdutos = [
        { id: '1', nome: 'Camiseta', descricao: '100% algodão', preco: 59.9, imagem: 'link.jpg', quantidade: 10 },
      ];
      prisma.produtos.findMany.mockResolvedValue(mockProdutos);

      const res = await request(app).get('/produtos');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockProdutos);
      expect(prisma.produtos.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /produtos', () => {
    const novoProduto = {
      nome: 'Camiseta',
      descricao: 'Produto legal',
      preco: 49.9,
      imagem: 'img.jpg',
      quantidade: 15,
      tamanho: 'M',
      cor: 'AZUL',
    };

    it('deve criar um novo produto com status 201', async () => {
      prisma.produtos.create.mockResolvedValue({ id: '1', ...novoProduto });

      const res = await request(app).post('/produtos').send(novoProduto);
      expect(res.status).toBe(201);
      expect(res.body.nome).toBe(novoProduto.nome);
      expect(prisma.produtos.create).toHaveBeenCalledTimes(1);
    });

    it('deve retornar 400 se campos obrigatórios estiverem faltando', async () => {
      const res = await request(app).post('/produtos').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Campos obrigatórios faltando/);
    });

    it('deve retornar 400 se o tamanho for inválido', async () => {
      const produtoInvalido = { ...novoProduto, tamanho: 'XXL' };
      const res = await request(app).post('/produtos').send(produtoInvalido);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Tamanho inválido/);
    });

    it('deve retornar 400 se a cor for inválida', async () => {
      const produtoInvalido = { ...novoProduto, cor: 'LARANJA' };
      const res = await request(app).post('/produtos').send(produtoInvalido);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Cor inválida/);
    });
  });

  describe('PUT /produtos/:id', () => {
    const produtoAtualizado = {
      nome: 'Camiseta Atualizada',
      descricao: 'Nova descrição',
      preco: 79.9,
      imagem: 'nova.jpg',
      quantidade: 5,
    };

    it('deve atualizar um produto existente com status 200', async () => {
      prisma.produtos.findUnique.mockResolvedValue({ id: '1' });
      prisma.produtos.update.mockResolvedValue({ id: '1', ...produtoAtualizado });

      const res = await request(app).put('/produtos/1').send(produtoAtualizado);
      expect(res.status).toBe(200);
      expect(res.body.nome).toBe(produtoAtualizado.nome);
      expect(prisma.produtos.update).toHaveBeenCalledTimes(1);
    });

    it('deve retornar 404 se o produto não for encontrado', async () => {
      prisma.produtos.findUnique.mockResolvedValue(null);

      const res = await request(app).put('/produtos/1').send(produtoAtualizado);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Produto não encontrado');
    });
  });

  describe('DELETE /produtos/:id', () => {
    it('deve deletar um produto existente com status 204', async () => {
      prisma.produtos.findUnique.mockResolvedValue({ id: '1' });
      prisma.produtos.delete.mockResolvedValue({ id: '1' });

      const res = await request(app).delete('/produtos/1');
      expect(res.status).toBe(204);
      expect(prisma.produtos.delete).toHaveBeenCalledTimes(1);
    });

    it('deve retornar 404 se o produto não existir', async () => {
      prisma.produtos.findUnique.mockResolvedValue(null);

      const res = await request(app).delete('/produtos/1');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Produto não encontrado');
    });
  });
});
