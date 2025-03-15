// src/routes/Usuario.js
const express = require('express');
const connection = require('../db');  // Importando a conexão com o banco de dados

const router = express.Router();

// Rota GET para obter todos os usuários
router.get('/', (req, res) => {
  const query = 'SELECT * FROM usuarios';  // Consulta para obter todos os usuários

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao obter usuários:', err);
      return res.status(500).send('Erro no servidor');
    }
    res.json(results);  // Envia os usuários no formato JSON
  });
});

// Rota POST para adicionar um novo usuário
router.post('/', (req, res) => {
  const { nome, email, senha } = req.body;  // Recebe os dados do corpo da requisição

  // Consulta para inserir um novo usuário
  const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';

  connection.query(query, [nome, email, senha], (err, results) => {
    if (err) {
      console.error('Erro ao registrar usuário:', err);
      return res.status(500).send('Erro no servidor');
    }

    console.log(`Novo usuário registrado: ${nome}, ${email}`);  // Adicionando log de sucesso

    res.status(201).send('Usuário registrado com sucesso!');
  });
});

module.exports = router;
