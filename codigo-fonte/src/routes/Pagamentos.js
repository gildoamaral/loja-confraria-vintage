const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Payment } = require('mercadopago');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const auth = require('../middlewares/Auth');
const verifyAdmin = require('../middlewares/AuthAdmin');
const { verificarEstoque, diminuirEstoque, restaurarEstoque } = require('../utils/VerificaEstoque');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN, 
  options: {
    timeout: 5000 
  }
});
const payment = new Payment(client);


// Nova rota para buscar pagamento por pedidoId
router.get('/por-pedido/:pedidoId', auth, async (req, res) => {
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
// router.post('/criar-pix', (req, res, next) => {
//   console.log('REQUEST');
//   console.log(req.body);

//   const body = {
//     transaction_amount: req.body.transaction_amount,
//     description: req.body.description,
//     payment_method_id: req.body.paymentMethodId,
//     payer: {
//       email: req.body.email,
//       identification: {
//         type: req.body.identificationType,
//         number: req.body.number
//       }
//     },
//   }
//   const requestOptions = {
//     idempotencyKey: Date.now().toString() // algo único por chamada
//   }

//   payment.create({ body, requestOptions })
//     .then(result => {
//       console.log('RESULTADO');
//       console.log(result);
//       res.status(201).json(result); // <- agora retorna pro front
//     })
//     .catch(error => {
//       console.log('ERRO');
//       console.log(error);
//       res.status(500).json({ error: 'Erro ao criar pagamento', detalhes: error });
//     });
// });

router.post('/criar-pix', auth, async (req, res) => {
  const { pedidoId, valorFrete, nomeFrete } = req.body;

  console.log("PEDIDO ID ---------------", req.body)

  try {
    const pedido = await prisma.pedidos.findUnique({
      where: { id: pedidoId },
      include: {
        itens: { include: { produto: true } },
        usuario: true, // Inclui os dados do usuário para o pagamento
      },
    });

    if (!pedido || !pedido.itens.length) {
      return res.status(400).json({ error: 'Pedido não encontrado ou sem itens.' });
    }

    // VERIFICAÇÃO DE ESTOQUE: Verifica se há estoque suficiente antes de processar o pagamento
    const problemasEstoque = await verificarEstoque(pedidoId);
    if (problemasEstoque.length > 0) {
      return res.status(400).json({
        error: 'Não é possível processar o pagamento',
        detalhes: problemasEstoque
      });
    }

    // "Congela" o preço dos itens no momento da compra
    await prisma.$transaction(
      pedido.itens.map((item) =>
        prisma.itemPedido.update({
          where: { id: item.id },
          data: { precoUnitario: item.produto.precoPromocional ?? item.produto.preco },
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
      description: `Pedido #${pedido.id} - Confraria Vintage`,
      payment_method_id: 'pix',
      payer: {
        email: pedido.usuario.email,
        first_name: pedido.usuario.nome,
        last_name: pedido.usuario.sobrenome,
        identification: {
          type: 'CPF', // IMPORTANTE: Você precisará do CPF do usuário.
          number: '19119119100',
          // number: pedido.usuario.cpf 
        },
      },
    };
    const requestOptions = {
      idempotencyKey: Date.now().toString() // algo único por chamada
    }


    const result = await payment.create({ body, requestOptions });


    // Salva o pagamento detalhado no seu banco de dados, incluindo os dados do PIX
    await prisma.pagamentos.create({
      data: {
        pedidoId: pedidoId,
        status: 'PENDENTE',
        metodo: 'PIX',
        gatewayTransactionId: result.id.toString(),
        valorProdutos: valorTotalProdutos,
        valorFrete: Number(valorFrete || 0),
        valorTotal: result.transaction_amount,

        // SALVANDO OS DADOS DO PIX NOS NOVOS CAMPOS
        pixQrCodeBase64: result.point_of_interaction.transaction_data.qr_code_base64,
        pixQrCode: result.point_of_interaction.transaction_data.qr_code,
      },
    });

    // Atualiza o status do pedido
    await prisma.pedidos.update({
      where: { id: pedidoId },
      data: {
        status: 'AGUARDANDO_PAGAMENTO',
        dataFinalizado: new Date(),
        empresaFrete: nomeFrete || null,
      },
    });

    res.status(201).json({
      status: 'pending',
      message: 'PIX gerado com sucesso!',
      pixData: {
        qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64,
        qr_code: result.point_of_interaction.transaction_data.qr_code,
      }
    });

  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error?.cause || error);
    res.status(500).json({ error: 'Erro ao criar pagamento PIX' });
  }
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

router.post('/criar-cartao', auth, async (req, res) => {
  const { deviceId, pedidoId, token, description, installments, payment_method_id, issuer_id, payer, valorFrete, nomeFrete } = req.body;

  try {
    const pedido = await prisma.pedidos.findUnique({
      where: { id: pedidoId },
      include: {
        usuario: true,
        itens: {
          include: { produto: true }
        }
      }
    });

    if (!pedido || !pedido.itens.length) {
      return res.status(400).json({ error: 'Pedido não encontrado ou sem itens.' });
    }

    const problemasEstoque = await verificarEstoque(pedidoId);
    if (problemasEstoque.length > 0) {
      return res.status(400).json({
        error: 'Não é possível processar o pagamento',
        detalhes: problemasEstoque
      });
    }

    await prisma.$transaction(
      pedido.itens.map((item) =>
        prisma.itemPedido.update({
          where: { id: item.id },
          data: {
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

    const itemsParaMercadoPago = pedido.itens.map((item, index) => ({
      id: (index + 1).toString(),
      title: item.produto.nome,
      description: `${item.produto.categoria} - ${item.produto.cor} - ${item.produto.tamanho}`,
      quantity: item.quantidade,
      unit_price: Number((item.produto.precoPromocional ?? item.produto.preco).toFixed(2)),
      category_id: item.produto.categoria.toLowerCase(),
      type: item.produto.categoria,
    }));

    const body = {
      transaction_amount: Number(valorTotalParaGateway.toFixed(2)),
      token,
      description,
      installments,
      payment_method_id,
      issuer_id,
      payer: {
        entity_type: 'individual',
        type: 'customer',
        email: payer.email,
        first_name: pedido.usuario.nome,
        last_name: pedido.usuario.sobrenome,
        identification: {
          type: payer.identification.type,
          number: payer.identification.number,
        },
      },
      additional_info: {
        items: itemsParaMercadoPago,
        payer: {
          first_name: pedido.usuario.nome,
          last_name: pedido.usuario.sobrenome,
          phone: {
            area_code: '21',
            number: '980101507'
          },
          address: {
            zip_code: pedido.usuario.cep,
            street_name: pedido.usuario.rua,
            street_number: pedido.usuario.numero || 'S/N',
          }
        },
        shipments: {
          receiver_address: {
            zip_code: pedido.usuario.cep,
            state_name: pedido.usuario.estado,
            city_name: pedido.usuario.cidade,
            street_name: pedido.usuario.rua,
            street_number: pedido.usuario.numero,
            floor: null,
            apartment: pedido.usuario.complemento || 'S/N',
          }
        }
      },
      external_reference: `PEDIDO Nº - ${pedidoId}`,
      statement_descriptor: "CVintage",
    };
    const requestOptions = {
      idempotencyKey: uuidv4(),
      meliSessionId: deviceId
    };

    console.log(body, requestOptions)

    payment.create({ body, requestOptions })
      .then(async (result) => {
        console.log(result.status)
        console.log(result.status_detail)
        console.log(token)
        // res.status(201).json(result); // <-- agora retorna pro front

        let statusPayment = '';
        if (result.status === 'rejected') {
          return res.status(402).json({ error: 'Pagamento negado pelo cartão.', details: result });
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
                dataFinalizado: new Date(),
                empresaFrete: nomeFrete || null, // Se tiver nome de frete, salva
              }
            });

            // DIMINUIR ESTOQUE: Se o pagamento foi aprovado imediatamente, diminui o estoque
            if (statusPayment === "APROVADO") {
              await diminuirEstoque(req.body.pedidoId);
            }

            const statusResponse = statusPayment === "APROVADO" ? 'success' : 'pending';
            const messageResponse = statusPayment === "APROVADO" ? 'Pagamento aprovado!' : 'Pagamento em processamento.';

            res.status(201).json({ status: statusResponse, message: messageResponse, pagamento, detalhesGateway: result });
            return;
          }

        } catch (error) {
          console.log('ERRO AO SALVAR PAGAMENTO NO BANCO: ', error);
          // TODO: Implementar lógica de estorno/cancelamento no gateway caso o BD falhe
          // res.status(500).json({ error: 'Falha ao salvar informações do pagamento.' });
          res.status(500).json({ error: 'Erro ao salvar pagamento no banco de dados', detalhes: error });
          return;
        }

      })
      .catch((error) => {
        console.log('ERRO na criação do pagamento: ', error);
        res.status(500).json({ error: 'Erro ao criar pagamento', detalhes: error }); // <-- envia erro ao frontend
        // console.log('ERRO na criação do pagamento: ', error.cause);
        // console.log('ERRO na criação do pagamento: ', error.cause[0]);
        // res.status(500).json({ error: 'Erro ao criar pagamento', detalhes: error });
      });

  } catch (dbError) {
    console.error('Erro de banco de dados antes do pagamento:', dbError);
    res.status(500).send('Erro no servidor');
  }
});

// --- NOVA ROTA DE WEBHOOK COM VALIDAÇÃO DE ASSINATURA ---
router.post('/webhook', async (req, res) => {
  try {
    const signatureHeader = req.get('x-signature');
    if (!signatureHeader) {
      return res.status(401).send('Assinatura não encontrada.');
    }

    const parts = signatureHeader.split(',');
    const timestamp = parts.find(part => part.startsWith('ts=')).split('=')[1];
    const receivedSignature = parts.find(part => part.startsWith('v1=')).split('=')[1];

    // CORREÇÃO: Usamos req.body.data.id em vez de req.body.id
    const signedTemplate = `id:${req.body.data.id};request-id:${req.get('x-request-id')};ts:${timestamp};`;

    const hmac = crypto.createHmac('sha256', process.env.MERCADO_PAGO_WEBHOOK_SECRET);
    hmac.update(signedTemplate);
    const calculatedSignature = hmac.digest('hex');

    if (calculatedSignature !== receivedSignature) {
      console.error('Webhook com assinatura inválida!');
      // Log para ajudar na depuração futura
      console.log('Template usado:', signedTemplate);
      console.log('Assinatura calculada:', calculatedSignature);
      console.log('Assinatura recebida:', receivedSignature);
      return res.status(401).send('Assinatura inválida.');
    }

    console.log('--- Webhook com assinatura VÁLIDA recebido ---', req.body);
    const notification = req.body;

    if (notification.type === 'payment' && notification.data?.id) {
      const paymentId = notification.data.id;
      const paymentDetails = await payment.get({ id: paymentId });
      const nossoPagamento = await prisma.pagamentos.findFirst({
        where: { gatewayTransactionId: paymentId.toString() },
      });

      if (!nossoPagamento) {
        console.warn(`Webhook: Pagamento com ID de gateway ${paymentId} não encontrado.`);
        return res.status(200).send('Pagamento não encontrado no sistema.');
      }

      // Lógica para atualizar o banco de dados
      if (paymentDetails.status === 'approved' && nossoPagamento.status !== 'APROVADO') {
        await prisma.$transaction([
          prisma.pagamentos.update({ where: { id: nossoPagamento.id }, data: { status: 'APROVADO' } }),
          prisma.pedidos.update({ where: { id: nossoPagamento.pedidoId }, data: { status: 'PAGO' } }),
        ]);

        // DIMINUIR ESTOQUE: Quando o pagamento é aprovado via webhook (PIX ou cartão pendente)
        await diminuirEstoque(nossoPagamento.pedidoId);

        console.log(`Pedido ${nossoPagamento.pedidoId} atualizado para PAGO e estoque diminuído.`);
      } else if (['cancelled', 'rejected'].includes(paymentDetails.status) && nossoPagamento.status !== 'FALHOU') {
        await prisma.$transaction([
          prisma.pagamentos.update({ where: { id: nossoPagamento.id }, data: { status: 'FALHOU' } }),
          prisma.pedidos.update({ where: { id: nossoPagamento.pedidoId }, data: { status: 'CANCELADO' } }),
        ]);
        console.log(`Pedido ${nossoPagamento.pedidoId} atualizado para CANCELADO.`);
      }
    }

    res.status(200).send('Notificação recebida e validada.');

  } catch (error) {
    console.error('Erro geral ao processar webhook:', error);
    res.status(500).send('Erro interno no servidor.');
  }
});

// --- ROTA PARA ESTORNO DE PAGAMENTO ---
// router.post('/estornar/:pedidoId', verifyAdmin, async (req, res) => {
//   const { pedidoId } = req.params;

//   try {
//     // Busca o pedido e pagamento
//     const pedido = await prisma.pedidos.findUnique({
//       where: { id: pedidoId },
//       include: {
//         pagamento: true,
//         itens: {
//           include: { produto: true }
//         }
//       }
//     });

//     if (!pedido) {
//       return res.status(404).json({ error: 'Pedido não encontrado' });
//     }

//     if (!pedido.pagamento) {
//       return res.status(400).json({ error: 'Pedido não possui pagamento associado' });
//     }

//     if (pedido.pagamento.status !== 'APROVADO') {
//       return res.status(400).json({ error: 'Apenas pagamentos aprovados podem ser estornados' });
//     }

//     if (!pedido.pagamento.gatewayTransactionId) {
//       return res.status(400).json({ error: 'ID da transação no gateway não encontrado' });
//     }

//     // Processa o estorno no Mercado Pago
//     try {
//       const refundResponse = await payment.refund({
//         id: pedido.pagamento.gatewayTransactionId,
//         body: {
//           amount: pedido.pagamento.valorTotal
//         }
//       });

//       console.log('Resposta do estorno Mercado Pago:', refundResponse);

//       // Atualiza o status no banco de dados
//       await prisma.$transaction([
//         prisma.pagamentos.update({
//           where: { id: pedido.pagamento.id },
//           data: { status: 'FALHOU' } // Marca como falhou pois foi estornado
//         }),
//         prisma.pedidos.update({
//           where: { id: pedidoId },
//           data: { status: 'REEMBOLSADO' } // Usa o status REEMBOLSADO já existente
//         })
//       ]);

//       // Restaura o estoque dos produtos
//       await restaurarEstoque(pedidoId);

//       res.json({
//         success: true,
//         message: 'Estorno processado com sucesso',
//         estorno: {
//           id: refundResponse.id,
//           status: refundResponse.status,
//           valor: refundResponse.amount
//         }
//       });

//     } catch (mpError) {
//       console.error('Erro no Mercado Pago:', mpError);

//       // Verifica se é um erro específico do MP
//       const errorMessage = mpError.cause?.[0]?.description || mpError.message || 'Erro ao processar estorno no gateway';

//       return res.status(400).json({ 
//         error: 'Falha ao processar estorno', 
//         details: errorMessage 
//       });
//     }

//   } catch (error) {
//     console.error('Erro geral ao processar estorno:', error);
//     res.status(500).json({ error: 'Erro interno do servidor' });
//   }
// });


module.exports = router;
