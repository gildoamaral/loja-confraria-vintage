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

// Teste simples
router.get('/', (req, res) => {
  res.send('Rota de pagamentos funcionando!');
});

// Nova rota para buscar pagamento por pedidoId
router.get('/por-pedido/:pedidoId', async (req, res) => {
  const pedidoId = Number(req.params.pedidoId);

  if (!pedidoId) {
    return res.status(400).json({ error: "Pedido ID inválido" });
  }

  try {
    const pagamento = await prisma.pagamentos.findFirst({
      where: { pedidoId },
      orderBy: { id: 'desc' } // pega o pagamento mais recente, se houver mais de um
    });

    if (!pagamento) {
      return res.status(404).json({ error: "Pagamento não encontrado para esse pedido" });
    }

    res.json(pagamento);
  } catch (error) {
    console.error("Erro ao buscar pagamento por pedido:", error);
    res.status(500).json({ error: "Erro interno ao buscar pagamento" });
  }
});

// Criar pagamento via PIX
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

// Criar pagamento via cartão
// router.post('/criar-cartao', async (req, res) => {
//   const { transaction_amount, pedidoId, token, description, installments, payment_method_id, issuer_id, payer, valorFrete } = req.body;

//   console.log('REQUEST');
//   console.log(req.body);

//   const pedido = await prisma.pedidos.findUnique({
//     where: { id: pedidoId },
//     include: {
//       itens: {
//         include: { produto: true }
//       }
//     }
//   });


//   if (!pedido || !pedido.itens.length) {
//     return res.status(400).json({ error: 'Pedido não encontrado ou sem itens.' });
//   }

//   const valorTotalProdutos = pedido.itens.reduce((total, item) => {
//     const preco = item.produto.precoPromocional ?? item.produto.preco;
//     return total + preco * item.quantidade;
//   }, 0);

//   // Some o valor do frete, se enviado
//   const valorTotal = Number(valorTotalProdutos) + Number(valorFrete || 0);
//   console.log('VALOR TOTAL DOS PRODUTOS: ', valorTotalProdutos);
//   console.log('VALOR TOTAL COM FRETE: ', valorTotal);
//   console.log('VALOR DO FRETE: ', valorFrete);

//   const body = {
//     transaction_amount: Number(valorTotal.toFixed(2)),
//     token,
//     description,
//     installments,
//     payment_method_id,
//     issuer_id,
//     payer,
//   };

//   payment.create({
//     body,
//     requestOptions: {
//       idempotencyKey: Date.now().toString()
//     }
//   })
//     .then(async (result) => {
//       console.log('RESULT STATUS --------------- ', result.status);
//       console.log('RESULT DETAILS -------------- ', result.status_detail);
//       console.log('RESULT AMOUNT --------------- ', result.transaction_amount);
//       console.log('RESULT INSTALLMENTS --------- ', result.installments);
//       console.log('RESULT TOTAL PAID ----------- ', result.transaction_details.total_paid_amount);



//       // TESTANDO se o usuario consegue realizar o pagamento logo que dá erro
//       let statusPayment = '';

//       if (result.status === 'rejected') {
//         return res.status(402).json({ error: 'Pagamento negado pelo cartão. Tente novamente ou use outro cartão.' });
//       }

//       if (result.status === 'approved') {
//         statusPayment = "APROVADO";
//       }

//       if (result.status === 'in_process') {
//         statusPayment = "PENDENTE";
//       }


//       /*
//        * APROVADO  | approved    |  accredited
//        * PENDENTE  | in_process  |  pending_contingency
//        * FALHOU    | rejected    |  cc_rejected_bad_filled_card_number  &&  cc_rejected_bad_filled_security_code
//        */

//       try {
//         const pagamento = await prisma.pagamentos.create({
//           data: {
//             pedidoId: req.body.pedidoId,
//             status: statusPayment,
//             metodo: 'CARTAO',
//             valor: result.transaction_details.total_paid_amount,
//             parcelas: result.installments
//           }
//         });

//         if (statusPayment === "APROVADO") {

//           const novoPedido = await prisma.pedidos.update({
//             where: { id: req.body.pedidoId },
//             data: {
//               status: 'PAGO',
//               dataFinalizado: new Date()
//             }
//           });
//           console.log('PAGAMENTO APROVADO! ', novoPedido);
//           res.status(201).json({ status: 'success', message: 'Pagamento aprovado!', pagamento });
//           return;
//         }

//         if (statusPayment === "PENDENTE") {

//           await prisma.pedidos.update({
//             where: { id: req.body.pedidoId },
//             data: {
//               status: 'AGUARDANDO_PAGAMENTO',
//               dataFinalizado: new Date()
//             }
//           });

//           res.status(201).json({ status: 'pending', message: 'Pagamento em processamento.', pagamento });
//           return;
//         }


