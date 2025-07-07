const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
  let token;

  // MUDANÇA 1: Procurar pelo cookie chamado "token" ao invés de "jwt".
  if (req.cookies.token) {
    try {
      // 1. Pega o token do cookie
      token = req.cookies.token;

      // 2. Verifica o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // MUDANÇA 2: Usar 'decoded.userId' ao invés de 'decoded.id' para encontrar o usuário.
      // Isso corresponde ao payload que você criou na sua rota de login: { userId: user.id, ... }
      const currentUser = await prisma.usuarios.findUnique({
        where: { id: decoded.userId }, // <-- AQUI ESTÁ A MUDANÇA PRINCIPAL
        select: {
          id: true,
          nome: true,
          email: true,
          posicao: true,
        }
      });

      if (!currentUser) {
        return res.status(401).json({ message: 'O usuário pertencente a este token não existe mais.' });
      }
      
      // 4. Adiciona o usuário à requisição para uso nas próximas rotas
      req.user = currentUser;
      next();

    } catch (error) {
      console.error("Erro no middleware de autenticação:", error.message);
      // Limpa o cookie inválido ou expirado do navegador do usuário
      res.cookie("token", "", {
          httpOnly: true,
          expires: new Date(0), // Expira imediatamente
      });
      return res.status(401).json({ message: 'Não autorizado, token inválido.' });
    }
  } else {
    // Se não houver token, simplesmente continua. As rotas decidirão o que fazer.
    next();
  }
};

module.exports = { protect };