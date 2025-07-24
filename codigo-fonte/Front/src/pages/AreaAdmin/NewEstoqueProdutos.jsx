import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Importando o serviço de API
import EditProductModal from './components/EditProductModal'; // Importaremos o modal que criaremos a seguir
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Pagination,
  IconButton,
  Avatar,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';

const NewEstoqueProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // Estados para controlar o modal de edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProdutos = async (currentPage) => {
    setLoading(true);
    try {
      const response = await api.get(`/produtos/estoque/paginated?page=${currentPage}&limit=10`);
      console.log("Produtos recebidos:", response.data);
      setProdutos(response.data.produtos);
      setTotalPages(response.data.totalPages);
      setPage(response.data.currentPage);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos(page);
  }, [page]);

  const handleEditClick = (produto) => {
    setEditingProduct(produto);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (updatedProduct) => {
    try {
      await api.put(`/produtos/${updatedProduct.id}`, updatedProduct);
      handleCloseModal();
      fetchProdutos(page); // Atualiza a tabela com os novos dados
      alert('Produto atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      
      // MUDANÇA AQUI: Tenta pegar a mensagem de erro específica da API
      const errorMessage = error.response?.data?.error || 'Falha ao atualizar o produto.';
      alert(errorMessage);
    }
  };

  if (loading && produtos.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Lista de Produtos</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="tabela de produtos" size="small">
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 2 } }}>
              <TableCell>Foto</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell align="right">Preço</TableCell>
              <TableCell align="right">Qtd.</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Ocasião</TableCell>
              <TableCell>Destaque</TableCell>
              <TableCell>Ativo</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {produtos.map((produto) => (
              <TableRow 
                key={produto.id} 
                sx={{ 
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <TableCell >
                  <Avatar variant='rounded' src={produto.imagens?.[0]?.urls?.thumbnail} alt={produto.nome} />
                </TableCell>
                <TableCell>{produto.id}</TableCell>
                <TableCell>{produto.nome}</TableCell>
                <TableCell align="right">R$ {produto.preco.toFixed(2)}</TableCell>
                <TableCell align="right">{produto.quantidade}</TableCell>
                <TableCell>{produto.categoria}</TableCell>
                <TableCell>{produto.ocasiao || '-'}</TableCell>
                <TableCell align="center">
                  {produto.emDestaque && <StarIcon color="warning" fontSize="small" />}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={produto.ativo ? 'Sim' : 'Não'} 
                    color={produto.ativo ? 'success' : 'error'} 
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleEditClick(produto)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={(event, value) => setPage(value)} 
          color="primary"
        />
      </Box>

      {editingProduct && (
        <EditProductModal
          open={isModalOpen}
          onClose={handleCloseModal}
          product={editingProduct}
          onSave={handleSaveProduct}
        />
      )}
    </Box>
  );
};

export default NewEstoqueProdutos;