// src/routes/Usuario.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
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

  try {
    const novoUsuario = await prisma.usuarios.create({
      data: {
        nome,
        email,
        senha,
      },
    });

    console.log(`Novo usuário registrado: ${nome}, ${email}`);
    res.status(201).send('Usuário registrado com sucesso!');

  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    res.status(500).send('Erro no servidor');
  }

});

export default router;
