import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button
} from '@mui/material';
import Loading from '../../../components/Loading';

const SeletorFrete = ({ 
  carregandoFrete, 
  opcoesFrete, 
  freteSelecionado, 
  setFreteSelecionado, 
  handleContinuarParaPagamento 
}) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Selecione o frete
      </Typography>
      {carregandoFrete ? (
        <Loading />
      ) : (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">
            Opções de Entrega:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Array.isArray(opcoesFrete) && opcoesFrete.length > 0 ? (
              opcoesFrete.map((opcao, idx) => (
                <Paper
                  key={idx}
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    border: freteSelecionado === opcao ? '2px solid' : '1px solid',
                    borderColor: freteSelecionado === opcao ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.light' }
                  }}
                  onClick={() => {
                    setFreteSelecionado(opcao);
                    console.log('Frete selecionado:', opcao);
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {opcao.company?.picture && (
                        <img
                          src={opcao.company.picture}
                          alt={opcao.company.name}
                          style={{ width: 30, height: 30, objectFit: 'contain' }}
                        />
                      )}
                      <Typography variant="body2" fontWeight="medium">
                        {opcao.name || opcao.codigo}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        R$ {parseFloat(opcao.price || opcao.valor).toFixed(2).replace('.', ',')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {opcao.delivery_time || opcao.prazoEntrega} dias úteis
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" color="error">
                Nenhuma opção de frete disponível.
              </Typography>
            )}
          </Box>
        </Box>
      )}
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2, fontWeight: 700 }}
        onClick={handleContinuarParaPagamento}
        disabled={carregandoFrete}
      >
        Continuar para Pagamento
      </Button>
    </Box>
  );
};

export default SeletorFrete;
