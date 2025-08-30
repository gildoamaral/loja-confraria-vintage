// src/services/freteService.js
import { embalagens } from '../config/embalagens.js';

/**
 * Escolhe a menor embalagem possível que comporta todos os itens.
 * @param {Array<Object>} itens - Lista de itens com seus dados do banco.
 * Cada item deve ter: produto.peso, produto.altura, produto.largura, produto.comprimento, quantidade.
 * @returns {Object} - { embalagemEscolhida, pesoTotal }
 */
export function escolherEmbalagem(itens) {
  // 1. Calcular o volume total e o peso total dos PRODUTOS
  let volumeTotalProdutos = 0;
  let pesoTotalProdutos = 0;

  itens.forEach(item => {
    // As dimensões no seu schema são do produto dobrado 
    const volumeUnitario = (item.produto.altura * item.produto.largura * item.produto.comprimento) / 1000; // em litros
    volumeTotalProdutos += volumeUnitario * item.quantidade;
    pesoTotalProdutos += item.produto.peso * item.quantidade; // 
  });

  // 2. Encontrar a menor embalagem que suporte o volume total
  const embalagemIdeal = embalagens.find(embalagem => {
    return embalagem.volumeMax >= volumeTotalProdutos;
  });

  // 3. Se nenhuma embalagem servir (pedido muito grande)
  if (!embalagemIdeal) {
    throw new Error('O volume do pedido excede nossa maior embalagem. Por favor, entre em contato.');
  }

  // 4. Calcular o peso final (produtos + embalagem)
  const pesoTotalFinal = pesoTotalProdutos + embalagemIdeal.peso;

  return {
    embalagemEscolhida: {
      altura: embalagemIdeal.altura,     // 
      largura: embalagemIdeal.largura,   // 
      comprimento: embalagemIdeal.comprimento, // 
    },
    pesoTotal: pesoTotalFinal, // 
  };
}