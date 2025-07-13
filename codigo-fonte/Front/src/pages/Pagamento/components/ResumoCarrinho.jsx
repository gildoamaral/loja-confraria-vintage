import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box
} from '@mui/material';

const ResumoCarrinho = ({ quantidadeTotal, valorTotal, valorFrete, subtotal, usuario, enderecoLinha }) => {
  return (
    <Card sx={{ mb: 3, background: '#FFF7F2', borderRadius: 2, width: '100%' }}>
      <CardContent>
        {/* Seção: Dados do Usuário */}
        {usuario && (
          <>
            <Typography variant="subtitle1" gutterBottom fontWeight={700}>
              Dados do Usuário
            </Typography>
            <Typography variant="body2">
              <strong>Nome:</strong> {usuario.nome} {usuario.sobrenome}
            </Typography>
            <Typography variant="body2">
              <strong>E-mail:</strong> {usuario.email}
            </Typography>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Seção: Endereço de Entrega */}
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Endereço de Entrega
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {enderecoLinha || 'Endereço não definido'}
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* Seção: Resumo do Pedido */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Resumo do Pedido
        </Typography>
        <Typography variant="body1">
          Quantidade de produtos: {quantidadeTotal}
        </Typography>
        <Typography variant="body1">
          Frete: R$ {valorFrete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Typography>
        <Typography variant="body1">
          Produto(s):  R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* Seção: Total Final */}
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
