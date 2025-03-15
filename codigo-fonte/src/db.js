// src/db.js
const mysql = require('mysql2');

// Configuração da conexão com o banco de dados
const connection = mysql.createConnection({
  host: 'localhost', // ou o host onde seu MySQL está
  user: 'root', // seu usuário do MySQL
  password: 'Xr8!w2Qs9$kP', // sua senha do MySQL
  database: 'confraria_vintage', // nome do banco de dados que você está usando
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar no banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados.');
  }
});

module.exports = connection;
