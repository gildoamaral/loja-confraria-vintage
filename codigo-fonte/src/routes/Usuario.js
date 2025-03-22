// src/routes/Usuario.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const router = express.Router();

// Rota GET para obter todos os usuários
router.get('/', async (req, res) => {

  try {

    const usuarios = await prisma.usuarios.findMany();
    res.json(usuarios);

  } catch (err) {

    console.error('Erro ao obter usuários:', err);
    res.status(500).send('Erro na rota GET /usuario. Erro de servidor');

  }

});

// Rota POST para adicionar um novo usuário
router.post('/', async (req, res) => {


  const { nome, email, senha } = req.body;

  // Verifica se o e-mail enviado já foi cadastrado anteriormente
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.status(400).json({ message: "E-mail já cadastrado" });

  // Encripta a senha
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  
  try {
    const novoUsuario = await prisma.usuarios.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
      },
    });

    console.log(`Novo usuário registrado: ${nome}, ${email}`);
    res.status(201).send('Usuário registrado com sucesso!');

  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    res.status(500).send('Erro no servidor');
  }

});

module.exports = router;
