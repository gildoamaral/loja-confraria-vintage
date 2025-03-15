// server.js
const express = require('express');
const Usuario = require('./src/routes/Usuario'); // Importa as rotas de usuário
const Produtos = require('./src/routes/Produtos'); // Importa as rotas de produtos

const app = express();

// Middleware para processar JSON
app.use(express.json());

// Usando as rotas com prefixo '/usuarios' e '/produtos'
app.use('/usuarios', Usuario);
app.use('/produtos', Produtos);  // Rota para produtos

// Rota inicial
app.get('/', (req, res) => {
  res.send('Servidor rodando...');
});

// Define a porta a partir da variável de ambiente do Heroku ou usa 3030 localmente
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
