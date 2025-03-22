// server.js
import cors from 'cors'
import express from 'express';

import Usuario from  './src/routes/Usuario.js'
import Produtos from './src/routes/Produtos.js';

const app = express();

app.use(express.json());
app.use(cors())//Modificar posteriormesnte para o dominio


app.use('/usuarios', Usuario);
app.use('/produtos', Produtos);


app.get('/', (req, res) => {
  res.send('Servidor rodando...');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
