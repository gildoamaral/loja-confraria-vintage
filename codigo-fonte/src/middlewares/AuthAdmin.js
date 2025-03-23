const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyAdmin = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) return res.status(401).json({ message: "Acesso negado" });
  
  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    
    if (verified.posicao !== "ADMIN") {
      return res.status(403).json({ message: "Acesso restrito a administradores" });
    }
    
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
};

module.exports = verifyAdmin;
