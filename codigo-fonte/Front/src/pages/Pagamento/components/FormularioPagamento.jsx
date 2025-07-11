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
import PagamentoCartao from './PagamentoCartao';

const FormularioPagamento = ({ metodo, setMetodo, pedidoId, valorTotal, valorFrete }) => {
  return (
    <Box>
      {/* Método de Pagamento */}
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend">
          Método de Pagamento
        </FormLabel>
        <RadioGroup
          row
          value={metodo}
          onChange={(e) => setMetodo(e.target.value)}
        >
          <FormControlLabel
            value="cartao"
            control={<Radio color="primary" />}
            label="Cartão de Crédito"
          />
        </RadioGroup>
      </FormControl>
      <Divider sx={{ my: 3 }} />
      {metodo === 'cartao' ? (
        <PagamentoCartao
          pedidoId={pedidoId}
          valor={valorTotal}
          valorFrete={valorFrete}
        />
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 8 }}>
          Selecione um método de pagamento para continuar.
        </Typography>
      )}
    </Box>
  );
};

export default FormularioPagamento;
