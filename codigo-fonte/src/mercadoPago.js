const mercadopago = require("mercadopago");

const dotenv = require('dotenv');

dotenv.config();

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN, // use variável de ambiente
});

module.exports = mercadopago;