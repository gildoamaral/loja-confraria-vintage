const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authAdmin = require('../middlewares/AuthAdmin'); // Middleware que verifica se o usuário é ADMIN

const prisma = new PrismaClient();
const router = express.Router();

// ROTA: GET /api/admin/pedidos
router.get('/pedidos', authAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = 10; // Itens por página
    const skip = (page - 1) * limit;

    const whereClause = {
      NOT: {
        status: 'CARRINHO',
      },
    };

    // Usamos uma transação para pegar os pedidos da página E o número total de pedidos
    const [pedidos, total] = await prisma.$transaction([
      prisma.pedidos.findMany({
        where: whereClause,
        include: {
          usuario: {
            select: { nome: true, sobrenome: true },
          },
          pagamento: {
            select: { valorTotal: true },
          },
        },
        orderBy: {
          dataFinalizado: 'desc',
        },
        take: limit, // Pega apenas 10
        skip: skip,  // Pula os itens das páginas anteriores
      }),
      prisma.pedidos.count({ where: whereClause }),
    ]);

    res.status(200).json({
      pedidos,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
 
  } catch (error) {
    console.error('Erro ao buscar pedidos para o painel de admin:', error);
    res.status(500).json({ msg: 'Erro no servidor.' });
  }
});

// ROTA: PATCH /api/admin/pedidos/:id/status
// DESC: Atualiza o status e o código de rastreio de um pedido
// ACESSO: Restrito a Administradores
router.patch('/pedidos/:id/status', authAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, codigoRastreio } = req.body;

  if (!status) {
    return res.status(400).json({ msg: 'O novo status é obrigatório.' });
  }

  try {
    const pedidoAtualizado = await prisma.pedidos.update({
      where: {
        id: id, // Assumindo que seu ID de pedido é uma string (UUID)
      },
      data: {
        status: status,
        codigoRastreio: codigoRastreio, // Se codigoRastreio for undefined, o Prisma o ignorará
      },
    });

    // Opcional: Aqui seria o local ideal para disparar um e-mail para o cliente
    // informando sobre a atualização do status e o código de rastreio.

    res.status(200).json(pedidoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    // Verifica se o erro é porque o pedido não foi encontrado
    if (error.code === 'P2025') {
        return res.status(404).json({ msg: `Pedido com ID ${id} não encontrado.` });
    }
    res.status(500).json({ msg: 'Erro no servidor.' });
  }
});

// ROTA: GET /api/admin/pedidos/:id
// DESC: Retorna todos os detalhes de um pedido específico para o admin
// ACESSO: Restrito a Administradores
router.get('/pedidos/:id', authAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await prisma.pedidos.findUnique({
      where: { id: id },
      include: {
        // Inclui todas as informações do cliente
        usuario: true,
        // Inclui os detalhes do pagamento
        pagamento: true,
        // Inclui a lista de itens do pedido
        itens: {
          include: {
            // Para cada item, inclui os detalhes completos do produto
            produto: {
              include: {
                imagens: {
                  take: 1, // Pega apenas a primeira imagem para exibição
                  orderBy: { posicao: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!pedido) {
      return res.status(404).json({ msg: `Pedido com ID ${id} não encontrado.` });
    }

    // Remove a senha do objeto do usuário antes de enviar a resposta
    if (pedido.usuario) {
      delete pedido.usuario.senha;
    }

    res.status(200).json(pedido);
  } catch (error) {
    console.error(`Erro ao buscar detalhes do pedido ${id}:`, error);
    res.status(500).json({ msg: 'Erro no servidor.' });
  }
});

module.exports = router;