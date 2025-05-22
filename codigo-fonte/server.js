require('dotenv').config();
const cors = require('cors');
const express = require('express');
const Usuario = require('./src/routes/Usuario'); // Importa as rotas de usuário
const Produtos = require('./src/routes/Produtos'); // Importa as rotas de produtos
const Pagamentos = require('./src/routes/Pagamentos');
const Pedidos = require('./src/routes/Pedidos');
const Login = require('./src/routes/Login')
const auth = require('./src/middlewares/Auth'); // Importa o middleware de autenticação
const authAdmin = require('./src/middlewares/AuthAdmin'); // Importa o middleware de autenticação de administrador
const cookieParser = require("cookie-parser");

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();


app.use(cors({
  origin: process.env.CORS_ORIGIN,   // <--- Colocar o link do fron no .env
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"]
}));
app.use(express.json({
  limit: '50mb'
}));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 100000
}));
app.use(cookieParser());

// ROTAS PÚBLICAS
app.get('/', (req, res) => { res.send('Servidor rodando...'); });
app.use('/usuarios', Usuario);
app.use('/produtos', Produtos);
app.use('/pagamentos', auth, Pagamentos);
app.post('/login', Login)
app.use('/pedidos', Pedidos);

// ROTAS PRIVADAS
//  //  Área de usuário
app.get("/user/:id", auth, async (req, res) => {
  const id = req.params.id;

  //Verificar se o User existe
  const user = await prisma.usuarios.findUnique({
    where: { id },
  });

  if (user) {
    // Remove o campo senha do objeto user
    const { senha, ...userWithoutPassword } = user;

    res.json({ message: "Perfil acessado!", user: userWithoutPassword });
  } else {
    res.status(404).json({ message: "Usuário não encontrado" });
  }
});

//  //  Área de administrador
app.get("/admin/:id", authAdmin, async (req, res) => {
  const id = req.params.id;

  //Verificar se o User existe
  const user = await prisma.usuarios.findUnique({
    where: { id },
  });

  if (user) {
    // Remove o campo senha do objeto user
    const { senha, ...userWithoutPassword } = user;

    res.json({ message: "Perfil ADM acessado!", user: userWithoutPassword });
  } else {
    res.status(404).json({ message: "Usuário não encontrado" });
  }
});

// Define a porta a partir da variável de ambiente do Heroku ou usa 3030 localmente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});