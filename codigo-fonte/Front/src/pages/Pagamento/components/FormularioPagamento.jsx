import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Typography
} from '@mui/material';
import NewPagamentoCartao from './NewPagamentoCartao';
import PagamentoPix from './PagamentoPix';

const FormularioPagamento = ({ metodo, setMetodo, pedidoId, valorTotal, valorFrete, nomeFrete, onFinalizarPix, loadingPix }) => {
  return (
    <Box>
      {/* Método de Pagamento */}
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend" color='error'>
          Método de Pagamento
        </FormLabel>
        <RadioGroup
          row
          value={metodo}
          onChange={(e) => setMetodo(e.target.value)}
        >
          <FormControlLabel
            value="cartao"
            control={<Radio color="error" />}
            label="Cartão de Crédito"
          />
          <FormControlLabel
            value="pix"
            control={<Radio color="error" />}
            label="PIX"
          />
        </RadioGroup>
      </FormControl>
      <Divider sx={{ my: 3 }} />
      {metodo === 'cartao' && (
        <NewPagamentoCartao
          pedidoId={pedidoId}
          valor={valorTotal}
          valorFrete={valorFrete}
          nomeFrete={nomeFrete}
        />
      )}
      {metodo === 'pix' && (
        <PagamentoPix onFinalizar={onFinalizarPix} loading={loadingPix} />
      )}
      {metodo === '' && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 8 }}>
          Selecione um método de pagamento para continuar.
        </Typography>
      )}
    </Box>
  );
};

export default FormularioPagamento;
