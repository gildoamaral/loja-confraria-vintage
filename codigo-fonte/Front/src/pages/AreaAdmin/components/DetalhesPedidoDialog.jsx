import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Box, Grid, Divider, Avatar, List, ListItem, ListItemAvatar, ListItemText,
  Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptIcon from '@mui/icons-material/Receipt';

const DetalhesPedidoDialog = ({ open, onClose, pedido }) => {
  if (!pedido) return null;

  // Desestruturação segura com valores padrão
  const { usuario = {}, pagamento = {}, itens = [] } = pedido;

  // Calcula o total das taxas para exibição
  const totalTaxas = (pagamento.valorTaxaCartao || 0) + (pagamento.valorTaxaParcelamento || 0);

  // Calcula o valor líquido que você recebe
  const valorLiquido = (pagamento.valorTotal || 0) - totalTaxas;

  // Funções para formatação de data
  const formatarDataHora = (dataString) => {
    if (!dataString) return '-';
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Função para cores dos chips de status
  const getStatusColor = (status) => {
    switch (status) {
      case 'APROVADO': return 'success';
      case 'PENDENTE': return 'warning';
      case 'FALHOU': case 'CANCELADO': return 'error';
      case 'ESTORNADO': case 'REEMBOLSADO': return 'info';
      case 'AGUARDANDO_PAGAMENTO': return 'warning';
      case 'AGUARDANDO_DADOS': return 'info';
      case 'PROCESSANDO': return 'warning';
      case 'FALHA_NA_GERACAO': return 'error';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        <Typography variant="h5">Detalhes do Pedido #{pedido.id}</Typography>
        <Typography variant="body2" color="text.secondary">
          Status: <Chip 
            label={pedido.status === "EM_PREPARACAO" ? "PAGO" : pedido.status.replace('_', ' ')} 
            color={getStatusColor(pedido.status)} 
            size="small" 
            sx={{ ml: 1 }}
          />
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Coluna Esquerda: Cliente, Endereço e Cronologia */}
          <Grid size={{ xs: 12, lg: 4 }}>
            {/* Seção Cronologia */}
            <Box mb={2}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 1 }} /> Cronologia
              </Typography>
              <Typography variant="body2"><strong>Data da Compra:</strong> {formatarDataHora(pedido.dataFinalizado)}</Typography>
              <Typography variant="body2"><strong>Pagamento Criado:</strong> {formatarDataHora(pagamento.criadoEm)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            {/* Seção Cliente */}
            <Box mb={2}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} /> Cliente
              </Typography>
              <Typography variant="body2"><strong>Nome:</strong> {`${usuario.nome} ${usuario.sobrenome}`}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {usuario.email}</Typography>
              <Typography variant="body2"><strong>Telefone:</strong> {usuario.ddd ? `(${usuario.ddd}) ${usuario.telefone}` : usuario.telefone}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            {/* Seção Endereço */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <HomeIcon sx={{ mr: 1 }} /> Endereço de Entrega
              </Typography>
              <Typography variant="body2">{pedido.rua}, {pedido.numero}, {pedido.complemento}</Typography>
              <Typography variant="body2">{pedido.bairro}, {pedido.cidade} - {pedido.estado}</Typography>
              <Typography variant="body2"><strong>CEP:</strong> {pedido.cep}</Typography>
              {pedido.codigoRastreio && <Typography variant="body2" sx={{ mt: 1 }}><strong>Rastreio:</strong> {pedido.codigoRastreio}</Typography>}
            </Box>
          </Grid>

          {/* Coluna Central: Itens do Pedido */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ShoppingCartIcon sx={{ mr: 1 }} /> Itens Comprados ({itens.length})
            </Typography>
            <List sx={{ width: '100%', bgcolor: 'background.paper', maxHeight: 400, overflow: 'auto', border: '1px solid #eee', borderRadius: 1 }}>
              {itens.map((item) => (
                <ListItem key={item.id} divider>
                  <ListItemAvatar>
                    <Avatar variant="rounded" src={item.produto.imagens[0]?.urls.thumbnail} sx={{ width: 56, height: 56 }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${item.produto.nome} (x${item.quantidade})`}
                    secondary={`Preço Unitário: ${(item.precoUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Coluna Direita: Pagamento, Frete e Dados Fiscais */}
          <Grid size={{ xs: 12, lg: 4 }}>
            {/* Seção Pagamento */}
            <Box mb={2}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CreditCardIcon sx={{ mr: 1 }} /> Pagamento
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> 
                <Chip 
                  label={pagamento.status?.replace('_', ' ') || 'N/A'} 
                  color={getStatusColor(pagamento.status)} 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body2"><strong>Método:</strong> {pagamento.metodo}</Typography>
              <Typography variant="body2"><strong>Parcelas:</strong> {pagamento.parcelas}x</Typography>
              {pagamento.gatewayTransactionId && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>ID Transação:</strong> {pagamento.gatewayTransactionId}
                </Typography>
              )}
            </Box>
            <Divider sx={{ my: 2 }} />

            {/* Seção Frete */}
            <Box mb={2}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalShippingIcon sx={{ mr: 1 }} /> Logística
              </Typography>
              <Typography variant="body2"><strong>Empresa:</strong> {pedido.empresaFrete || '-'}</Typography>
              {pedido.empresaFreteId && (
                <Typography variant="body2"><strong>ID Empresa:</strong> {pedido.empresaFreteId}</Typography>
              )}
              {pedido.statusEtiqueta && (
                <Typography variant="body2">
                  <strong>Status Etiqueta:</strong>
                  <Chip 
                    label={pedido.statusEtiqueta.replace('_', ' ')} 
                    color={getStatusColor(pedido.statusEtiqueta)} 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Typography>
              )}
            </Box>
            <Divider sx={{ my: 2 }} />

            {/* Seção Dados Fiscais */}
            {pedido.chaveNotaFiscal && (
              <>
                <Box mb={2}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReceiptIcon sx={{ mr: 1 }} /> Dados Fiscais
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    <strong>Chave NF-e:</strong> {pedido.chaveNotaFiscal}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
              </>
            )}

            {/* SEÇÃO FINANCEIRA DETALHADA */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <MonetizationOnIcon sx={{ mr: 1 }} /> Resumo Financeiro
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Subtotal dos Produtos:</Typography>
                <Typography>{(pagamento.valorProdutos || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Frete:</Typography>
                <Typography>{(pagamento.valorFrete || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="error.main">Taxas do Cartão (loja):</Typography>
                <Typography color="error.main">- {(pagamento.valorTaxaCartao || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="error.main">Taxas do Parcelamento:</Typography>
                <Typography color="error.main">- {(pagamento.valorTaxaParcelamento || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography><strong>Total pago pelo Cliente:</strong></Typography>
                <Typography><strong>{(pagamento.valorTotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></Typography>
              </Box>

              <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="h6" color="success.main">Valor Líquido a Receber:</Typography>
                <Typography variant="h6" color="success.main">{(valorLiquido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} color='error' variant="contained">Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetalhesPedidoDialog;