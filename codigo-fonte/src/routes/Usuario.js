const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Certifique-se de importar jwt para criar o token
const auth = require('../middlewares/Auth'); // <-- Importa o middleware de autenticação

require("dotenv").config();

const prisma = new PrismaClient();
const router = express.Router();

// Rota POST para login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await prisma.usuarios.findUnique({ where: { email } });

    if (!usuario) return res.status(400).json({ message: "Usuário não encontrado" });

    // Verifica se a senha está correta
    const isMatch = await bcrypt.compare(senha, usuario.senha);
    if (!isMatch) return res.status(400).json({ message: "Senha inválida" });

    // Gera o token JWT
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome }, // Aqui estamos incluindo o id do usuário
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Define o tempo de expiração do token
    );

    // Envia o token via cookie
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    res.json({ message: 'Login bem-sucedido', usuario });
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    res.status(500).send('Erro no servidor');
  }
});

// Rota GET para obter todos os usuários
router.get('/', async (req, res) => {
  try {
    const usuarios = await prisma.usuarios.findMany({
      select: {
        id: true,
        nome: true,
        sobrenome: true,
        dataNascimento: true,
        endereco: true,
        email: true,
        telefone: true,
        posicao: true,
      },
    });
    res.json(usuarios);
  } catch (err) {
    console.error('Erro ao obter usuários:', err);
    res.status(500).send('Erro na rota GET /usuario. Erro de servidor');
  }
});

// Rota POST para adicionar um novo usuário
router.post('/', async (req, res) => {
  const { nome, sobrenome, dataNascimento, endereco, email, telefone, senha, posicao } = req.body;

  if (!dataNascimento || isNaN(Date.parse(dataNascimento))) {
    return res.status(400).json({ message: 'Data de nascimento inválida' });
  }

  // Converte a dataNascimento para o formato ISO-8601
  const dataNascimentoISO = new Date(dataNascimento).toISOString();

  // Verifica se o e-mail enviado já foi cadastrado anteriormente
  const existingUser = await prisma.usuarios.findUnique({ where: { email } });
  if (existingUser) return res.status(400).json({ message: "E-mail já cadastrado" });

  try {
    // Encripta a senha
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(senha, salt);

    const novoUsuario = await prisma.usuarios.create({
      data: {
        nome,
        sobrenome,
        dataNascimento: dataNascimentoISO, // Usando a data no formato correto
        endereco,
        email,
        telefone,
        senha: hashedPassword,
        posicao: posicao || "USER",
      },
    });

    console.log(`Novo usuário registrado: ${nome}, ${email}`);
    res.status(201).json({ message: 'Usuário registrado com sucesso!', usuario: novoUsuario });
  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    res.status(500).send('Erro no servidor');
  }
});

// Rota PUT para atualizar um usuário existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, sobrenome, dataNascimento, endereco, email, telefone, senha, posicao } = req.body;

  // Converte o id para inteiro
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  if (dataNascimento && isNaN(Date.parse(dataNascimento))) {
    return res.status(400).json({ message: 'Data de nascimento inválida' });
  }

  // Converte a dataNascimento para o formato ISO-8601, caso fornecida
  const dataNascimentoISO = dataNascimento ? new Date(dataNascimento).toISOString() : undefined;

  try {
    const usuarioExistente = await prisma.usuarios.findUnique({ where: { id: parsedId } });
    if (!usuarioExistente) return res.status(404).json({ message: "Usuário não encontrado" });

    // Encripta a senha se ela foi fornecida
    const hashedPassword = senha ? await bcrypt.hash(senha, 12) : usuarioExistente.senha;

    const usuarioAtualizado = await prisma.usuarios.update({
      where: { id: parsedId },
      data: {
        nome,
        sobrenome,
        dataNascimento: dataNascimentoISO, // Usando a data no formato correto
        endereco,
        email,
        telefone,
        senha: hashedPassword,
        posicao,
      },
    });

    console.log(`Usuário atualizado: ${nome}, ${email}`);
    res.json({ message: 'Usuário atualizado com sucesso!', usuario: usuarioAtualizado });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).send('Erro no servidor');
  }
});

// Rota DELETE para remover um usuário existente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Converte o id para inteiro
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const usuarioExistente = await prisma.usuarios.findUnique({ where: { id: parsedId } });
    if (!usuarioExistente) return res.status(404).json({ message: "Usuário não encontrado" });

    await prisma.usuarios.delete({ where: { id: parsedId } });
    console.log(`Usuário excluído: ID ${parsedId}`);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    res.status(500).send('Erro no servidor');
  }
});

// Rota GET para obter os dados do usuário logado (precisa de autenticação)
router.get('/conta', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.usuarios.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        sobrenome: true,
        email: true,
        telefone: true,
        endereco: true,
        dataNascimento: true,
        posicao: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar conta do usuário:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;
