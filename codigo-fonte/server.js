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
const { getValidAccessToken } = require('./src/services/melhorEnvioAuthService.js');
const uploadRouter = require('./src/routes/upload.routes.js');
const carrosselRouter = require('./src/routes/carrossel.routes.js');
const sobreRouter = require('./src/routes/sobre.routes.js');
const adminRoutes = require('./src/routes/Admin');
const freteRoutes = require('./src/routes/freteRoutes.js');
const melhorEnvioTokenRoutes = require('./src/routes/melhorEnvioTokenRoutes.js');
const path = require('path');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();

if (process.env.NODE_ENV !== 'production') {
app.use(cors({
  origin: process.env.CORS_ORIGIN,  
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"]
}));
}
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
app.get('/api', (req, res) => { res.send('Servidor rodando...'); });
app.use('/api/usuarios', Usuario);
app.use('/api/produtos', Produtos);
app.use('/api/pagamentos', Pagamentos);
app.post('/api/login', Login)
app.use('/api/pedidos', Pedidos);
app.use('/api/auth', Check);
app.use('/api/api/upload', uploadRouter);
app.use('/api/api/auth', require('./src/routes/authRoutes')); // Rotas de autenticação
app.use('/api/api/cart', require('./src/routes/cartRoutes')); // Rotas do carrinho
app.use('/api/api/carrossel', carrosselRouter);
app.use('/api/api/sobre', sobreRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/api/frete', freteRoutes);
app.use('/api/api/melhor-envio-token', melhorEnvioTokenRoutes);

app.get("/api/verify-email/:token", async (req, res) => {
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

app.post('/api/frete', async (req, res) => {
  const { cepDestino, altura, largura, comprimento, peso } = req.body;
  
  if (!cepDestino) {
    return res.status(400).json({ error: 'Informe o CEP de destino.' });
  }
  
  try {
    // Obter token válido do banco de dados
    const accessToken = await getValidAccessToken();
    
    const response = await axios.post(
      `${process.env.MELHOR_ENVIO_ORIGIN}/api/v2/me/shipment/calculate`,
      {
        from: { postal_code: '45820440' }, // CEP de origem
        to: { postal_code: cepDestino },
        products: [
          {
            height: altura || 10,
            width: largura || 30,
            length: comprimento || 20,
            weight: peso || 0.3,
          }
        ],
        "services": "1,2,3"
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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

const distPath = path.join(__dirname, 'Front', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});


module.exports = app; // Exporta o app para testes