const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Payment } = require('mercadopago');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const client = new MercadoPagoConfig(
  {
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
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

router.post('/criar-cartao', (req, res) => {

  // console.log('REQUEST');
  // console.log(req.body);

  const body = {
    transaction_amount: req.body.transaction_amount,
    token: req.body.token,
    description: req.body.description,
    installments: req.body.installments,
    payment_method_id: req.body.payment_method_id,
    issuer_id: req.body.issuer_id,
    payer: {
      email: req.body.payer.email,
      identification: {
        type: req.body.payer.identification.type,
        number: req.body.payer.identification.number
      }
    }
  }

  // console.log('BODY');
  // console.log(body);

  payment.create({
    body,
    requestOptions: {
      idempotencyKey: Date.now().toString()
    }
  })
    .then(async (result) => {
      console.log(result);

      try {
        // Salva no banco de dados
        const pagamento = await prisma.pagamentos.create({
          data: {
            pedidoId: req.body.pedidoId,
            status: result.status === 'approved' ? 'APROVADO' : 'PENDENTE',
            metodo: 'CARTAO',
            valor: result.transaction_amount,
          }
        });

        // Se o pagamento foi aprovado, atualiza o status do pedido para PAGO
        if (result.status === 'approved') {
          await prisma.pedidos.update({
            where: { id: req.body.pedidoId },
            data: { status: 'PAGO' }
          });
        } else {
          // Se não aprovado, pode deixar como AGUARDANDO_PAGAMENTO ou PENDENTE
          await prisma.pedidos.update({
            where: { id: req.body.pedidoId },
            data: { status: 'AGUARDANDO_PAGAMENTO' }
          });
        }


        console.log('Pagamento salvo no banco:', pagamento);

        

      } catch (error) {
        console.log('ERRO AO SALVAR NO BANCO: ', error);
        return;
      }

      res.status(201).json("sucesso!"); // <-- agora retorna pro front
    })
    .catch((error) => {
      console.log('ERRO');
      console.log(error);
      res.status(500).json({ error: 'Erro ao criar pagamento', detalhes: error }); // <-- envia erro ao frontend
    });
});

module.exports = router;