//         console.log('PAGAMENTOS STATUS -- ', pagamento.status);
//         console.log('PAGAMENTOS VALOR --- ', pagamento.valor);

//       } catch (error) {
//         console.log('ERRO AO SALVAR PAGAMENTO NO BANCO: ', error);
//         return;
//       }

//       res.status(201).json("sucesso!"); // <-- agora retorna pro front
//     })
//     .catch((error) => {
//       console.log('ERRO na criação do pagamento: ');
//       console.log(error);
//       res.status(500).json({ error: 'Erro ao criar pagamento', detalhes: error }); // <-- envia erro ao frontend
//     });
// });

router.post('/criar-cartao', async (req, res) => {
  const { pedidoId, token, description, installments, payment_method_id, issuer_id, payer, valorFrete } = req.body;

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
    
    // --- ETAPA 1: "CONGELAR" OS PREÇOS DOS ITENS ---
    // Usamos uma transação para garantir que todos os itens sejam atualizados ou nenhum.
    await prisma.$transaction(
      pedido.itens.map((item) =>
        prisma.itemPedido.update({
          where: { id: item.id },
          data: {
            // Salva o preço do produto (com ou sem promoção) no item do pedido
            precoUnitario: item.produto.precoPromocional ?? item.produto.preco,
          },
        })
      )
    );

    const valorTotalProdutos = pedido.itens.reduce((total, item) => {
      const preco = item.produto.precoPromocional ?? item.produto.preco;
      return total + preco * item.quantidade;
    }, 0);

    const valorTotalParaGateway = Number(valorTotalProdutos) + Number(valorFrete || 0);

    const body = {
      transaction_amount: Number(valorTotalParaGateway.toFixed(2)),
      token,
      description,
      installments,
      payment_method_id,
      issuer_id,
      payer,
    };

    payment.create({ body, requestOptions: { idempotencyKey: Date.now().toString() } })
      .then(async (result) => {
        console.log(result);

        let statusPayment = '';
        if (result.status === 'rejected') {
          return res.status(402).json({ error: 'Pagamento negado pelo cartão.' });
        }
        if (result.status === 'approved') { statusPayment = "APROVADO"; }
        if (result.status === 'in_process') { statusPayment = "PENDENTE"; }

        // --- ETAPA 2: COLETAR OS DETALHES FINANCEIROS ---
        // O Mercado Pago retorna os custos na resposta.
        const taxaGateway = result.fee_details?.find(fee => fee.type === 'mercadopago_fee')?.amount || 0;
        const custoParcelamento = result.fee_details?.find(fee => fee.type === 'financing_fee')?.amount || 0;
        
        try {
          // --- ETAPA 3: SALVAR O PAGAMENTO DETALHADO ---
          const pagamento = await prisma.pagamentos.create({
            data: {
              pedidoId: req.body.pedidoId,
              status: statusPayment,
              metodo: 'CARTAO',
              parcelas: result.installments,
              gatewayTransactionId: result.id.toString(), // Salva o ID da transação do MP

              // Novos campos financeiros
              valorProdutos: valorTotalProdutos,
              valorFrete: Number(valorFrete || 0),
              valorTaxaCartao: taxaGateway,
              valorTaxaParcelamento: custoParcelamento,
              valorTotal: result.transaction_details.total_paid_amount,
            }
          });

          // O resto da lógica para atualizar o status do pedido continua igual
          if (statusPayment === "APROVADO" || statusPayment === "PENDENTE") {
            const novoStatus = statusPayment === "APROVADO" ? 'PAGO' : 'AGUARDANDO_PAGAMENTO';
            
            await prisma.pedidos.update({
              where: { id: req.body.pedidoId },
              data: {
                status: novoStatus,
                dataFinalizado: new Date()
              }
            });

            const statusResponse = statusPayment === "APROVADO" ? 'success' : 'pending';
            const messageResponse = statusPayment === "APROVADO" ? 'Pagamento aprovado!' : 'Pagamento em processamento.';
            
            res.status(201).json({ status: statusResponse, message: messageResponse, pagamento });
            return;
          }

        } catch (error) {
          console.log('ERRO AO SALVAR PAGAMENTO NO BANCO: ', error);
          // TODO: Implementar lógica de estorno/cancelamento no gateway caso o BD falhe
          res.status(500).json({ error: 'Falha ao salvar informações do pagamento.'});
          return;
        }

      })
      .catch((error) => {
        console.log('ERRO na criação do pagamento: ', error);
        res.status(500).json({ error: 'Erro ao criar pagamento', detalhes: error });
      });

  } catch (dbError) {
      console.error('Erro de banco de dados antes do pagamento:', dbError);
      res.status(500).send('Erro no servidor');
  }
});

module.exports = router;
