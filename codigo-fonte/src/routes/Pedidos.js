const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middlewares/Auth'); // <-- Importa o middleware de autenticação
const crypto = require('crypto');

// Criar novo pedido com item
router.post('/criar', auth, async (req, res) => {
  const usuarioId = req.user.userId; // Obtém o ID do usuário do token JWT
  const { produtoId, quantidade } = req.body;

  const usuario = await prisma.usuarios.findUnique({
    where: { id: usuarioId }
  });


  try {
    // Verifica se o usuário já tem pedido com status CARRINHO
    let pedido = await prisma.pedidos.findFirst({
      where: {
        usuarioId,
        status: 'CARRINHO',
      },
    });

    // Se não existe, cria novo pedido
    if (!pedido) {
      pedido = await prisma.pedidos.create({
        data: {
          usuarioId,
          status: 'CARRINHO',
        },
      });
    }

    // Verifica se já existe o itemPedido com o mesmo produtoId para este pedido
    let item = await prisma.itemPedido.findFirst({
      where: {
        pedidoId: pedido.id,
        produtoId: produtoId,
      },
    });

    if (item) {
      // Se já existe, apenas soma a quantidade
      item = await prisma.itemPedido.update({
        where: { id: item.id },
        data: { quantidade: item.quantidade + quantidade },
      });
    } else {
      // Se não existe, cria um novo itemPedido
      item = await prisma.itemPedido.create({
        data: {
          pedidoId: pedido.id,
          produtoId,
          quantidade,
        },
      });
    }

    res.json({ pedido, item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar pedido ou item' });
  }
});


// Deletar item do pedido
router.delete('/item/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.itemPedido.delete({
      where: { id: parseInt(id) },
    });
    res.json({ mensagem: 'Item removido' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover item' });
  }
});

// Finalizar Pedido
router.put('/finalizar/:pedidoId', async (req, res) => {
  const { pedidoId } = req.params;

  try {
    const pedido = await prisma.pedidos.update({
      where: { id: pedidoId },
      data: { status: 'AGUARDANDO_PAGAMENTO' },
    });

    res.json(pedido);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao finalizar pedido' });
  }
});

// Criar Pagamento
router.post('/pagamento', async (req, res) => {
  const { pedidoId, valorTotal, metodo } = req.body;

  try {
    const pagamento = await prisma.pagamentos.create({
      data: {
        pedidoId,
        valorTotal,
        metodo,
        status: 'PENDENTE',
      },
    });

    res.json(pagamento);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao registrar pagamento' });
  }
});


// Atualizar Pagamento
router.put('/pagamento/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const pagamento = await prisma.pagamentos.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    if (status === 'APROVADO') {
      await prisma.pedidos.update({
        where: { id: pagamento.pedidoId },
        data: { status: 'PAGO' },
      });
    }

    res.json(pagamento);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar pagamento' });
  }
});

// Atualizar endereço de entrega do pedido
router.put('/endereco/:pedidoId', async (req, res) => {

  const { pedidoId } = req.params;
  const {
    enderecoEntrega,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    cep
  } = req.body;

  enderecoFields = {
    enderecoEntrega,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    cep,
  };


  try {
    // Atualiza o endereço do pedido
    const pedido = await prisma.pedidos.update({
      where: { id: pedidoId },
      data: enderecoFields,
    });



    res.json(pedido);
  } catch (err) {
    console.error("Erro ao atualizar endereço de entrega:", err);
    res.status(500).json({ erro: 'Erro ao atualizar endereço de entrega' });
  }
});

// Buscar pedido do usuário autenticado com status CARRINHO
router.get('/carrinho', auth, async (req, res) => {
  const usuarioId = req.user.userId;
  try {
    const pedido = await prisma.pedidos.findFirst({
      where: {
        usuarioId,
        status: 'CARRINHO',
      },
      include: {
        itens: {
          include: {
            // Agora, dentro de 'produto', nós também pedimos para incluir as 'imagens'
            produto: {
              include: {
                imagens: {
                  orderBy: {
                    posicao: 'asc',
                  },
                  // No carrinho, geralmente só precisamos da imagem principal (thumbnail)
                  take: 1,
                },
              },
            },
          },
        },
      },
    });
    if (!pedido) {
      return res.status(404).json({ message: 'Nenhum pedido em andamento encontrado.' });
    }


    res.json(pedido);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar pedido do carrinho' });
  }
});


// Atualizar quantidade de um item do pedido
router.put('/item/:id', async (req, res) => {
  const { id } = req.params;
  const { quantidade } = req.body;
  try {
    const item = await prisma.itemPedido.update({
      where: { id: parseInt(id) },
      data: { quantidade },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar quantidade do item' });
  }
});

// Buscar todos os pedidos do usuário autenticado
router.get('/', auth, async (req, res) => {
  const usuarioId = req.user.userId; // Corrigido para req.user.id
  try {
    const pedidos = await prisma.pedidos.findMany({
      where: {
        usuarioId,
        NOT: {
          status: 'CARRINHO' // Exclui os carrinhos
        }
      },
      select: { // Seleciona apenas o necessário para a lista
        id: true,
        status: true,
        dataFinalizado: true,
        pagamento: {
          select: {
            valorTotal: true
          }
        }
      },
      orderBy: { dataFinalizado: 'desc' } // Ordena pela data de finalização
    });
    res.json(pedidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar pedidos do usuário' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const usuarioId = req.user.userId; // Corrigido para req.user.id
    const pedidoId = req.params.id;

    const pedido = await prisma.pedidos.findUnique({
      where: {
        id: pedidoId,
        usuarioId: usuarioId, // Garante que o usuário só pode ver seus próprios pedidos
      },
      include: {
        pagamento: true,
        itens: {
          include: {
            produto: {
              include: {
                imagens: {
                  take: 1,
                  orderBy: { posicao: 'asc' },
                  select: { urls: true }
                }
              }
            }
          }
        }
      }
    });

    if (!pedido || pedido.status === 'CARRINHO') {
      return res.status(404).json({ msg: 'Pedido não encontrado ou não pertence a este usuário.' });
    }

    res.status(200).json(pedido);

  } catch (error) {
    console.error('Erro ao buscar detalhes do pedido:', error);
    res.status(500).json({ msg: 'Erro no servidor.' });
  }
});

// Buscar todos os pedidos pagos da loja
router.get('/pagos', auth, async (req, res) => {
  try {
    const pedidos = await prisma.pedidos.findMany({
      where: {
        status: {
          in: ['PAGO', 'ENVIADO', 'CANCELADO']
        }
      },
      include: {
        usuario: true,
        itens: {
          include: {
            produto: true,
          }
        }
      },
      orderBy: { criadoEm: 'desc' }
    });
    res.json(pedidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar pedidos do usuário' });
  }
});

// Atualizar status do pedido
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const pedidoAtualizado = await prisma.pedidos.update({
      where: { id: parseInt(id) },
      data: { status },
    });
    res.json(pedidoAtualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar o status do pedido' });
  }
});

//===============================================//
//--------------------WEBHOOK--------------------//
//===============================================//

router.get('/webhook/melhor-envio', (req, res) => {
  console.log('GET request recebido no webhook - teste do Melhor Envio');
  res.status(200).json({
    status: 'webhook endpoint working',
    method: 'GET',
    timestamp: new Date().toISOString()
  });
});

// Função para validar assinatura do webhook (opcional, mas recomendado)
function validarAssinatura(payload, signature, secret) {
  if (!secret || !signature) return true; // Pular validação se não configurado
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');
    
  return signature === expectedSignature;
}

// Rota POST principal para receber notificações do Melhor Envio
router.post('/webhook/melhor-envio', async (req, res) => {
  try {
    console.log('=== WEBHOOK MELHOR ENVIO RECEBIDO ===');
    console.log('Headers:', req.headers);
    console.log('Payload completo:', JSON.stringify(req.body, null, 2));
    
    const webhookData = req.body;
    const { event, data } = webhookData;
    
    // Validar estrutura básica
    if (!event || !data) {
      console.error('❌ Webhook inválido: event ou data ausentes');
      return res.status(200).json({ received: true, error: 'invalid_structure' });
    }

    // Validar assinatura (opcional - descomente se quiser usar)

    const signature = req.headers['x-me-signature'];
    const webhookSecret = process.env.MELHOR_ENVIO_WEBHOOK_SECRET;
    
    if (!validarAssinatura(JSON.stringify(req.body), signature, webhookSecret)) {
      console.error('❌ Assinatura inválida');
      return res.status(401).json({ error: 'invalid_signature' });
    }


    // Extrair dados da etiqueta
    const etiquetaId = data.id;
    const protocol = data.protocol;
    const status = data.status;
    const tracking = data.tracking || data.self_tracking;
    const userId = data.user_id;

    console.log(`📦 Evento: ${event} | Status: ${status} | Protocol: ${protocol} | ID: ${etiquetaId}`);

    // Buscar pedido pelo ID da etiqueta (pode ser id ou protocol)
    const pedido = await prisma.pedidos.findFirst({
      where: {
        OR: [
          { melhorEnvioId: etiquetaId },
          { melhorEnvioId: protocol }
        ]
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            sobrenome: true,
            email: true
          }
        },
        pagamento: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    if (!pedido) {
      console.error(`❌ Pedido não encontrado com melhorEnvioId: ${etiquetaId} ou ${protocol}`);
      return res.status(200).json({ received: true, error: 'order_not_found' });
    }

    console.log(`✅ Pedido encontrado: ${pedido.id} | Status atual: ${pedido.status} | Status etiqueta: ${pedido.statusEtiqueta}`);

    // Mapear eventos para status
    let novoStatusPedido = null;
    let novoStatusEtiqueta = null;
    let codigoRastreio = null;
    let empresaFrete = null;
    let dataFinalizado = null;

    switch (event) {
      case 'order.created':
        // Etiqueta criada
        novoStatusEtiqueta = 'CRIADA';
        console.log('📝 Etiqueta criada');
        break;

      case 'order.pending':
        // Etiqueta retornada ao carrinho
        novoStatusEtiqueta = 'PENDENTE';
        console.log('⏳ Etiqueta pendente no carrinho');
        break;

      case 'order.released':
        // Etiqueta foi paga
        novoStatusPedido = 'EM_PREPARACAO';
        novoStatusEtiqueta = 'PAGO';
        console.log('💳 Etiqueta paga - pedido em preparação');
        break;

      case 'order.generated':
        // Etiqueta foi gerada (pronta para coleta)
        novoStatusEtiqueta = 'GERADA';
        console.log('🏷️ Etiqueta gerada');
        break;

      case 'order.received':
        // Encomenda recebida em ponto de distribuição
        novoStatusPedido = 'EM_TRANSPORTE';
        novoStatusEtiqueta = 'RECEBIDA';
        console.log('🏢 Encomenda recebida no centro de distribuição');
        break;

      case 'order.posted':
        // Pedido postado
        novoStatusPedido = 'ENVIADO';
        novoStatusEtiqueta = 'POSTADO';
        codigoRastreio = tracking;
        console.log(`📮 Pedido postado | Código: ${codigoRastreio}`);
        break;

      case 'order.delivered':
        // Pedido entregue
        novoStatusPedido = 'ENTREGUE';
        novoStatusEtiqueta = 'ENTREGUE';
        // comentei a linha abaixo, pois dataFinalizado se refere ao MOMENTO DO PAGAMENTO DO PRODUTO
        // dataFinalizado = data.delivered_at ? new Date(data.delivered_at) : new Date();
        console.log('✅ Pedido entregue');
        break;

      case 'order.cancelled':
        // Etiqueta cancelada
        novoStatusEtiqueta = 'CANCELADO';
        // Só cancelar pedido se ainda não foi enviado
        if (['PAGO', 'EM_PREPARACAO'].includes(pedido.status)) {
          novoStatusPedido = 'CANCELADO';
        }
        console.log('❌ Etiqueta cancelada');
        break;

      case 'order.undelivered':
        // Não pôde ser entregue
        novoStatusEtiqueta = 'NAO_ENTREGUE';
        console.log('📪 Encomenda não pôde ser entregue');
        break;

      case 'order.paused':
        // Entrega pausada - ação do destinatário necessária
        novoStatusEtiqueta = 'PAUSADA';
        console.log('⏸️ Entrega pausada - ação do destinatário necessária');
        break;

      case 'order.suspended':
        // Encomenda suspensa
        novoStatusEtiqueta = 'SUSPENSA';
        console.log('🚫 Encomenda suspensa');
        break;

      default:
        console.log(`ℹ️ Evento não tratado: ${event}`);
        return res.status(200).json({ received: true, info: 'event_not_handled' });
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {};
    
    if (novoStatusPedido && novoStatusPedido !== pedido.status) {
      dadosAtualizacao.status = novoStatusPedido;
    }
    
    if (novoStatusEtiqueta) {
      dadosAtualizacao.statusEtiqueta = novoStatusEtiqueta;
    }
    
    if (codigoRastreio && codigoRastreio !== pedido.codigoRastreio) {
      dadosAtualizacao.codigoRastreio = codigoRastreio;
    }
    
    // COMENTEI pois empresaFrete é a empresa selecionada no momento do pagamento do produto
    // if (empresaFrete && empresaFrete !== pedido.empresaFrete) {
    //   dadosAtualizacao.empresaFrete = empresaFrete;
    // }

    // Ja explicado
    // if (dataFinalizado) {
    //   dadosAtualizacao.dataFinalizado = dataFinalizado;
    // }

    // Atualizar o pedido no banco se houver mudanças
    if (Object.keys(dadosAtualizacao).length > 0) {
      const pedidoAtualizado = await prisma.pedidos.update({
        where: { id: pedido.id },
        data: dadosAtualizacao
      });

      console.log('✅ Pedido atualizado no banco:', {
        pedidoId: pedidoAtualizado.id,
        statusAnterior: pedido.status,
        novoStatus: pedidoAtualizado.status,
        statusEtiquetaAnterior: pedido.statusEtiqueta,
        novoStatusEtiqueta: pedidoAtualizado.statusEtiqueta,
        codigoRastreio: pedidoAtualizado.codigoRastreio,
        empresaFrete: pedidoAtualizado.empresaFrete
      });

      // Log detalhado para auditoria
      console.log('📋 LOG AUDITORIA:', {
        timestamp: new Date().toISOString(),
        evento: event,
        statusEtiqueta: status,
        pedidoId: pedido.id,
        usuarioId: pedido.usuarioId,
        melhorEnvioId: etiquetaId,
        protocol: protocol,
        alteracoes: dadosAtualizacao,
        webhookData: data
      });

      // Aqui você pode adicionar notificações
      /*
      if (event === 'order.posted') {
        await enviarEmailEnviado(pedido.usuario.email, pedido.id, codigoRastreio);
      }
      
      if (event === 'order.delivered') {
        await enviarEmailEntregue(pedido.usuario.email, pedido.id);
      }
      */

    } else {
      console.log('ℹ️ Nenhuma alteração necessária no banco');
    }

    // SEMPRE retornar 200 OK
    res.status(200).json({ 
      received: true, 
      processed: true,
      pedidoId: pedido.id,
      evento: event,
      statusEtiqueta: status,
      alteracoes: Object.keys(dadosAtualizacao)
    });

  } catch (error) {
    console.error('❌ ERRO ao processar webhook:', error);
    console.error('Stack trace:', error.stack);
    
    // Mesmo com erro, retornar 200
    res.status(200).json({ 
      received: true, 
      processed: false, 
      error: 'processing_error',
      message: error.message 
    });
  }
});

// Rota auxiliar para consultar status
router.get('/:pedidoId/status-envio', async (req, res) => {
  try {
    const { pedidoId } = req.params;
    
    const pedido = await prisma.pedidos.findUnique({
      where: { id: pedidoId },
      select: {
        id: true,
        status: true,
        statusEtiqueta: true,
        codigoRastreio: true,
        melhorEnvioId: true,
        empresaFrete: true,
        dataFinalizado: true,
        criadoEm: true
      }
    });

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json({
      pedidoId: pedido.id,
      statusPedido: pedido.status,
      statusEtiqueta: pedido.statusEtiqueta,
      codigoRastreio: pedido.codigoRastreio,
      melhorEnvioId: pedido.melhorEnvioId,
      empresaFrete: pedido.empresaFrete,
      criadoEm: pedido.criadoEm,
      dataFinalizado: pedido.dataFinalizado
    });

  } catch (error) {
    console.error('Erro ao consultar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para simular webhook no formato correto
router.post('/webhook/melhor-envio/simulate', async (req, res) => {
  const { melhorEnvioId, event = 'order.released' } = req.body;
  
  if (!melhorEnvioId) {
    return res.status(400).json({ error: 'melhorEnvioId é obrigatório' });
  }
  
  // Payload no formato da documentação oficial
  const mockPayload = {
    event: event,
    data: {
      id: melhorEnvioId,
      protocol: `ORD-2024${Date.now()}`,
      status: event.replace('order.', ''),
      tracking: event === 'order.posted' ? `BR${Date.now()}` : null,
      self_tracking: null,
      user_id: "12345",
      tags: [],
      created_at: new Date().toISOString(),
      paid_at: event === 'order.released' ? new Date().toISOString() : null,
      generated_at: event === 'order.generated' ? new Date().toISOString() : null,
      posted_at: event === 'order.posted' ? new Date().toISOString() : null,
      delivered_at: event === 'order.delivered' ? new Date().toISOString() : null,
      canceled_at: event === 'order.cancelled' ? new Date().toISOString() : null,
      expired_at: null,
      tracking_url: event === 'order.posted' ? `https://www.melhorrastreio.com.br/rastreio/BR${Date.now()}` : null
    }
  };

  console.log('🧪 SIMULANDO WEBHOOK:', JSON.stringify(mockPayload, null, 2));
  
  // Chamar a rota principal
  req.body = mockPayload;
  req.headers['x-me-signature'] = 'mock_signature_for_testing';
  req.headers['user-agent'] = 'Melhor Envio Webhooks/1.0';
  
  // Processar como webhook real
  return;
});


module.exports = router;
