const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Payment, PaymentRefund } = require('mercadopago');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const auth = require('../middlewares/Auth');
const verifyAdmin = require('../middlewares/AuthAdmin');
const { verificarEstoque, diminuirEstoque, restaurarEstoque } = require('../utils/VerificaEstoque');
const { v4: uuidv4 } = require('uuid');
const {
  enviarEmailPagamentoAprovado,
  enviarEmailPagamentoCancelado,
  enviarEmailReembolso
} = require('../services/emailService');

const prisma = new PrismaClient();
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000
  }
});
const payment = new Payment(client);
const refund = new PaymentRefund(client)


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

router.post('/criar-pix', auth, async (req, res) => {
  const { pedidoId, valorFrete, nomeFrete, idFrete } = req.body;

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
          type: 'CPF',
          number: pedido.usuario.cpf,
        },
      },
    };
    const requestOptions = {
      idempotencyKey: Date.now().toString() // algo único por chamada
    }


    const result = await payment.create({ body, requestOptions })

    if (process.env.NODE_ENV === 'development') {
      console.log('Link mercado pago:');
      console.log(result.point_of_interaction.transaction_data.ticket_url);
    }

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
        empresaFreteId: idFrete ? parseInt(idFrete) : null,
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

router.post('/criar-cartao', auth, async (req, res) => {
  const { deviceId, pedidoId, token, description, installments, payment_method_id, issuer_id, payer, valorFrete, nomeFrete, idFrete } = req.body;

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
            area_code: pedido.usuario.ddd,
            number: pedido.usuario.telefone
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
      binary_mode: true,
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

        let statusPayment = '';
        if (result.status === 'rejected') {
          return res.status(402).json({ error: 'Pagamento negado pelo cartão.', details: result });
        }
        if (result.status === 'approved') { statusPayment = "APROVADO"; }
        if (result.status === 'in_process') { statusPayment = "PENDENTE"; }

        const taxaGateway = result.fee_details?.find(fee => fee.type === 'mercadopago_fee')?.amount || 0;
        const custoParcelamento = result.fee_details?.find(fee => fee.type === 'financing_fee')?.amount || 0;

        // SALVAR NO BANCO
        try {
          const resultado = await prisma.$transaction(async (tx) => {
            const pagamento = await tx.pagamentos.create({
              data: {
                pedidoId: req.body.pedidoId,
                status: statusPayment,
                metodo: 'CARTAO',
                parcelas: result.installments,
                gatewayTransactionId: result.id.toString(),

                valorProdutos: valorTotalProdutos,
                valorFrete: Number(valorFrete || 0),
                valorTaxaCartao: taxaGateway,
                valorTaxaParcelamento: custoParcelamento,
                valorTotal: result.transaction_details.total_paid_amount,
              }
            });

            if (statusPayment === "APROVADO" || statusPayment === "PENDENTE") {
              const novoStatus = statusPayment === "APROVADO" ? 'EM_PREPARACAO' : 'AGUARDANDO_PAGAMENTO';

              await tx.pedidos.update({
                where: { id: req.body.pedidoId },
                data: {
                  status: novoStatus,
                  dataFinalizado: new Date(),
                  empresaFrete: nomeFrete || null,
                  empresaFreteId: idFrete ? parseInt(idFrete) : null,
                  statusEtiqueta: statusPayment === "APROVADO" ? 'AGUARDANDO_DADOS' : null,
                }
              });
            }

            return pagamento;
          });

          if (statusPayment === "APROVADO") {
            await diminuirEstoque(req.body.pedidoId);

          }

          const statusResponse = statusPayment === "APROVADO" ? 'success' : 'pending';
          const messageResponse = statusPayment === "APROVADO" ? 'Pagamento aprovado!' : 'Pagamento em processamento.';

          res.status(201).json({ status: statusResponse, message: messageResponse, pagamento: resultado, detalhesGateway: result });
          return;

        } catch (error) {
          console.log('ERRO AO SALVAR PAGAMENTO NO BANCO: ', error);
          // ATENÇÃO A TODA ESTA LOGICA NOVA, AINDA NÃO TESTADA

          if (statusPayment === "APROVADO") {
            console.log('⚠️ INICIANDO ESTORNO AUTOMÁTICO - Pagamento aprovado mas BD falhou');

            try {
              const refundResponse = await refund.create({
                payment_id: result.id,
                body: {
                  amount: result.transaction_details.total_paid_amount
                }
              })

              console.log('✅ ESTORNO AUTOMÁTICO REALIZADO:', {
                paymentId: result.id,
                refundId: refundResponse.id,
                status: refundResponse.status,
                amount: refundResponse.amount
              });

              res.status(500).json({
                error: 'Erro ao salvar pagamento no banco de dados',
                message: 'O pagamento foi automaticamente estornado para evitar inconsistências',
                estorno: {
                  realizado: true,
                  refundId: refundResponse.id,
                  valor: refundResponse.amount
                },
                detalhes: error.message
              });

            } catch (refundError) {
              console.error('🚨 FALHA CRÍTICA - Não foi possível estornar o pagamento:', refundError);

              console.error('🚨 ATENÇÃO MANUAL NECESSÁRIA:', {
                paymentId: result.id,
                valor: result.transaction_details.total_paid_amount,
                pedidoId: req.body.pedidoId,
                timestamp: new Date().toISOString(),
                gatewayStatus: 'APROVADO',
                dbError: error.message,
                refundError: refundError.message
              });

              res.status(500).json({
                error: 'Erro crítico: Pagamento aprovado mas não foi possível salvar nem estornar',
                message: 'ATENÇÃO: Intervenção manual necessária - verifique os logs',
                paymentId: result.id,
                pedidoId: req.body.pedidoId,
                valor: result.transaction_details.total_paid_amount,
                detalhes: {
                  dbError: error.message,
                  refundError: refundError.message
                }
              });
            }
          } else {
            // Se era pagamento pendente, apenas retorna o erro normal
            res.status(500).json({
              error: 'Erro ao salvar pagamento no banco de dados',
              detalhes: error.message
            });
          }
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

// --------- WEBHOOK MERCADOPAGO ----------
router.post('/webhook', async (req, res) => {
  try {
    const signatureHeader = req.get('x-signature');
    if (!signatureHeader) {
      return res.status(401).send('Assinatura não encontrada.');
    }

    const parts = signatureHeader.split(',');
    const timestamp = parts.find(part => part.startsWith('ts=')).split('=')[1];
    const receivedSignature = parts.find(part => part.startsWith('v1=')).split('=')[1];

    const signedTemplate = `id:${req.body.data.id};request-id:${req.get('x-request-id')};ts:${timestamp};`;

    const hmac = crypto.createHmac('sha256', process.env.MERCADO_PAGO_WEBHOOK_SECRET);
    hmac.update(signedTemplate);
    const calculatedSignature = hmac.digest('hex');

    if (calculatedSignature !== receivedSignature) {
      console.error('Webhook com assinatura inválida!');
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
      // PAGAMENTO APROVADO
      if (paymentDetails.status === 'approved' && nossoPagamento.status !== 'APROVADO') {
        await prisma.$transaction([
          prisma.pagamentos.update({ where: { id: nossoPagamento.id }, data: { status: 'APROVADO' } }),
          prisma.pedidos.update({
            where: { id: nossoPagamento.pedidoId },
            data: {
              status: 'EM_PREPARACAO',
              statusEtiqueta: 'AGUARDANDO_DADOS'
            }
          }),
        ]);

        await diminuirEstoque(nossoPagamento.pedidoId);

        // ENVIAR EMAIL DE APROVAÇÃO
        try {
          const dadosCompletos = await prisma.pedidos.findUnique({
            where: { id: nossoPagamento.pedidoId },
            include: {
              usuario: true,
              pagamentos: true
            }
          });

          if (dadosCompletos) {
            await enviarEmailPagamentoAprovado({
              cliente: dadosCompletos.usuario,
              pedido: dadosCompletos,
              pagamento: nossoPagamento
            });
          }
        } catch (emailError) {
          console.error('Erro ao enviar email de aprovação:', emailError);
        }

        console.log(`Pedido ${nossoPagamento.pedidoId} atualizado para EM_PREPARACAO e estoque diminuído.`);

        // PAGAMENTO CANCELADO / REJEITADO
      } else if (['cancelled', 'rejected'].includes(paymentDetails.status) && nossoPagamento.status !== 'FALHOU') {
        await prisma.$transaction([
          prisma.pagamentos.update({ where: { id: nossoPagamento.id }, data: { status: 'FALHOU' } }),
          prisma.pedidos.update({ where: { id: nossoPagamento.pedidoId }, data: { status: 'CANCELADO' } }),
        ]);

        // ENVIAR EMAIL DE CANCELAMENTO
        try {
          const dadosCompletos = await prisma.pedidos.findUnique({
            where: { id: nossoPagamento.pedidoId },
            include: {
              usuario: true,
              pagamentos: true
            }
          });

          if (dadosCompletos) {
            await enviarEmailPagamentoCancelado({
              cliente: dadosCompletos.usuario,
              pedido: dadosCompletos,
              pagamento: nossoPagamento
            });
          }
        } catch (emailError) {
          console.error('Erro ao enviar email de cancelamento:', emailError);
        }

        console.log(`Pedido ${nossoPagamento.pedidoId} atualizado para CANCELADO.`);

        // PAGAMENTO REEMBOLSADO
      } else if (paymentDetails.status === 'refunded' && !['REEMBOLSADO', 'FALHOU'].includes(nossoPagamento.status)) {
        await prisma.$transaction([
          prisma.pagamentos.update({ where: { id: nossoPagamento.id }, data: { status: 'REEMBOLSADO' } }),
          prisma.pedidos.update({ where: { id: nossoPagamento.pedidoId }, data: { status: 'REEMBOLSADO' } }),
        ]);

        await restaurarEstoque(nossoPagamento.pedidoId);

        // ENVIAR EMAIL DE REEMBOLSO
        try {
          const dadosCompletos = await prisma.pedidos.findUnique({
            where: { id: nossoPagamento.pedidoId },
            include: {
              usuario: true,
              pagamentos: true
            }
          });

          if (dadosCompletos) {
            await enviarEmailReembolso({
              cliente: dadosCompletos.usuario,
              pedido: dadosCompletos,
              pagamento: nossoPagamento
            });
          }
        } catch (emailError) {
          console.error('Erro ao enviar email de reembolso:', emailError);
        }

        console.log(`Pedido ${nossoPagamento.pedidoId} REEMBOLSADO via app MP e estoque restaurado.`);
      }
    }

    res.status(200).send('Notificação recebida e validada.');

  } catch (error) {
    console.error('Erro geral ao processar webhook:', error);
    res.status(500).send('Erro interno no servidor.');
  }
});

// ===== ROTAS DE TESTE PARA DESENVOLVIMENTO =====

// Rota para testar configuração de email
router.get('/test-email-config', async (req, res) => {
  try {
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verifica a conexão
    await transporter.verify();

    res.json({
      success: true,
      message: 'Configuração de email está funcionando!',
      config: {
        service: 'gmail',
        user: process.env.EMAIL_USER ? 'Configurado' : 'NÃO CONFIGURADO',
        pass: process.env.EMAIL_PASS ? 'Configurado' : 'NÃO CONFIGURADO',
        admin: process.env.EMAIL_ADMIN ? 'Configurado' : 'NÃO CONFIGURADO'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro na configuração de email',
      error: error.message,
      config: {
        user: process.env.EMAIL_USER ? 'Configurado' : 'NÃO CONFIGURADO',
        pass: process.env.EMAIL_PASS ? 'Configurado' : 'NÃO CONFIGURADO',
        admin: process.env.EMAIL_ADMIN ? 'Configurado' : 'NÃO CONFIGURADO'
      }
    });
  }
});

// Rota para testar webhook completo com envio de email
router.post('/webhook/test', async (req, res) => {
  const { tipoTeste = 'reembolso', pedidoId } = req.body;

  try {
    const {
      enviarEmailPagamentoAprovado,
      enviarEmailPagamentoCancelado,
      enviarEmailReembolso
    } = require('../services/emailService');

    // Se não informar pedidoId, cria dados de teste
    let dadosTest;
    if (pedidoId) {
      // Busca pedido real
      dadosTest = await prisma.pedidos.findUnique({
        where: { id: Number(pedidoId) },
        include: {
          usuario: true,
          pagamentos: true
        }
      });

      if (!dadosTest) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
    } else {
      // Cria dados fictícios para teste
      dadosTest = {
        id: 999,
        usuario: {
          nome: 'João',
          sobrenome: 'Teste',
          email: process.env.EMAIL_USER, // Envia para o próprio email de teste
        },
        pagamentos: [{
          valorTotal: 150.00,
          metodo: 'PIX',
          gatewayTransactionId: 'test-' + Date.now()
        }]
      };
    }

    const pagamento = Array.isArray(dadosTest.pagamentos) ? dadosTest.pagamentos[0] : dadosTest.pagamentos;

    let emailFunction;
    let tipoEmail;

    switch (tipoTeste) {
      case 'aprovado':
        emailFunction = enviarEmailPagamentoAprovado;
        tipoEmail = 'Pagamento Aprovado';
        break;
      case 'cancelado':
        emailFunction = enviarEmailPagamentoCancelado;
        tipoEmail = 'Pagamento Cancelado';
        break;
      case 'reembolso':
        emailFunction = enviarEmailReembolso;
        tipoEmail = 'Reembolso';
        break;
      default:
        return res.status(400).json({ error: 'Tipo de teste inválido. Use: aprovado, cancelado ou reembolso' });
    }

    // Envia o email de teste
    await emailFunction({
      cliente: dadosTest.usuario,
      pedido: dadosTest,
      pagamento: pagamento
    });

    res.json({
      success: true,
      message: `Email de teste "${tipoEmail}" enviado com sucesso!`,
      dados: {
        pedidoId: dadosTest.id,
        cliente: dadosTest.usuario.email,
        tipo: tipoEmail,
        valor: pagamento.valorTotal
      }
    });

  } catch (error) {
    console.error('Erro no teste de webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao testar webhook',
      error: error.message
    });
  }
});

module.exports = router;
