import { useContext } from 'react';
import { CarrinhoContext } from './CarrinhoContext';
/**
 * Hook para acessar o contexto do carrinho de compras.
 * @returns {Object} O contexto do carrinho de compras.
 */

export function useCarrinho() {
  return useContext(CarrinhoContext);
}
