import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  Alert,
  Snackbar,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableSortLabel,
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import { Link } from 'react-router-dom';

const NewEstoqueProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // Estados para controlar o modal de edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Estados para filtros e pesquisa - valores aplicados
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('TODAS');
  const [ocasiao, setOcasiao] = useState('TODAS');
  const [ativo, setAtivo] = useState('TODOS');
  
  // Estados para inputs dos filtros - valores temporários
  const [searchInput, setSearchInput] = useState('');
  const [categoriaInput, setCategoriaInput] = useState('TODAS');
  const [ocasiaoInput, setOcasiaoInput] = useState('TODAS');
  const [ativoInput, setAtivoInput] = useState('TODOS');
  
  const [orderBy, setOrderBy] = useState('criadoEm');
  const [orderDirection, setOrderDirection] = useState('desc');

  // Estados para controlar as mensagens
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Opções para os filtros
  const categorias = [
    'TODAS', 'SAIA', 'SHORT', 'CALÇA', 'BLUSA', 'CAMISA', 'CONJUNTOS', 
    'VESTIDO', 'CALCADO', 'ACESSORIOS', 'OUTROS'
  ];

  const ocasioes = [
    'TODAS', 'SEM_OCASIAO', 'CASAMENTO', 'BATIZADO', 'MADRINHAS', 
    'FORMATURA', 'OCASIOES_ESPECIAIS', 'CASUAL', 'FESTAS', 'OUTROS'
  ];

  const statusOptions = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'true', label: 'Ativos' },
    { value: 'false', label: 'Inativos' }
  ];

  const showMessage = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchProdutos = useCallback(async (currentPage) => {
    setLoading(true);
    try {
      // Constrói os parâmetros da query
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        orderBy,
        orderDirection
      });

      // Adiciona filtros apenas se não forem valores padrão
      if (search.trim()) {
        params.append('search', search.trim());
      }
      if (categoria !== 'TODAS') {
        params.append('categoria', categoria);
      }
      if (ocasiao !== 'TODAS') {
        params.append('ocasiao', ocasiao);
      }
      if (ativo !== 'TODOS') {
        params.append('ativo', ativo);
      }

      const response = await api.get(`/produtos/estoque/paginated?${params.toString()}`);
      setProdutos(response.data.produtos);
      setTotalPages(response.data.totalPages);
      setPage(response.data.currentPage);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      showMessage('Erro ao buscar produtos', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, categoria, ocasiao, ativo, orderBy, orderDirection]);

  useEffect(() => {
    fetchProdutos(page);
  }, [page, fetchProdutos]);

  // Função para executar a pesquisa (aplicar todos os filtros)
  const handleSearch = () => {
    setSearch(searchInput.trim());
    setCategoria(categoriaInput);
    setOcasiao(ocasiaoInput);
    setAtivo(ativoInput);
    setPage(1); // Volta para a primeira página
  };

  // Função para lidar com Enter em qualquer campo
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Removemos a função handleFilterChange pois não precisamos mais dela

  // Função para lidar com ordenação
  const handleSort = (column) => {
    if (orderBy === column) {
      // Se já está ordenando por esta coluna, inverte a direção
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Se é uma nova coluna, define ela como ordenação e direção padrão
      setOrderBy(column);
      setOrderDirection('asc');
    }
    setPage(1); // Volta para a primeira página
  };

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
      showMessage('Produto atualizado com sucesso!', 'success');
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      
      // MUDANÇA AQUI: Tenta pegar a mensagem de erro específica da API
      const errorMessage = error.response?.data?.error || 'Falha ao atualizar o produto.';
      showMessage(errorMessage, 'error');
    }
  };

  if (loading && produtos.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{maxWidth: '1400px', mx: 'auto' }}>
      {/* Filtros e Pesquisa */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filtros e Pesquisa
        </Typography>
        <Grid container spacing={2} alignItems="center">
          {/* Campo de Pesquisa */}
          <Grid size={{ xs: 12, md: 2.5 }}>
            <TextField
              fullWidth
              label="Pesquisar por nome"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
            />
          </Grid>

          {/* Filtro Categoria */}
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoria</InputLabel>
              <Select
                value={categoriaInput}
                label="Categoria"
                onChange={(e) => setCategoriaInput(e.target.value)}
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat === 'TODAS' ? 'Todas' : cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro Ocasião */}
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Ocasião</InputLabel>
              <Select
                value={ocasiaoInput}
                label="Ocasião"
                onChange={(e) => setOcasiaoInput(e.target.value)}
              >
                {ocasioes.map((oc) => (
                  <MenuItem key={oc} value={oc}>
                    {oc === 'TODAS' ? 'Todas' : 
                     oc === 'SEM_OCASIAO' ? 'Sem Ocasião' : oc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro Status */}
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={ativoInput}
                label="Status"
                onChange={(e) => setAtivoInput(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Botão de Pesquisa */}
          <Grid size={{ xs: 12, md: 1.5 }}>
            <IconButton
              onClick={handleSearch}
              size="large"
              sx={{
                color: 'primary.dark',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: '#fff',
                },
                width: '40px',
                height: '40px'
              }}
            >
              <SearchIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="tabela de produtos" size="small">
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 2 } }}>
              <TableCell sx={{ width: '60px' }}>Foto</TableCell>
              <TableCell sx={{ width: '80px' }}>ID</TableCell>
              
              {/* Nome - ordenável */}
              <TableCell sx={{ width: '300px', minWidth: '250px' }}>
                <TableSortLabel
                  active={orderBy === 'nome'}
                  direction={orderBy === 'nome' ? orderDirection : 'asc'}
                  onClick={() => handleSort('nome')}
                  hideSortIcon={false}
                  sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}
                >
                  Nome
                </TableSortLabel>
              </TableCell>
              
              {/* Preço - ordenável */}
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'preco'}
                  direction={orderBy === 'preco' ? orderDirection : 'asc'}
                  onClick={() => handleSort('preco')}
                  hideSortIcon={false}
                  sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}
                >
                  Preço
                </TableSortLabel>
              </TableCell>
              
              <TableCell align="right">Qtd.</TableCell>
              
              {/* Categoria - ordenável */}
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'categoria'}
                  direction={orderBy === 'categoria' ? orderDirection : 'asc'}
                  onClick={() => handleSort('categoria')}
                  hideSortIcon={false}
                  sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}
                >
                  Categoria
                </TableSortLabel>
              </TableCell>
              
              {/* Ocasião - ordenável */}
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'ocasiao'}
                  direction={orderBy === 'ocasiao' ? orderDirection : 'asc'}
                  onClick={() => handleSort('ocasiao')}
                  hideSortIcon={false}
                  sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}
                >
                  Ocasião
                </TableSortLabel>
              </TableCell>
              
              {/* Data Criação - ordenável */}
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'criadoEm'}
                  direction={orderBy === 'criadoEm' ? orderDirection : 'asc'}
                  onClick={() => handleSort('criadoEm')}
                  hideSortIcon={false}
                  sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}
                >
                  Data Criação
                </TableSortLabel>
              </TableCell>
              
              {/* Ativo - ordenável */}
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'ativo'}
                  direction={orderBy === 'ativo' ? orderDirection : 'asc'}
                  onClick={() => handleSort('ativo')}
                  hideSortIcon={false}
                  sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}
                >
                  Ativo
                </TableSortLabel>
              </TableCell>
              
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
                <TableCell sx={{ width: '60px' }}>
                  <Avatar variant='rounded' src={produto.imagens?.[0]?.urls?.thumbnail} alt={produto.nome} />
                </TableCell>
                <TableCell sx={{ width: '80px' }}> 
                  <Link 
                    to={`/produto/${produto.id}`}
                    style={{ 
                      textDecoration: 'none', 
                      color: 'inherit',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {e.target.style.color = 'gray', e.target.style.textDecoration = 'underline'}}
                    onMouseLeave={(e) => {e.target.style.color = 'inherit', e.target.style.textDecoration = 'none'}}
                  >
                    {produto.id}
                  </Link>
                </TableCell>
                <TableCell sx={{ width: '300px', minWidth: '250px' }}>{produto.nome}</TableCell>
                <TableCell align="right">R$ {produto.preco.toFixed(2)}</TableCell>
                <TableCell align="right">{produto.quantidade}</TableCell>
                <TableCell>{produto.categoria}</TableCell>
                <TableCell>{produto.ocasiao || '-'}</TableCell>
                <TableCell>
                  {new Date(produto.criadoEm).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewEstoqueProdutos;