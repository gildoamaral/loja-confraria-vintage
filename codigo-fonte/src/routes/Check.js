const express = require('express');
const router = express.Router();
const auth = require('../middlewares/Auth');

router.get('/check', auth, (req, res) => {
  res.json({ autenticado: true, user: req.user });
});

module.exports = router;