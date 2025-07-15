import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';

const AtualizarStatusDialog = ({ open, onClose, pedido, onConfirm }) => {
  const [codigoRastreio, setCodigoRastreio] = useState('');
  const [loading, setLoading] = useState(false);

  // Limpa o campo de rastreio quando o diálogo é fechado ou o pedido muda
  React.useEffect(() => {
    if (!open) {
      setCodigoRastreio('');
    }
  }, [open]);

  const handleConfirm = async () => {
    setLoading(true);
    // Chama a função passada pelo componente pai com os dados
    await onConfirm({
      status: 'ENVIADO',
      codigoRastreio: codigoRastreio || null, // Envia null se o campo estiver vazio
    });
    setLoading(false);
  };

  if (!pedido) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Atualizar Pedido #{pedido.id}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography>
            Você está marcando este pedido como <strong>ENVIADO</strong>.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="codigoRastreio"
            label="Código de Rastreamento (Opcional)"
            type="text"
            fullWidth
            variant="outlined"
            value={codigoRastreio}
            onChange={(e) => setCodigoRastreio(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Confirmar Envio'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AtualizarStatusDialog;