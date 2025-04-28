const request = require("supertest");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const login = require("./Login");

process.env.JWT_SECRET = "secret123";

// Mock PrismaClient
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    usuarios: {
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// App de teste com rota de login
const app = express();
app.use(express.json());
app.post("/login", login);

describe("Login Route", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deve autenticar com sucesso", async () => {
    const mockUser = {
      id: 1,
      email: "teste@example.com",
      senha: await bcrypt.hash("senha123", 10),
      posicao: "USER",
    };

    prisma.usuarios.findUnique.mockResolvedValue(mockUser);
    const signSpy = jest.spyOn(jwt, "sign").mockReturnValue("token123");

    const res = await request(app).post("/login").send({
      email: "teste@example.com",
      senha: "senha123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      msg: "Autenticação realizada com sucesso",
      token: "token123",
    });

    signSpy.mockRestore();
  });

  it("deve retornar erro se usuário não for encontrado", async () => {
    prisma.usuarios.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/login").send({
      email: "naoexiste@example.com",
      senha: "qualquer",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("E-mail ou senha inválidos");
  });

  it("deve retornar erro se a senha estiver errada", async () => {
    const mockUser = {
      id: 1,
      email: "teste@example.com",
      senha: await bcrypt.hash("senhaCorreta", 10),
      posicao: "USER",
    };

    prisma.usuarios.findUnique.mockResolvedValue(mockUser);

    const res = await request(app).post("/login").send({
      email: "teste@example.com",
      senha: "senhaErrada",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("E-mail ou senha inválidos");
  });

  it("deve retornar erro 500 em falha interna", async () => {
    prisma.usuarios.findUnique.mockImplementation(() => {
      throw new Error("Erro inesperado");
    });

    const res = await request(app).post("/login").send({
      email: "teste@example.com",
      senha: "senha123",
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Erro ao fazer login");
  });
});