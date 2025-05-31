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

router.post('/criar-cartao', async (req, res) => {
  const { transaction_amount, pedidoId, token, description, installments, payment_method_id, issuer_id, payer } = req.body;

  try {
    const pedido = await prisma.pedidos.findUnique({
      where: { id: pedidoId },
      include: {
        itens: {
          include: { produto: true }
        }
      }
    });


    if (!pedido || !pedido.itens.length) {
      return res.status(400).json({ error: 'Pedido não encontrado ou sem itens.' });
    }

    const valorTotal = pedido.itens.reduce((total, item) => {
      const preco = item.produto.precoPromocional ?? item.produto.preco;
      return total + preco * item.quantidade;
    }, 0);

    const body = {
      transaction_amount: Number(valorTotal.toFixed(2)),
      token,
      description,
      installments,
      payment_method_id,
      issuer_id,
      payer,
    };

    payment.create({
      body,
      requestOptions: {
        idempotencyKey: Date.now().toString()
      }
    })
      .then(async (result) => {
        console.log('RESULT STATUS --------------- ', result.status);
        console.log('RESULT DETAILS -------------- ', result.status_detail);
        console.log('RESULT AMOUNT --------------- ', result.transaction_amount);
        console.log('RESULT INSTALLMENTS --------- ', result.installments);
        console.log('RESULT TOTAL PAID ----------- ', result.transaction_details.total_paid_amount);



        // TESTANDO se o usuario consegue realizar o pagamento logo que dá erro
        if (result.status === 'rejected') {
          return res.status(402).json({ error: 'Pagamento negado pelo cartão. Tente novamente ou use outro cartão.' });
        }

        let statusPayment = '';

        if (result.status === 'approved') {
          statusPayment = "APROVADO";
        }

        if (result.status === 'in_process') {
          statusPayment = "PENDENTE";
        }


        /*
         * APROVADO  | approved    |  accredited
         * PENDENTE  | in_process  |  pending_contingency
         * FALHOU    | rejected    |  cc_rejected_bad_filled_card_number  &&  cc_rejected_bad_filled_security_code
         */

        try {
          const pagamento = await prisma.pagamentos.create({
            data: {
              pedidoId: req.body.pedidoId,
              status: statusPayment,
              metodo: 'CARTAO',
              valor: result.transaction_details.total_paid_amount,
              parcelas: result.installments
            }
          });

          if (statusPayment === 'approved') {

            await prisma.pedidos.update({
              where: { id: req.body.pedidoId },
              data: { status: 'PAGO' }
            });

            res.status(201).json({ status: 'success', message: 'Pagamento aprovado!', pagamento });
            return;
          }

          if (statusPayment === 'in_process') {

            await prisma.pedidos.update({
              where: { id: req.body.pedidoId },
              data: { status: 'AGUARDANDO_PAGAMENTO' }
            });

            res.status(201).json({ status: 'pending', message: 'Pagamento em processamento.', pagamento });
            return;
          }


          console.log('PAGAMENTOS STATUS -- ', pagamento.status);
          console.log('PAGAMENTOS VALOR --- ', pagamento.valor);



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
  } catch (error) {
    console.log('ERRO');
    console.log(error);
    res.status(500).json({ error: 'Erro interno', detalhes: error });
  }
});

module.exports = router;