const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
require("dotenv").config();

const login = async (req, res) => {
  console.log('chamado')
  try {
    const { email, senha } = req.body;

    // Verifica se o usuário existe
    const user = await prisma.usuarios.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "E-mail ou senha inválidos" });
    console.log('usuario que fez login:', user.nome)

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
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: 60 * 60 * 1000 // 1 hora
    });

    // Remove a senha antes de enviar o objeto do usuário de volta
    const { senha: _, ...usuarioSemSenha } = user;

    // Retorna a mensagem E o objeto do usuário
    res.status(200).json({
      msg: "Autenticação realizada com sucesso",
      usuario: usuarioSemSenha
    });

  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer login" });
  }
};


module.exports = login;
