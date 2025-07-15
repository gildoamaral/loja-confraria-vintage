import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress, Alert, IconButton, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getAdminPedidos, updatePedidoStatus } from '../../services/adminService';
import AtualizarStatusDialog from './components/AtualizarStatusDialog';
// Supondo que você também terá um dialog de detalhes
// import DetalhesPedidoDialog from './components/DetalhesPedidoDialog'; 

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  // const [detalhesDialogOpen, setDetalhesDialogOpen] = useState(false); // Para o futuro modal de detalhes

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const data = await getAdminPedidos();
      setPedidos(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleMenuClick = (event, pedido) => {
    setAnchorEl(event.currentTarget);
    setPedidoSelecionado(pedido);
  };

  // CORREÇÃO 1: Apenas fecha o menu, não limpa o pedido
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    handleMenuClose();
    setDialogOpen(true);
  };

  // CORREÇÃO 2: Limpa o pedido selecionado APÓS fechar o diálogo
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setPedidoSelecionado(null);
  };

  const handleUpdate = async (dados) => {
    if (!pedidoSelecionado) return;
    try {
      await updatePedidoStatus(pedidoSelecionado.id, dados);
      fetchPedidos(); // Recarrega a lista
    } catch (updateError) {
      console.error(updateError);
      setError('Falha ao atualizar o pedido.');
    } finally {
        handleMenuClose(); // Fecha o menu de ações
        setPedidoSelecionado(null); // Limpa a seleção
    }
  };
  
  const handleConfirmUpdateEnviado = async (dados) => {
    await handleUpdate(dados);
    handleCloseDialog();
  };
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
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="tabela de pedidos">
          <TableHead>
            <TableRow>
              <TableCell>Pedido ID</TableCell>
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
                <TableCell>{new Date(pedido.dataFinalizado).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{`${pedido.usuario.nome} ${pedido.usuario.sobrenome}`}</TableCell>
                <TableCell align="right">
                  {pedido.pagamento?.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={pedido.status.replace('_', ' ')} 
                    color={getStatusColor(pedido.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  {/* CORREÇÃO 3: Desabilita o botão para status finais */}
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {/* CORREÇÃO 4: LÓGICA DE MENU EXPANDIDA */}
        
        {/* Ação: Ver Detalhes (sempre disponível se o menu estiver aberto) */}
{/*         
        <MenuItem onClick={() => {  handleMenuClose(); }}>
            <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Ver Detalhes</ListItemText>
        </MenuItem> */}

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
    </Box>
  );
};

export default AdminPedidos;