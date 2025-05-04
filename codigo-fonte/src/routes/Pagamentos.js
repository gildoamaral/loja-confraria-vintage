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
    idempotencyKey: Date.now().toString() // algo único por chamada
  }

  payment.create({ body, requestOptions })
    .then(result => {
      console.log('RESULTADO');
      console.log(result);
      res.status(201).json(result); // <- agora retorna pro front
    })
    .catch(error => {
      console.log('ERRO');
      console.log(error);
      res.status(500).json({ error: 'Erro ao criar pagamento', detalhes: error });
    });

});

// router.post("/criar-cartao", async (req, res) => {
//   const {
//     token,
//     transactionAmount,
//     description,
//     installments,
//     paymentMethodId,
//     issuerId,
//     email
//   } = req.body;

//   console.log("Dados recebidos:", {
//     token,
//     transactionAmount,
//     description,
//     installments,
//     paymentMethodId,
//     issuerId,
//     email
//   });
//   try {
//     const pagamento = await payment.create({
//       transaction_amount: Number(transactionAmount),
//       token: token,
//       description: description,
//       installments: Number(installments),
//       payment_method_id: paymentMethodId,
//       issuer_id: issuerId,
//       payer: {
//         email: email
//       }
//     });
 
//     return res.status(200).json(pagamento);
//   } catch (error) {
//     console.error("Erro ao criar pagamento:", error);
//     return res.status(400).json({
//       error: error.message,
//       cause: error.cause || null
//     }); 
//   }
// });

router.post('/criar-cartao', (req, res) => {

  console.log('REQUEST');
  console.log(req.body);

  const body = {
    transaction_amount: req.body.transaction_amount,
    token: req.body.token,
    description: req.body.description,
    installments: req.body.installments,
    payment_method_id: req.body.paymentMethodId, // <- aqui é o paymentMethodId
    issuer_id: req.body.issuer, // <- aqui é o issuerId
    payer: {
      email: req.body.email,
      identification: {
        type: req.body.identificationType, // <- aqui é o identificationType
        number: req.body.number
      }
    }
  }

  payment.create({
    body: {
      transaction_amount: req.body.transaction_amount,
      token: req.body.token,
      description: req.body.description,
      installments: req.body.installments,
      payment_method_id: req.body.paymentMethodId, // <- aqui é o paymentMethodId
      issuer_id: req.body.issuer, // <- aqui é o issuerId
      payer: {
        email: req.body.email,
        identification: {
          type: req.body.identificationType, // <- aqui é o identificationType
          number: req.body.number
        }
      }
    },
    requestOptions: { idempotencyKey: Date.now().toString() }
  })
    .then((result) => console.log(result))
    .catch((error) => console.log(error));
});

module.exports = router;