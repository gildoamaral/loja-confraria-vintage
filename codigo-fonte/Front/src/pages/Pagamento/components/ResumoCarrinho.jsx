import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box
} from '@mui/material';

const ResumoCarrinho = ({ quantidadeTotal, valorTotal, valorFrete, subtotal }) => {
  return (
    <Card sx={{ mb: 3, background: '#FFF7F2', borderRadius: 2, width: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Resumo do Pedido
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1">
          Quantidade de produtos: <strong>{quantidadeTotal}</strong>
        </Typography>
        <Typography variant="body1">
          Frete: <strong>R$ {valorFrete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
        </Typography>
        <Typography variant="body1">
          Produto(s): <strong> R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </strong>
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1">Subtotal:</Typography>
          <Typography variant="h5" fontWeight={700} color="primary">
            R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
        <Divider sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  );
};

export default ResumoCarrinho;
