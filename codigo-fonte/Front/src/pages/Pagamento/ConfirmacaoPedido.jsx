import React, { useState } from 'react';
import { useLocation, Link as RouterLink, Navigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Divider,
  Container
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const ConfirmacaoPedido = () => {
  const location = useLocation();
  const [copySuccess, setCopySuccess] = useState('');

  // Se o usuário chegar a esta página sem os dados do PIX (ex: atualizando a página),
  // redireciona para a home para evitar erros.
  if (!location.state?.pixData) {
    return <Navigate to="/" replace />;
  }

  const { pixData, pedidoId, subtotal } = location.state;

  const handleCopy = () => {
    navigator.clipboard.writeText(pixData.qr_code);
    setCopySuccess('Código PIX copiado!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 5 },
          textAlign: 'center',
          borderRadius: 4
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Obrigado pela sua compra!
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Seu pedido <strong>#{pedidoId}</strong> foi registrado e está aguardando o pagamento.
        </Typography>
        <Typography variant="h6" color="success.main" sx={{ mb: 3 }}>
          Valor total: {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" gutterBottom>
          Pague com PIX para finalizar
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Escaneie o QR Code abaixo com o app do seu banco. O código expira em 30 minutos.
        </Typography>
        <img
          src={`data:image/png;base64,${pixData.qr_code_base64}`}
          alt="QR Code PIX"
          style={{ maxWidth: '280px', width: '100%', border: '1px solid #ddd', borderRadius: '8px' }}
        />
        <Typography variant="caption" display="block" sx={{ mt: 2 }}>
          Ou use o PIX Copia e Cola:
        </Typography>
        <TextField
          fullWidth
          value={pixData.qr_code}
          sx={{ mt: 1 }}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <Tooltip title="Copiar código">
                <IconButton onClick={handleCopy}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            ),
          }}
        />
        {copySuccess && <Typography color="success.main" sx={{ mt: 1, height: '20px' }}>{copySuccess}</Typography>}
        
        <Box sx={{ mt: 4 }}>
            <Button
                component={RouterLink}
                to="/minha-conta/pedidos"
                variant="contained"
                size="large"
            >
                Acompanhar meu Pedido
            </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ConfirmacaoPedido;