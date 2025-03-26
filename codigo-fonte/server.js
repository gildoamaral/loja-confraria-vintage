const cors = require('cors');
const express = require('express');
const Usuario = require('./src/routes/Usuario'); // Importa as rotas de usuário
const Produtos = require('./src/routes/Produtos'); // Importa as rotas de produtos
const Login = require('./src/routes/Login')
const auth = require('./src/middlewares/Auth'); // Importa o middleware de autenticação
const authAdmin = require('./src/middlewares/AuthAdmin'); // Importa o middleware de autenticação de administrador

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json({
  limit: '50mb'
}));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 100000
}));


// ROTAS PÚBLICAS
app.get('/', (req, res) => { res.send('Servidor rodando...'); });
app.use('/usuarios', Usuario);
app.use('/produtos', Produtos);
app.post('/login', Login)

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
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});