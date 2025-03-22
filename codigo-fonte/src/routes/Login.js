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
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ msg: "Autenticação realizada com sucesso", token });

  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer login" });
  }
};

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZjMzMWI5NS04NTAwLTRmMzYtYWQ1YS01MjFlMDMxOGNjN2EiLCJpYXQiOjE3NDI2NTA0NDUsImV4cCI6MTc0MjY1NDA0NX0.yl-RNsrO6p6nM6dQh_u_gA7he8p0jwNKubSJb9H87iY

module.exports = login ;
