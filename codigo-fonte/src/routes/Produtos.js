// src/routes/Produtos.js
const express = require('express');
const connection = require('../db');  // Importando a conexão com o banco de dados

const router = express.Router();

// Rota GET para obter todos os produtos
router.get('/', (req, res) => {
  const query = 'SELECT * FROM produtos';  // Consulta para obter todos os produtos

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao obter produtos:', err);
      return res.status(500).send('Erro no servidor');
    }
    res.json(results);  // Envia os produtos no formato JSON
  });
});

// Rota POST para adicionar um novo produto
router.post('/', (req, res) => {
  const { nome, descricao, preco } = req.body;  // Recebe os dados do corpo da requisição

  // Consulta para inserir um novo produto
  const query = 'INSERT INTO produtos (nome, descricao, preco) VALUES (?, ?, ?)';

  connection.query(query, [nome, descricao, preco], (err, results) => {
    if (err) {
      console.error('Erro ao registrar produto:', err);
      return res.status(500).send('Erro no servidor');
    }

    console.log(`Novo produto registrado: ${nome}, ${descricao}, ${preco}`);  // Log de sucesso
    res.status(201).send('Produto registrado com sucesso!');  // Mensagem de sucesso
  });
});

module.exports = router;
