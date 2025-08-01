import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress, Alert, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Pagination
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getAdminPedidos, updatePedidoStatus, getAdminPedidoDetalhes } from '../../services/adminService';
import AtualizarStatusDialog from './components/AtualizarStatusDialog';
import DetalhesPedidoDialog from './components/DetalhesPedidoDialog';

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Novos estados para paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [detalhesDialogOpen, setDetalhesDialogOpen] = useState(false);
  const [pedidoDetalhado, setPedidoDetalhado] = useState(null);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // A função fetch agora depende da página
  const fetchPedidos = async (currentPage) => {
    setLoading(true);
    try {
      const data = await getAdminPedidos(currentPage);
      setPedidos(data.pedidos);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  // useEffect agora observa a variável 'page'
  useEffect(() => {
    fetchPedidos(page);
  }, [page]);

  // Função para lidar com a mudança de página
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleOpenDetalhesDialog = async (pedido) => {
    handleMenuClose();
    setLoadingDetalhes(true);
    setDetalhesDialogOpen(true);
    try {
      // Busca os detalhes mais recentes do pedido na API
      const data = await getAdminPedidoDetalhes(pedido.id);
      setPedidoDetalhado(data);
    } catch {
      setError("Falha ao carregar detalhes do pedido.");
    } finally {
      setLoadingDetalhes(false);
    }
  };

  const handleCloseDetalhesDialog = () => {
    setDetalhesDialogOpen(false);
    setPedidoDetalhado(null); // Limpa os dados ao fechar
  };

  const handleMenuClick = (event, pedido) => { setAnchorEl(event.currentTarget); setPedidoSelecionado(pedido); };
  const handleMenuClose = () => { setAnchorEl(null); };
  const handleOpenDialog = () => { handleMenuClose(); setDialogOpen(true); };
  const handleCloseDialog = () => { setDialogOpen(false); setPedidoSelecionado(null); };
  const handleUpdate = async (dados) => { if (!pedidoSelecionado) return; try { await updatePedidoStatus(pedidoSelecionado.id, dados); fetchPedidos(page); } catch (updateError) { console.error(updateError); setError('Falha ao atualizar o pedido.'); } finally { handleMenuClose(); setPedidoSelecionado(null); } };
  const handleConfirmUpdateEnviado = async (dados) => { await handleUpdate(dados); handleCloseDialog(); };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAGO':
        return 'success';
      case 'AGUARDANDO_PAGAMENTO':
        return 'warning';
      case 'ENVIADO':
        return 'info';
      case 'ENTREGUE':
        return 'primary'
      case 'CANCELADO':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && pedidos.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Painel de Gerenciamento de Pedidos
      </Typography>
      <TableContainer component={Paper} >
        <Table sx={{ minWidth: 650 }} size={'small'} aria-label="tabela de pedidos">

          <TableHead>
            <TableRow>
              <TableCell>Pedido ID</TableCell>
              <TableCell>Rastreio</TableCell>
              <TableCell>Empresa Frete</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell align="right">Valor Total</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell component="th" scope="row">
                  #{pedido.id}
                </TableCell>
                <TableCell component="th" scope="row">
                  {pedido.codigoRastreio || '-'}
                </TableCell>
                <TableCell component="th" scope="row">
                  {pedido.empresaFrete || '-'}
                </TableCell>
                <TableCell>{new Date(pedido.dataFinalizado).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{`${pedido.usuario.nome} ${pedido.usuario.sobrenome}`}</TableCell>
                <TableCell align="right">
                  {pedido.pagamento?.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={pedido.status.replace('_', ' ')}
                    color={getStatusColor(pedido.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    aria-label="ações"
                    onClick={(event) => handleMenuClick(event, pedido)}
                    disabled={pedido.status === 'ENTREGUE' || pedido.status === 'CANCELADO'}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>

      {/* COMPONENTE DE PAGINAÇÃO */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, p: 2 }}>
        {totalPages > 0 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
          />
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >

        {/* Ação: Ver Detalhes (sempre disponível se o menu estiver aberto) */}
        <MenuItem onClick={() => handleOpenDetalhesDialog(pedidoSelecionado)}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Ver Detalhes</ListItemText>
        </MenuItem>

        {/* Ação: Marcar como Enviado */}
        {pedidoSelecionado?.status === 'PAGO' && (
          <MenuItem onClick={handleOpenDialog}>
            <ListItemIcon><LocalShippingIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Marcar como Enviado</ListItemText>
          </MenuItem>
        )}

        {/* Ação: Marcar como Entregue */}
        {pedidoSelecionado?.status === 'ENVIADO' && (
          <MenuItem onClick={() => handleUpdate({ status: 'ENTREGUE' })}>
            <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Marcar como Entregue</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <AtualizarStatusDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        pedido={pedidoSelecionado}
        onConfirm={handleConfirmUpdateEnviado}
      />
      <DetalhesPedidoDialog
        open={detalhesDialogOpen}
        onClose={handleCloseDetalhesDialog}
        pedido={loadingDetalhes ? null : pedidoDetalhado} // Mostra o diálogo apenas com os dados prontos
      />
    </Box>
  );
};

export default AdminPedidos;