const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middlewares/Auth'); // <-- Importa o middleware de autenticação

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
          enderecoEntrega: usuario.endereco,
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
      where: { id: parseInt(pedidoId) },
      data: { status: 'AGUARDANDO_PAGAMENTO' },
    });

    res.json(pedido);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao finalizar pedido' });
  }
});

// Criar Pagamento
router.post('/pagamento', async (req, res) => {
  const { pedidoId, valor, metodo } = req.body;

  try {
    const pagamento = await prisma.pagamentos.create({
      data: {
        pedidoId,
        valor,
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
  const { enderecoEntrega } = req.body;

  try {
    const pedido = await prisma.pedidos.update({
      where: { id: parseInt(pedidoId) },
      data: { enderecoEntrega },
    });
    res.json(pedido);
  } catch (err) {
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
          include: { produto: true }
        }
      }
    });
    if (!pedido) {
      return res.status(404).json({ message: 'Nenhum pedido em andamento encontrado.' });
    }
    // console.log('Pedido encontrado:', pedido);


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
  const usuarioId = req.user.userId;
  try {
    const pedidos = await prisma.pedidos.findMany({
  where: { usuarioId },
  include: {
    itens: {
      include: {
        produto: true, // inclui todos os campos do produto, incluindo preco e imagem
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

// Buscar todos os pedidos pagos da loja
router.get('/pagos', auth, async (req, res) => {
  try {
    const pedidos = await prisma.pedidos.findMany({
  where: {
    status: {
    in: ['PAGO', 'ENVIADO', 'CANCELADO']
    }},
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

module.exports = router;
