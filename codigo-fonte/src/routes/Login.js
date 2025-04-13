const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
require("dotenv").config();

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verifica se o usuário existe
    const user = await prisma.usuarios.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "E-mail ou senha inválidos" });

    // Compara as senhas
    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) return res.status(400).json({ message: "E-mail ou senha inválidos" });
  
    // Gera o token JWT
    const token = jwt.sign(
      { userId: user.id, posicao: user.posicao }, 
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // só funciona com HTTPS
      sameSite: "Strict", // ou "Lax" se tiver domínio diferente
      maxAge: 60 * 60 * 1000 // 1 hora
    });

    res.status(200).json({ msg: "Autenticação realizada com sucesso"});

  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer login" });
  }
};

module.exports = login;
