import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Usando DATABASE_URL diretamente para se conectar ao banco
const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar no banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados.');
  }
});

export default connection;
