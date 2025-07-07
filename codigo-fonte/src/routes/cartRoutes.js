const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { protect } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/cart/count
 * @desc    Retorna o número total de itens no carrinho do usuário logado
 * @access  Private (requer login)
 */
router.get('/count', protect, async (req, res) => {
  // O middleware `protect` já foi executado. Se não houver usuário, ele não chegará aqui.
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  try {
    // 1. Encontrar o pedido do usuário que está com o status de CARRINHO
    const cartOrder = await prisma.pedidos.findFirst({
      where: {
        usuarioId: req.user.id,
        status: 'CARRINHO',
      },
      select: { id: true } // Só precisamos do ID do pedido
    });

    // Se não houver um pedido de carrinho, o total é 0
    if (!cartOrder) {
      return res.status(200).json({ count: 0 });
    }

    // 2. Somar a 'quantidade' de todos os itens nesse pedido
    const totalItems = await prisma.itemPedido.aggregate({
      _sum: {
        quantidade: true,
      },
      where: {
        pedidoId: cartOrder.id,
      },
    });

    const count = totalItems._sum.quantidade || 0;
    res.status(200).json({ count });

  } catch (error) {
    console.error("Erro ao buscar contagem do carrinho:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

module.exports = router;