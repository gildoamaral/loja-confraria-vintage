const express = require('express');
const Usuario = require('./src/routes/Usuario');
const Produtos = require('./src/routes/Produtos');

const app = express();

app.use(express.json());

app.use('/', Usuario )
app.use('/', Produtos )


app.listen(3030, () => {
  console.log('Servidor rodando em http://localhost:3030');
});

module.exports = app;