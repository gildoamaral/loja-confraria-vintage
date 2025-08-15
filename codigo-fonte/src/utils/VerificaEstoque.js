const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Função auxiliar para verificar se há estoque suficiente
async function verificarEstoque(pedidoId) {
  try {
    const pedido = await prisma.pedidos.findUnique({
      where: { id: pedidoId },
      include: {
        itens: {
          include: { produto: true }
        }
      }
    });

    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    const problemas = [];
    const itensParaRemover = [];

    for (const item of pedido.itens) {
      let temProblema = false;

      // Verifica se o produto está ativo
      if (!item.produto.ativo) {
        problemas.push({
          produto: item.produto.nome,
          problema: 'Produto não está mais disponível',
          disponivel: 0,
          solicitado: item.quantidade
        });
        itensParaRemover.push(item.id);
        temProblema = true;
      }
      // Verifica se há estoque suficiente
      else if (item.produto.quantidade < item.quantidade) {
        problemas.push({
          produto: item.produto.nome,
          problema: 'Estoque insuficiente',
          disponivel: item.produto.quantidade,
          solicitado: item.quantidade
        });
        itensParaRemover.push(item.id);
        temProblema = true;
      }
    }

    // Remove os itens problemáticos do pedido
    if (itensParaRemover.length > 0) {
      await prisma.itemPedido.deleteMany({
        where: {
          id: { in: itensParaRemover }
        }
      });

      console.log(`Removidos ${itensParaRemover.length} itens problemáticos do pedido ${pedidoId}`);

      // Log dos itens removidos para auditoria
      itensParaRemover.forEach((itemId, index) => {
        const problema = problemas[index];
        console.log(`Item removido: ${problema.produto} - ${problema.problema}`);
      });
    }

    return problemas; // Retorna array vazio se tudo estiver ok
  } catch (error) {
    console.error('Erro ao verificar estoque:', error);
    throw error;
  }
}

// Função auxiliar para diminuir o estoque após pagamento aprovado
async function diminuirEstoque(pedidoId) {
  console.log(`Diminuindo estoque para o pedido ${pedidoId}...`);

  try {
    const pedido = await prisma.pedidos.findUnique({
      where: { id: pedidoId },
      include: {
        itens: {
          include: { produto: true }
        }
      }
    });

    if (!pedido) {
      console.error(`Pedido ${pedidoId} não encontrado`);
      return;
    }

    // Cria uma transação para diminuir a quantidade de cada produto
    const updatePromises = pedido.itens.map(item =>
      prisma.produtos.update({
        where: { id: item.produtoId },
        data: {
          quantidade: {
            decrement: item.quantidade
          }
        }
      })
    );

    const produtosAtualizados = await prisma.$transaction(updatePromises);

    // Verifica se algum produto ficou com quantidade 0 e o desativa
    const produtosParaDesativar = produtosAtualizados
      .filter(produto => produto.quantidade === 0 && produto.ativo)
      .map(produto => produto.id);

    if (produtosParaDesativar.length > 0) {
      await prisma.produtos.updateMany({
        where: {
          id: { in: produtosParaDesativar }
        },
        data: { ativo: false }
      });

      console.log(`Produtos desativados por estoque zerado: ${produtosParaDesativar.join(', ')}`);
    }

    console.log(`Estoque diminuído com sucesso para o pedido ${pedidoId}`);

    // Log das alterações para auditoria
    pedido.itens.forEach(item => {
      const produtoAtualizado = produtosAtualizados.find(p => p.id === item.produtoId);
      const quantidadeRestante = produtoAtualizado ? produtoAtualizado.quantidade : 'N/A';
      const statusProduto = produtoAtualizado && produtoAtualizado.quantidade === 0 ? ' - PRODUTO DESATIVADO' : '';

      console.log(`Produto ${item.produto.nome} (ID: ${item.produtoId}): diminuído ${item.quantidade} unidade(s). Restante: ${quantidadeRestante}${statusProduto}`);
    });

  } catch (error) {
    console.error(`Erro ao diminuir estoque do pedido ${pedidoId}:`, error);
    // Em caso de erro, é importante logar para investigação manual
  }
}

// Função auxiliar para restaurar estoque após estorno
async function restaurarEstoque(pedidoId) {
  console.log(`Restaurando estoque para o pedido ${pedidoId}...`);

  try {
    const pedido = await prisma.pedidos.findUnique({
      where: { id: pedidoId },
      include: {
        itens: {
          include: { produto: true }
        }
      }
    });

    if (!pedido) {
      console.error(`Pedido ${pedidoId} não encontrado`);
      return;
    }

    // Restaura a quantidade de cada produto
    const updatePromises = pedido.itens.map(item => 
      prisma.produtos.update({
        where: { id: item.produtoId },
        data: {
          quantidade: {
            increment: item.quantidade
          },
          // Reativa o produto se ele estava inativo por falta de estoque
          ativo: true
        }
      })
    );

    const produtosAtualizados = await prisma.$transaction(updatePromises);

    console.log(`Estoque restaurado com sucesso para o pedido ${pedidoId}`);

    // Log das alterações para auditoria
    pedido.itens.forEach(item => {
      const produtoAtualizado = produtosAtualizados.find(p => p.id === item.produtoId);
      const quantidadeRestaurada = produtoAtualizado ? produtoAtualizado.quantidade : 'N/A';

      console.log(`Produto ${item.produto.nome} (ID: ${item.produtoId}): restaurado ${item.quantidade} unidade(s). Total: ${quantidadeRestaurada} - PRODUTO REATIVADO`);
    });

  } catch (error) {
    console.error(`Erro ao restaurar estoque do pedido ${pedidoId}:`, error);
  }
}

module.exports = {
  verificarEstoque,
  diminuirEstoque,
  restaurarEstoque
};