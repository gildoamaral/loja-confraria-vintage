import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Box, Grid, Divider, Avatar, List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; // Novo ícone para finanças
import CreditCardIcon from '@mui/icons-material/CreditCard';

const DetalhesPedidoDialog = ({ open, onClose, pedido }) => {
  if (!pedido) return null;

  // Desestruturação segura com valores padrão
  const { usuario = {}, pagamento = {}, itens = [] } = pedido;

  // Calcula o total das taxas para exibição
  const totalTaxas = (pagamento.valorTaxaCartao || 0) + (pagamento.valorTaxaParcelamento || 0);

  // Calcula o valor líquido que você recebe
  const valorLiquido = (pagamento.valorTotal || 0) - totalTaxas;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography variant="h5">Detalhes do Pedido #{pedido.id}</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Coluna Esquerda: Cliente e Endereço */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box mb={2}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><PersonIcon sx={{ mr: 1 }} /> Cliente</Typography>
              <Typography variant="body2"><strong>Nome:</strong> {`${usuario.nome} ${usuario.sobrenome}`}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {usuario.email}</Typography>
              <Typography variant="body2"><strong>Telefone:</strong> {usuario.telefone}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><HomeIcon sx={{ mr: 1 }} /> Endereço de Entrega</Typography>
              <Typography variant="body2">{pedido.rua}, {pedido.numero}, {pedido.complemento}</Typography>
              <Typography variant="body2">{pedido.bairro}, {pedido.cidade} - {pedido.estado}</Typography>
              <Typography variant="body2"><strong>CEP:</strong> {pedido.cep}</Typography>
              {pedido.codigoRastreio && <Typography variant="body2" sx={{ mt: 1 }}><strong>Rastreio:</strong> {pedido.codigoRastreio}</Typography>}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><CreditCardIcon sx={{ mr: 1 }} /> Pagamento</Typography>
              <Typography variant="body2"><strong>Total:</strong> {pagamento.valorTotal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
              <Typography variant="body2"><strong>Método:</strong> {pagamento.metodo}</Typography>
              <Typography variant="body2"><strong>Parcelas:</strong> {pagamento.parcelas}x</Typography>
            </Box>
          </Grid>

          {/* Coluna Direita: Itens do Pedido */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><ShoppingCartIcon sx={{ mr: 1 }} /> Itens Comprados ({itens.length})</Typography>
            <List sx={{ width: '100%', bgcolor: 'background.paper', maxHeight: 250, overflow: 'auto', border: '1px solid #eee', borderRadius: 1 }}>
              {itens.map((item) => (
                <ListItem key={item.id} divider>
                  <ListItemAvatar>
                    <Avatar variant="rounded" src={item.produto.imagens[0]?.urls.thumbnail} sx={{ width: 56, height: 56 }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${item.produto.nome} (x${item.quantidade})`}
                    // Utiliza o precoUnitario "congelado" no momento da compra
                    secondary={`Preço Unitário: ${(item.precoUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                  />
                </ListItem>
              ))}
            </List>

            {/* SEÇÃO FINANCEIRA DETALHADA */}
            <Box mt={2}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><MonetizationOnIcon sx={{ mr: 1 }} /> Resumo Financeiro</Typography>
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
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetalhesPedidoDialog;