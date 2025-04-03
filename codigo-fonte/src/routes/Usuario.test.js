const request = require('supertest');
const express = require('express');
const router = require('./Usuario');
const bcrypt = require('bcryptjs');

// filepath: c:\Programming\PUC\Confraria\pmv-ads-2025-1-e5-proj-empext-t4-g3\codigo-fonte\src\routes\Usuario.test.js

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    usuarios: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create an Express app for testing
const app = express();
app.use(express.json());
app.use('/usuario', router);

describe('Usuario Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /usuario', () => {
    it('should fetch all users', async () => {
      const mockUsers = [
        { id: 1, nome: 'John', sobrenome: 'Doe', email: 'john@example.com' },
      ];
      prisma.usuarios.findMany.mockResolvedValue(mockUsers);

      const res = await request(app).get('/usuario');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUsers);
      expect(prisma.usuarios.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /usuario', () => {
    it('should create a new user', async () => {
      const newUser = {
        nome: 'Jane',
        sobrenome: 'Doe',
        dataNascimento: '1990-01-01', // Ensure this is a valid ISO-8601 date string
        endereco: '123 Street',
        email: 'jane@example.com',
        telefone: '123456789',
        senha: 'password123',
        posicao: 'USER',
      };
      const hashedPassword = await bcrypt.hash(newUser.senha, 12);
      const createdUser = { ...newUser, id: 1, senha: hashedPassword };
      prisma.usuarios.findUnique.mockResolvedValue(null);
      prisma.usuarios.create.mockResolvedValue(createdUser);

      const res = await request(app).post('/usuario').send(newUser);
      expect(res.status).toBe(201);
      expect(res.body.usuario).toEqual(createdUser);
      expect(prisma.usuarios.findUnique).toHaveBeenCalledWith({
        where: { email: newUser.email },
      });
      expect(prisma.usuarios.create).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if email already exists', async () => {
      jest.setTimeout(10000); // Increase timeout to 10 seconds

      prisma.usuarios.findUnique.mockResolvedValue({ id: 1 });

      const res = await request(app).post('/usuario').send({
        nome: 'Jane',
        sobrenome: 'Doe',
        dataNascimento: '1990-01-01',
        endereco: '123 Street',
        email: 'existing@example.com',
        telefone: '123456789',
        senha: 'password123',
        posicao: 'USER',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('E-mail já cadastrado');
    });
  });

  describe('PUT /usuario/:id', () => {
    it('should update an existing user', async () => {
      const updatedUser = {
        nome: 'Updated',
        sobrenome: 'User',
        email: 'updated@example.com',
      };
      prisma.usuarios.findUnique.mockResolvedValue({ id: 1 });
      prisma.usuarios.update.mockResolvedValue({ id: 1, ...updatedUser });

      const res = await request(app).put('/usuario/1').send(updatedUser);
      expect(res.status).toBe(200);
      expect(res.body.usuario).toEqual({ id: 1, ...updatedUser });
      expect(prisma.usuarios.update).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if user not found', async () => {
      prisma.usuarios.findUnique.mockResolvedValue(null);

      const res = await request(app).put('/usuario/1').send({});
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Usuário não encontrado');
    });
  });

  describe('DELETE /usuario/:id', () => {
    it('should delete a user', async () => {
      prisma.usuarios.findUnique.mockResolvedValue({ id: 1 });
      prisma.usuarios.delete.mockResolvedValue({ id: 1 });

      const res = await request(app).delete('/usuario/1');
      expect(res.status).toBe(204);
      expect(prisma.usuarios.delete).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if user not found', async () => {
      prisma.usuarios.findUnique.mockResolvedValue(null);

      const res = await request(app).delete('/usuario/1');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Usuário não encontrado');
    });
  });
});