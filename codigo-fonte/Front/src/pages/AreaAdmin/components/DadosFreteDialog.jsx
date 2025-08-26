import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';

const DadosFreteDialog = ({ open, onClose, pedido, onConfirm }) => {
  const [dadosFrete, setDadosFrete] = useState({
    pesoFrete: '',
    alturaFrete: '',
    larguraFrete: '',
    comprimentoFrete: '',
    chaveNotaFiscal: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form quando abre o dialog
  useEffect(() => {
    if (open && pedido) {
      setDadosFrete({
        pesoFrete: pedido.pesoFrete?.toString() || '',
        alturaFrete: pedido.alturaFrete?.toString() || '',
        larguraFrete: pedido.larguraFrete?.toString() || '',
        comprimentoFrete: pedido.comprimentoFrete?.toString() || '',
        chaveNotaFiscal: pedido.chaveNotaFiscal || ''
      });
      setError('');
    }
  }, [open, pedido]);

  const handleChange = (field) => (event) => {
    setDadosFrete(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    // Validações
    if (!dadosFrete.pesoFrete || !dadosFrete.alturaFrete || !dadosFrete.larguraFrete || 
        !dadosFrete.comprimentoFrete) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    if (parseFloat(dadosFrete.pesoFrete) <= 0 || parseFloat(dadosFrete.alturaFrete) <= 0 ||
        parseFloat(dadosFrete.larguraFrete) <= 0 || parseFloat(dadosFrete.comprimentoFrete) <= 0) {
      setError('Todos os valores numéricos devem ser maiores que zero.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onConfirm(dadosFrete);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao salvar dados do frete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Dados do Frete - Pedido #{pedido?.id}
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Preencha os dados do pacote para gerar a etiqueta no Melhor Envio.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Peso do Pacote"
            value={dadosFrete.pesoFrete}
            onChange={handleChange('pesoFrete')}
            type="number"
            inputProps={{ step: 0.1, min: 0.1 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>,
            }}
            fullWidth
            required
            color="warning"
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Altura"
              value={dadosFrete.alturaFrete}
              onChange={handleChange('alturaFrete')}
              type="number"
              inputProps={{ step: 0.1, min: 0.1 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">cm</InputAdornment>,
              }}
              fullWidth
              required
              color="warning"
            />
            
            <TextField
              label="Largura"
              value={dadosFrete.larguraFrete}
              onChange={handleChange('larguraFrete')}
              type="number"
              inputProps={{ step: 0.1, min: 0.1 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">cm</InputAdornment>,
              }}
              fullWidth
              required
              color="warning"
            />
            
            <TextField
              label="Comprimento"
              value={dadosFrete.comprimentoFrete}
              onChange={handleChange('comprimentoFrete')}
              type="number"
              inputProps={{ step: 0.1, min: 0.1 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">cm</InputAdornment>,
              }}
              fullWidth
              required
              color="warning"
            />
          </Box>

          <TextField
            label="Chave da Nota Fiscal"
            value={dadosFrete.chaveNotaFiscal}
            onChange={handleChange('chaveNotaFiscal')}
            placeholder="Ex: 35200314200166000187550010000000671123456789"
            fullWidth
            color="warning"
            helperText="Digite a chave completa da nota fiscal (44 dígitos)"
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading} color="warning">
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="warning"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Processando...' : 'Salvar e Gerar Etiqueta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DadosFreteDialog;
