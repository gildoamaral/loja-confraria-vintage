import React, { useState } from 'react';
import api from '../../services/api';
import { Box, Button, Typography, CircularProgress, TextField } from '@mui/material';

function PagamentoPix() {
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState('');

  const handlePagamento = async (e) => {
    e.preventDefault();
    setStatus('Enviando...');

    const data = {
      transaction_amount: 1,
      description: "Pagamento de Teste",
      paymentMethodId: "pix",
      email: "cliente@email.com",
      identificationType: "CPF",
      number: "68689990704"
    };

    try {
      const res = await api.post("/pagamentos/criar-pix", data);
      const interaction = res.data.point_of_interaction;

      if (!interaction || !interaction.transaction_data) {
        setStatus('Erro: Dados do QR Code não vieram');
        return;
      }

      const qrBase64 = interaction.transaction_data.qr_code_base64;
      setQrCode(qrBase64);
      setStatus('Pagamento gerado com sucesso!');
    } catch (err) {
      setStatus('Erro ao gerar pagamento.');
      console.error(err);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        gap: 2,
        maxWidth: 400,
        margin: '0 auto',
        border: '1px solid #ccc',
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: '#f9f9f9',
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Pagamento via PIX
      </Typography>
      <form onSubmit={handlePagamento} style={{ width: '100%' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginBottom: 2 }}
        >
          Gerar QR Code PIX
        </Button>
      </form>
      {status && (
        <Typography
          variant="body1"
          color={status.includes('Erro') ? 'error' : 'textPrimary'}
          sx={{ textAlign: 'center' }}
        >
          {status}
        </Typography>
      )}
      {qrCode && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 2,
          }}
        >
          <img
            src={`data:image/png;base64,${qrCode}`}
            alt="QR Code PIX"
            style={{ maxWidth: '100%', borderRadius: 8 }}
          />
        </Box>
      )}
    </Box>
  );
}

export default PagamentoPix;
