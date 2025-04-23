const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = (req, res, next) => {
  // const token = req.header("Authorization");
  const token = req.cookies.token; // <-- Agora pega o token do cookie
  
  if (!token) return res.status(401).json({ message: "Acesso negado" });

  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
};

module.exports = authenticate;
