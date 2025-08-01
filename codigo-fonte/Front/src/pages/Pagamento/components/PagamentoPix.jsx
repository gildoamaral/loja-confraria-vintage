import React from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';

// O componente agora recebe a função para finalizar e o estado de loading do componente pai
const PagamentoPix = ({ onFinalizar, loading }) => {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h6" gutterBottom>
        Pagamento com PIX
      </Typography>
      <Typography sx={{ mb: 3 }} color="text.secondary">
        Ao clicar em "Finalizar Compra", você será redirecionado para uma página com o QR Code e as instruções para pagamento.
      </Typography>
      <Button
        variant="contained"
        onClick={onFinalizar}
        disabled={loading}
        size="large"
        sx={{
            py: 1.5,
            px: 5,
            fontWeight: 'bold',
            bgcolor: 'var(--cor-marca)',
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Finalizar Compra com PIX'}
      </Button>
    </Box>
  );
};

export default PagamentoPix;