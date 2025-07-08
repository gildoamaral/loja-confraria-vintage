require('dotenv').config();
const cors = require('cors');
const express = require('express');
const Usuario = require('./src/routes/Usuario'); // Importa as rotas de usuário
const Produtos = require('./src/routes/Produtos'); // Importa as rotas de produtos
const Pagamentos = require('./src/routes/Pagamentos');
const Pedidos = require('./src/routes/Pedidos');
const Check = require('./src/routes/Check'); // Importa as rotas de verificação
const Login = require('./src/routes/Login')
const auth = require('./src/middlewares/Auth'); // Importa o middleware de autenticação
const authAdmin = require('./src/middlewares/AuthAdmin'); // Importa o middleware de autenticação de administrador
const cookieParser = require("cookie-parser");
const { parseStringPromise } = require('xml2js');
const axios = require('axios');
const bodyParser = require('body-parser');
const uploadRouter = require('./src/routes/upload.routes.js');
const carrosselRouter = require('./src/routes/carrossel.routes.js');


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
app.use('/auth', Check);
app.use('/api', uploadRouter);
app.use('/api/auth', require('./src/routes/authRoutes')); // Rotas de autenticação
app.use('/api/cart', require('./src/routes/cartRoutes')); // Rotas do carrinho
app.use('/api/carrossel', carrosselRouter);

/*
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
*/

/*
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
*/

app.get("/verify-email/:token", async (req, res) => {
  const { token } = req.params;

  const user = await prisma.usuarios.findFirst({
    where: {
      emailVerifyToken: token,
      emailTokenExpires: { gt: new Date() },
    },
  });

  if (!user) return res.status(400).send("Token inválido ou expirado");

  await prisma.usuarios.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifyToken: null,
      emailTokenExpires: null,
    },
  });

  res.send("E-mail verificado com sucesso!");
});

app.post('/frete', async (req, res) => {
  const { cepDestino, altura, largura, comprimento, peso } = req.body;
  
  if (!cepDestino) {
    return res.status(400).json({ error: 'Informe o CEP de destino.' });
  }
  
  try {
    const response = await axios.post(
      'https://www.melhorenvio.com.br/api/v2/me/shipment/calculate',
      {
        from: { postal_code: '45820440' }, // CEP de origem
        to: { postal_code: cepDestino },
        products: [
          {
            height: altura || 4,
            width: largura || 12,
            length: comprimento || 17,
            weight: peso || 0.3,
          }
        ],
        "services": "1,2,3"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    
    res.json(response.data);
  } catch (error) {
    console.error('Erro na cotação de frete:', error.response?.data || error.message);
    res.status(500).json({ error: 'Não foi possível calcular o frete.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});