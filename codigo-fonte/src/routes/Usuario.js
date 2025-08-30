const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require('../middlewares/Auth');
const authAdmin = require('../middlewares/AuthAdmin');
const crypto = require("crypto");
const sendVerificationEmail = require('../utils/SendVerificationEmail');
const sendPassResetEmail = require('../utils/SendPassResetEmail');

require("dotenv").config();

const prisma = new PrismaClient();
const router = express.Router();


// GET USUARIOS
router.get('/', async (req, res) => {
  try {
    const usuarios = await prisma.usuarios.findMany({
      select: {
        id: true,
        nome: true,
        sobrenome: true,
        dataNascimento: true,
        endereco: true,
        email: true,
        ddd: true,
        telefone: true,
        posicao: true,
      },
    });
    res.json(usuarios);
  } catch (err) {
    console.error('Erro ao obter usuários:', err);
    res.status(500).send('Erro na rota GET /usuario. Erro de servidor');
  }
});

// CREATE USUARIO
router.post('/', async (req, res) => {
  const {
    nome, sobrenome, dataNascimento, cpf, endereco,
    rua, numero, complemento, bairro, cidade, estado, cep,
    email, ddd, telefone, senha, posicao
  } = req.body;

  if (!dataNascimento || isNaN(Date.parse(dataNascimento))) {
    return res.status(400).json({ message: 'Data de nascimento inválida' });
  }

  const dataNascimentoISO = new Date(dataNascimento).toISOString();

  const existingUser = await prisma.usuarios.findUnique({ where: { email } });
  if (existingUser) return res.status(400).json({ message: "E-mail já cadastrado" });

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(senha, salt);

  // const token = crypto.randomBytes(32).toString("hex");
  // const tokenExpires = new Date(Date.now() + 1000 * 60 * 60);
  try {
    const novoUsuario = await prisma.usuarios.create({
      data: {
        nome,
        sobrenome,
        dataNascimento: dataNascimentoISO,
        cpf: cpf || null,
        endereco,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        email,
        ddd: ddd || null,
        telefone,
        senha: hashedPassword,
        posicao: posicao || "USER",
        // emailVerifyToken: token,
        // emailTokenExpires: tokenExpires,
      },
    });

    // const link = `http://localhost:3000/verify-email/${token}`;
    // const link = `${process.env.BACK_ORIGIN}/verify-email/${token}`;
    // await sendVerificationEmail(email, link);

    console.log(`Novo usuário registrado: ${nome}, ${email}`);
    res.status(201).json({ message: 'Usuário registrado com sucesso!', usuario: novoUsuario });
  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    res.status(500).send('Erro no servidor');
  }
});

// UPDATE USUARIO
router.put('/conta', auth, async (req, res) => {
  const userId = req.user.userId;
  const {
    nome, sobrenome, dataNascimento, cpf, endereco,
    rua, numero, complemento, bairro, cidade, estado, cep,
    email, ddd, telefone, senha, posicao
  } = req.body;

  if (dataNascimento && isNaN(Date.parse(dataNascimento))) {
    return res.status(400).json({ message: 'Data de nascimento inválida' });
  }

  const dataNascimentoISO = dataNascimento ? new Date(dataNascimento).toISOString() : undefined;

  try {
    const usuarioExistente = await prisma.usuarios.findUnique({ where: { id: userId } });
    if (!usuarioExistente) return res.status(404).json({ message: "Usuário não encontrado" });

    const hashedPassword = senha ? await bcrypt.hash(senha, 12) : usuarioExistente.senha;

    const usuarioAtualizado = await prisma.usuarios.update({
      where: { id: userId },
      data: {
        nome,
        sobrenome,
        dataNascimento: dataNascimentoISO,
        cpf: cpf || null,
        endereco,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        email,
        ddd: ddd || null,
        telefone,
        senha: hashedPassword,
        posicao,
      },
    });

    res.json({ message: 'Usuário atualizado com sucesso!', usuario: usuarioAtualizado });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).send('Erro no servidor');
  }
});

// DELETE USUARIO
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const usuarioExistente = await prisma.usuarios.findUnique({ where: { id: parsedId } });
    if (!usuarioExistente) return res.status(404).json({ message: "Usuário não encontrado" });

    await prisma.usuarios.delete({ where: { id: parsedId } });
    console.log(`Usuário excluído: ID ${parsedId}`);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    res.status(500).send('Erro no servidor');
  }
});

// READ USUARIO BY ID
router.get('/conta', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.usuarios.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    const { senha, isEmailVerified, emailVerifyToken, emailTokenExpires, resetToken, resetTokenExpires, ...userClean } = user;
    res.json(userClean);
  } catch (error) {
    console.error('Erro ao buscar conta do usuário:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict"
  });
  res.status(200).json({ message: "Deslogado com sucesso" });
});

// READ ADMIN BY ID
router.get('/admin', authAdmin, (req, res) => {
  res.json({ isAdmin: true });
});

// ESQUECI SENHA
router.post('/esqueci-senha', async (req, res) => {
  const { email } = req.body;

  const user = await prisma.usuarios.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

  await prisma.usuarios.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpires: expiry,
    },
  });

  const resetLink = `${process.env.FRONT_ORIGIN}/resetar-senha/${token}`;
  await sendPassResetEmail(email, resetLink);

  res.json({ message: 'E-mail de redefinição enviado' });
});

// RESETAR SENHA
router.post('/resetar-senha', async (req, res) => {
  const { token, novaSenha } = req.body;

  const user = await prisma.usuarios.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: { gte: new Date() },
    },
  });

  if (!user) return res.status(400).json({ error: 'Token inválido ou expirado' });

  const senhaHash = await bcrypt.hash(novaSenha, 10);

  await prisma.usuarios.update({
    where: { id: user.id },
    data: {
      senha: senhaHash,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  res.json({ message: 'Senha redefinida com sucesso' });
});

// ROTA: /api/usuarios/dashboard
router.get("/dashboard", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [usuario, ultimoPedido] = await prisma.$transaction([
      prisma.usuarios.findUnique({
        where: { id: userId },
        select: { nome: true },
      }),
      prisma.pedidos.findFirst({
        where: {
          usuarioId: userId,
          // ADICIONE ESTE FILTRO
          NOT: {
            status: 'CARRINHO',
          },
        },
        orderBy: {
          dataFinalizado: "desc",
        },
        select: {
          id: true,
          status: true,
        },
      }),
    ]);

    if (!usuario) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    res.status(200).json({
      nomeUsuario: usuario.nome,
      ultimoPedido: ultimoPedido || null,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    res.status(500).json({ msg: "Erro no servidor." });
  }
});


// DESC: Altera a senha do usuário autenticado
router.post('/alterar-senha', auth, async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  const usuarioId = req.user.userId; // Usando a convenção que definimos

  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
  }

  try {
    // 1. Buscar o usuário no banco para pegar a senha hasheada
    const usuario = await prisma.usuarios.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 2. Comparar a senha atual fornecida com a senha armazenada
    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ message: 'A senha atual está incorreta.' });
    }

    // 3. Hashear a nova senha
    const salt = await bcrypt.genSalt(12);
    const novaSenhaHash = await bcrypt.hash(novaSenha, salt);

    // 4. Atualizar o usuário com a nova senha hasheada
    await prisma.usuarios.update({
      where: { id: usuarioId },
      data: {
        senha: novaSenhaHash,
      },
    });

    res.status(200).json({ message: 'Senha alterada com sucesso!' });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro no servidor ao tentar alterar a senha.' });
  }
});

module.exports = router;

