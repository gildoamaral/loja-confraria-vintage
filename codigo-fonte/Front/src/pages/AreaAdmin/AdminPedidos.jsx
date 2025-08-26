import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress, Alert, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Pagination
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
// import UndoIcon from '@mui/icons-material/Undo';
import {
  getAdminPedidos,
  updatePedidoStatus,
  getAdminPedidoDetalhes,
  atualizarDadosFrete,
  gerarEtiquetaNovamente,
  // estornarPagamento 
} from '../../services/adminService';
import AtualizarStatusDialog from './components/AtualizarStatusDialog';
import DetalhesPedidoDialog from './components/DetalhesPedidoDialog';
import DadosFreteDialog from './components/DadosFreteDialog';

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
  const [dadosFreteDialogOpen, setDadosFreteDialogOpen] = useState(false);
  // const [loadingEstorno, setLoadingEstorno] = useState(false);

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

  // Funções para dados do frete
  const handleOpenDadosFreteDialog = () => { 
    handleMenuClose(); 
    setDadosFreteDialogOpen(true); 
  };
  
  const handleCloseDadosFreteDialog = () => { 
    setDadosFreteDialogOpen(false); 
    setPedidoSelecionado(null); 
  };
  
  const handleConfirmDadosFrete = async (dadosFrete) => {
    try {
      await atualizarDadosFrete(pedidoSelecionado.id, dadosFrete);
      fetchPedidos(page); // Atualiza a lista
      setError(''); // Limpa erros anteriores
    } catch (updateError) {
      console.error('Erro ao atualizar dados do frete:', updateError);
      throw new Error(updateError.message || 'Falha ao atualizar dados do frete');
    }
  };

  const handleGerarEtiquetaNovamente = async () => {
    if (!pedidoSelecionado) return;
    
    try {
      await gerarEtiquetaNovamente(pedidoSelecionado.id);
      fetchPedidos(page); // Atualiza a lista
      setError(''); // Limpa erros anteriores
      alert('Etiqueta gerada com sucesso!');
    } catch (etiquetaError) {
      console.error('Erro ao gerar etiqueta:', etiquetaError);
      setError('Falha ao gerar etiqueta. Tente novamente.');
    } finally {
      handleMenuClose();
      setPedidoSelecionado(null);
    }
  };

  // const handleEstorno = async () => {
  //   if (!pedidoSelecionado) return;

  //   const confirmEstorno = window.confirm(
  //     `Tem certeza que deseja estornar o pagamento do pedido #${pedidoSelecionado.id}?\n\n` +
  //     `Valor: ${pedidoSelecionado.pagamento?.valorTotal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n` +
  //     `Esta ação não pode ser desfeita.`
  //   );

  //   if (!confirmEstorno) return;

  //   setLoadingEstorno(true);
  //   try {
  //     await estornarPagamento(pedidoSelecionado.id);
  //     fetchPedidos(page); // Atualiza a lista
  //     setError(''); // Limpa erros anteriores
  //     alert('Estorno realizado com sucesso!');
  //   } catch (estornoError) {
  //     console.error('Erro ao processar estorno:', estornoError);
  //     setError('Falha ao processar estorno. Verifique se o pagamento pode ser estornado.');
  //   } finally {
  //     setLoadingEstorno(false);
  //     handleMenuClose();
  //     setPedidoSelecionado(null);
  //   }
  // };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EM_PREPARACAO':
        return 'success';
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
      case 'REEMBOLSADO':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusEtiquetaColor = (statusEtiqueta) => {
    switch (statusEtiqueta) {
      case 'AGUARDANDO_DADOS':
        return 'warning';
      case 'PROCESSANDO':
        return 'info';
      case 'AGUARDANDO_PAGAMENTO':
        return 'info';
      case 'FALHA_NA_GERACAO':
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
    <Box >
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
              <TableCell align="center">Status Etiqueta</TableCell>
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
                    // label={pedido.status.replace('_', ' ')}
                    label={pedido.status === "EM_PREPARACAO" ? "PAGO" : pedido.status.replace('_', ' ')}
                    color={getStatusColor(pedido.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  {pedido.statusEtiqueta ? (
                    <Chip
                      label={pedido.statusEtiqueta.replace('_', ' ')}
                      color={getStatusEtiquetaColor(pedido.statusEtiqueta)}
                      size="small"
                    />
                  ) : '-'}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    aria-label="ações"
                    onClick={(event) => handleMenuClick(event, pedido)}
                    disabled={pedido.status === 'ENTREGUE'}
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

        {/* Ação: Configurar Dados do Frete (para pedidos em preparação) */}
        {pedidoSelecionado?.status === 'EM_PREPARACAO' && pedidoSelecionado?.statusEtiqueta === 'AGUARDANDO_DADOS' && (
          <MenuItem onClick={handleOpenDadosFreteDialog}>
            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Configurar Dados do Frete</ListItemText>
          </MenuItem>
        )}

        {/* Ação: Tentar Gerar Etiqueta Novamente (para falhas) */}
        {pedidoSelecionado?.statusEtiqueta === 'FALHA_NA_GERACAO' && (
          <MenuItem onClick={handleGerarEtiquetaNovamente}>
            <ListItemIcon><RefreshIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Tentar Gerar Etiqueta Novamente</ListItemText>
          </MenuItem>
        )}

        {/* Ação: Marcar como Enviado */}
        {pedidoSelecionado?.status === 'EM_PREPARACAO' && pedidoSelecionado?.statusEtiqueta === 'AGUARDANDO_PAGAMENTO' && (
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

        {/* Ação: Estornar Pagamento */}
        {/* {(pedidoSelecionado?.status === 'PAGO' || pedidoSelecionado?.status === 'ENVIADO') && (
          <MenuItem onClick={handleEstorno} disabled={loadingEstorno}>
            <ListItemIcon><UndoIcon fontSize="small" /></ListItemIcon>
            <ListItemText>{loadingEstorno ? 'Processando...' : 'Estornar Pagamento'}</ListItemText>
          </MenuItem>
        )} */}
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
      
      <DadosFreteDialog
        open={dadosFreteDialogOpen}
        onClose={handleCloseDadosFreteDialog}
        pedido={pedidoSelecionado}
        onConfirm={handleConfirmDadosFrete}
      />
    </Box>
  );
};

export default AdminPedidos;