import React, { useState, useCallback } from 'react';
import { ProductContext } from './context';
import api from '../../services/api'; 

export const ProductProvider = ({ children }) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [foiBuscado, setFoiBuscado] = useState(false); 
  const [error, setError] = useState(null);

  const fetchProdutos = useCallback(async () => {
    if (foiBuscado) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/produtos');
      setProdutos(response.data);
      setFoiBuscado(true);
    } catch (error) {
      console.error("Erro ao buscar produtos para o contexto:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [foiBuscado]);

  const refetchProdutos = useCallback(async () => {
    setFoiBuscado(false);
    await fetchProdutos();
  }, [fetchProdutos]);

  const addProduto = useCallback((novoProduto) => {
    setProdutos(prev => [...prev, novoProduto]);
  }, []);

  const updateProduto = useCallback((id, produtoAtualizado) => {
    setProdutos(prev => 
      prev.map(produto => 
        produto.id === id ? { ...produto, ...produtoAtualizado } : produto
      )
    );
  }, []);

  const removeProduto = useCallback((id) => {
    setProdutos(prev => prev.filter(produto => produto.id !== id));
  }, []);

  const value = {
    produtos,
    loading,
    error,
    fetchProdutos,
    refetchProdutos,
    addProduto,
    updateProduto,
    removeProduto,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
