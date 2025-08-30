// src/services/freteService.js
const { embalagens } = require('../config/embalagens.js');

/**
 * Escolhe a menor embalagem possível que comporta todos os itens.
 * @param {Array<Object>} itens - Lista de itens com seus dados do banco.
 * Cada item deve ter: produto.peso, produto.altura, produto.largura, produto.comprimento, quantidade.
 * @returns {Object} - { embalagemEscolhida, pesoTotal }
 */
function escolherEmbalagem(itens) {
  // 1. Calcular o volume total e o peso total dos PRODUTOS
  let volumeTotalProdutos = 0;
  let pesoTotalProdutos = 0;

  itens.forEach(item => {
    // Verificar se o produto tem dimensões válidas
    const altura = item.produto.altura || 5; // valor padrão se não tiver
    const largura = item.produto.largura || 15;
    const comprimento = item.produto.comprimento || 10;
    const peso = item.produto.peso || 0.1;

    // As dimensões no seu schema são do produto dobrado 
    const volumeUnitario = (altura * largura * comprimento) / 1000; // em litros
    volumeTotalProdutos += volumeUnitario * item.quantidade;
    pesoTotalProdutos += peso * item.quantidade;
  });

  console.log('Volume total dos produtos:', volumeTotalProdutos, 'litros');
  console.log('Peso total dos produtos:', pesoTotalProdutos, 'kg');

  // 2. Encontrar a menor embalagem que suporte o volume total
  const embalagemIdeal = embalagens.find(embalagem => {
    return embalagem.volumeMax >= volumeTotalProdutos;
  });

  // 3. Se nenhuma embalagem servir (pedido muito grande)
  if (!embalagemIdeal) {
    throw new Error('O volume do pedido excede nossa maior embalagem. Por favor, entre em contato.');
  }

  console.log('Embalagem escolhida:', embalagemIdeal.nome);

  // 4. Calcular o peso final (produtos + embalagem)
  const pesoTotalFinal = pesoTotalProdutos + embalagemIdeal.peso;

  return {
    embalagemEscolhida: {
      altura: embalagemIdeal.altura,
      largura: embalagemIdeal.largura,
      comprimento: embalagemIdeal.comprimento,
    },
    pesoTotal: pesoTotalFinal,
    embalagemInfo: embalagemIdeal
  };
}

module.exports = { escolherEmbalagem };