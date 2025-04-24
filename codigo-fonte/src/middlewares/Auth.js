const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = (req, res, next) => {
  const token = req.cookies.token; // Pega o token do cookie
  
  if (!token) return res.status(401).json({ message: "Acesso negado" });

  try {
    // Verifica o token e decodifica as informações do usuário
    const verified = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = verified; // Adiciona o usuário verificado ao req.user
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
};

module.exports = authenticate;
