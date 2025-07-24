import React, { useState, useCallback } from 'react';
import { ProductContext } from './context';
import api from '../../services/api'; 

export const ProductProvider = ({ children }) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 0,
    currentPage: 1,
    totalProdutos: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchProdutos = useCallback(async (ocasiao = null, page = 1, limit = 25) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (ocasiao) params.ocasiao = ocasiao;

      const response = await api.get('/produtos', { params });
      
      if (response.data.produtos) {
        // Resposta com paginação
        setProdutos(response.data.produtos);
        setPaginationInfo({
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
          totalProdutos: response.data.totalProdutos,
          hasNextPage: response.data.hasNextPage,
          hasPreviousPage: response.data.hasPreviousPage,
        });
      } else {
        // Resposta sem paginação (compatibilidade)
        setProdutos(response.data);
        setPaginationInfo({
          totalPages: 1,
          currentPage: 1,
          totalProdutos: response.data.length,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar produtos para o contexto:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetchProdutos = useCallback(async (ocasiao = null, page = 1, limit = 25) => {
    await fetchProdutos(ocasiao, page, limit);
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
    paginationInfo,
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
