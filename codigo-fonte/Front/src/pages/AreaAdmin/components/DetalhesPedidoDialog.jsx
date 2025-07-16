import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Box, Grid, Divider, Avatar, List, ListItem, ListItemAvatar, ListItemText, Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const DetalhesPedidoDialog = ({ open, onClose, pedido }) => {
  if (!pedido) return null;

  const { usuario = {}, pagamento = {}, itens = [] } = pedido;

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
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><PersonIcon sx={{ mr: 1 }}/> Cliente</Typography>
              <Typography variant="body2"><strong>Nome:</strong> {`${usuario.nome} ${usuario.sobrenome}`}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {usuario.email}</Typography>
              <Typography variant="body2"><strong>Telefone:</strong> {usuario.telefone}</Typography>
            </Box>
            <Divider sx={{ my: 2 }}/>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><HomeIcon sx={{ mr: 1 }}/> Endereço de Entrega</Typography>
              <Typography variant="body2">{pedido.rua}, {pedido.numero}, {pedido.complemento}</Typography>
              <Typography variant="body2">{pedido.bairro}, {pedido.cidade} - {pedido.estado}</Typography>
              <Typography variant="body2"><strong>CEP:</strong> {pedido.cep}</Typography>
              {pedido.codigoRastreio && <Typography variant="body2" sx={{ mt: 1 }}><strong>Rastreio:</strong> {pedido.codigoRastreio}</Typography>}
            </Box>
             <Divider sx={{ my: 2 }}/>
            <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><CreditCardIcon sx={{ mr: 1 }}/> Pagamento</Typography>
                <Typography variant="body2"><strong>Total:</strong> {pagamento.valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                <Typography variant="body2"><strong>Método:</strong> {pagamento.metodo}</Typography>
                <Typography variant="body2"><strong>Parcelas:</strong> {pagamento.parcelas}x</Typography>
            </Box>
          </Grid>

          {/* Coluna Direita: Itens do Pedido */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><ShoppingCartIcon sx={{ mr: 1 }}/> Itens Comprados ({itens.length})</Typography>
            <List sx={{ width: '100%', bgcolor: 'background.paper', maxHeight: 400, overflow: 'auto' }}>
              {itens.map((item) => (
                <ListItem key={item.id} alignItems="flex-start" divider>
                  <ListItemAvatar>
                    <Avatar variant="rounded" src={item.produto.imagens[0]?.urls.thumbnail} sx={{ width: 56, height: 56 }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${item.produto.nome} (x${item.quantidade})`}
                    secondary={`ID: ${item.produto.id} | Preço: ${(item.produto.precoPromocional ?? item.produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                  />
                </ListItem>
              ))}
            </List>
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