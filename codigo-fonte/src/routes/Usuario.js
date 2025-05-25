const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require('../middlewares/Auth');

require("dotenv").config();

const prisma = new PrismaClient();
const router = express.Router();

// Rota POST para login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await prisma.usuarios.findUnique({ where: { email } });

    if (!usuario) return res.status(400).json({ message: "Usuário não encontrado" });

    const isMatch = await bcrypt.compare(senha, usuario.senha);
    if (!isMatch) return res.status(400).json({ message: "Senha inválida" });

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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

  const dataNascimentoISO = new Date(dataNascimento).toISOString();

  const existingUser = await prisma.usuarios.findUnique({ where: { email } });
  if (existingUser) return res.status(400).json({ message: "E-mail já cadastrado" });

  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(senha, salt);

    const novoUsuario = await prisma.usuarios.create({
      data: {
        nome,
        sobrenome,
        dataNascimento: dataNascimentoISO,
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

// Rota PUT para atualizar dados do usuário logado
router.put('/conta', auth, async (req, res) => {
  const userId = req.user.userId;
  const { nome, sobrenome, dataNascimento, endereco, email, telefone, senha, posicao } = req.body;

  if (dataNascimento && isNaN(Date.parse(dataNascimento))) {
    return res.status(400).json({ message: 'Data de nascimento inválida' });
  }

  const dataNascimentoISO = dataNascimento ? new Date(dataNascimento).toISOString() : undefined;

  try {
    const usuarioExistente = await prisma.usuarios.findUnique({ where: { id: userId } });
    if (!usuarioExistente) return res.status(404).json({ message: "Usuário não encontrado" });

    const hashedPassword = senha ? await bcrypt.hash(senha, 12) : usuarioExistente.senha;

    const usuarioAtualizado = await prisma.usuarios.update({
      where: { id: userId },
      data: {
        nome,
        sobrenome,
        dataNascimento: dataNascimentoISO,
        endereco,
        email,
        telefone,
        senha: hashedPassword,
        posicao,
      },
    });

    res.json({ message: 'Usuário atualizado com sucesso!', usuario: usuarioAtualizado });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).send('Erro no servidor');
  }
});

// Rota DELETE para remover um usuário existente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

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

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Deslogado com sucesso" });
});

module.exports = router;
