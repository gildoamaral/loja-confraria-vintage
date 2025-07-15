const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authAdmin = require('../middlewares/AuthAdmin'); // Middleware que verifica se o usuário é ADMIN

const prisma = new PrismaClient();
const router = express.Router();

// ROTA: GET /api/admin/pedidos
// DESC: Retorna uma lista de todos os pedidos que necessitam de ação (não são carrinhos)
// ACESSO: Restrito a Administradores
router.get('/pedidos', authAdmin, async (req, res) => {
  try {
    const pedidos = await prisma.pedidos.findMany({
      where: {
        // Filtra para mostrar apenas pedidos que já saíram da fase de carrinho
        NOT: {
          status: 'CARRINHO',
        },
      },
      include: {
        // Inclui o nome do usuário em cada pedido para fácil identificação
        usuario: {
          select: {
            nome: true,
            sobrenome: true,
          },
        },
        pagamento: {
            select: {
                valor: true
            }
        }
      },
      orderBy: {
        // Ordena para que os pedidos mais recentes apareçam primeiro
        dataFinalizado: 'desc',
      },
    });

    res.status(200).json(pedidos);
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

module.exports = router;