const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Payment } = require('mercadopago');

const client = new MercadoPagoConfig(
  {
    accessToken: 'TEST-1291689406684525-041420-7856aade3a75ec62a4c2d5d33cc19d2b-162683758',
    options: { timeout: 5000, idempotencyKey: 'abc' }
  }
);

const payment = new Payment(client);

router.get('/', (req, res) => {
  res.send('Rota de pagamentos funcionando!');
});

router.post('/criar-pix', (req, res, next) => {
  console.log('REQUEST');
  console.log(req.body);

  const body = {
    transaction_amount: req.body.transaction_amount,
    description: req.body.description,
    payment_method_id: req.body.paymentMethodId,
    payer: {
      email: req.body.email,
      identification: {
        type: req.body.identificationType,
        number: req.body.number
      }
    },
  }
  const requestOptions = {
    idempotencyKey: '<SOME_UNIQUE_VALUE>'
  }

  payment.create({ body, requestOptions })
    .then(result => {
      console.log('RESULTADO');
      console.log(result);
    })
    .catch(error => {
      console.log('ERRO');
      console.log(error);
    });

  res.send('TUDO OK!');
});

module.exports = router;