import React, { useState } from 'react';
import api from '../../services/api';
import { Box, Button, Typography, CircularProgress, TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReceiptIcon from '@mui/icons-material/Receipt'; // Import do ícone de recibo

function PagamentoPix() {
  const [qrCode, setQrCode] = useState(null);
  const [pixCode, setPixCode] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [transactionData, setTransactionData] = useState({
    description: '',
    amount: 0,
  });

  const handlePagamento = async (e) => {
    e.preventDefault();
    setStatus('Enviando...');
    setLoading(true);

    const data = {
      transaction_amount: 1.5,
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
        setLoading(false);
        return;
      }

      const qrBase64 = interaction.transaction_data.qr_code_base64;
      const pixCode = interaction.transaction_data.qr_code;
      const description = res.data.description || data.description; // Descrição da API ou fallback
      const amount = res.data.transaction_amount || data.transaction_amount; // Valor da API ou fallback

      setQrCode(qrBase64);
      setPixCode(pixCode);
      setTransactionData({
        description,
        amount,
      });
      setStatus('Pagamento gerado com sucesso!');
    } catch (err) {
      setStatus('Erro ao gerar pagamento.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopyMessage('Código PIX copiado para a área de transferência!');
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
        maxWidth: 500,
        margin: '0 auto',
        border: '1px solid #ccc',
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: '#ffffff',
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
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Gerar QR Code PIX'}
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
            gap: 2,
          }}
        >
          <img
            src={`data:image/png;base64,${qrCode}`}
            alt="QR Code PIX"
            style={{ maxWidth: '100%', borderRadius: 8 }}
          />
          <TextField
            value={pixCode}
            fullWidth
            variant="outlined"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Copiar código PIX">
                    <IconButton
                      color="primary"
                      onClick={handleCopyPixCode}
                      // disableRipple
                      disableFocusRipple
                      sx={{
                        '&:focus': {
                          outline: 'none', // Remove a borda de foco
                        },
                      }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
          {copyMessage && (
            <Typography
              variant="body2"
              color="success.main"
              sx={{ marginTop: 2, textAlign: 'center' }}
            >
              {copyMessage}
            </Typography>
          )}
        </Box>
      )}
      {qrCode && (
        <Box
          sx={{
            marginTop: 4,
            width: '100%',
            textAlign: 'left', // Alinhamento à esquerda
            padding: 2,
            borderTop: '2px dotted #ccc', // Divisória superior
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 2,
            }}
          >
            <ReceiptIcon sx={{ marginRight: 1, color: '#333' }} /> {/* Ícone de recibo */}
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              Resumo da Compra
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              marginBottom: 1,
              color: '#555',
            }}
          >
            <strong>Descrição:</strong> {transactionData.description}
          </Typography>
          <Box
            sx={{
              borderBottom: '1px solid #ddd', // Divisória menor
              margin: '8px 0px',
            }}
          />
          <Typography
            variant="body1"
            sx={{
              color: '#555',
            }}
          >
            <strong>Valor:</strong> R$ {transactionData.amount.toFixed(2)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default PagamentoPix;
