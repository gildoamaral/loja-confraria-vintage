import React from 'react';
import {
  Grid,
  TextField,
  Button
} from '@mui/material';

const FormularioEndereco = ({ endereco, handleEnderecoChange, usarEnderecoCadastrado, handleContinuarParaFrete }) => {
  function formatarCep(valor) {
    // Remove tudo que não for número
    valor = valor.replace(/\D/g, '');
    // Aplica a máscara
    if (valor.length > 5) {
      valor = valor.replace(/^(\d{2})(\d{3})(\d{3})/, '$1.$2-$3');
    } else if (valor.length > 2) {
      valor = valor.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
    }
    return valor.slice(0, 10); // Limita ao tamanho máximo
  }

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cep') {
      value = formatarCep(value);
    }
    handleEnderecoChange({ target: { name, value } });
  };

  return (
    <>
      <Grid sx={{ display: 'grid', gap: 2, mt: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Rua"
            name="rua"
            value={endereco.rua}
            onChange={handleInputChange}
            fullWidth
            required
            disabled={usarEnderecoCadastrado}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Número"
            name="numero"
            value={endereco.numero}
            onChange={handleInputChange}
            fullWidth
            required
            disabled={usarEnderecoCadastrado}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Complemento"
            name="complemento"
            value={endereco.complemento}
            onChange={handleInputChange}
            fullWidth
            disabled={usarEnderecoCadastrado}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Bairro"
            name="bairro"
            value={endereco.bairro}
            onChange={handleInputChange}
            fullWidth
            required
            disabled={usarEnderecoCadastrado}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Cidade"
            name="cidade"
            value={endereco.cidade}
            onChange={handleInputChange}
            fullWidth
            required
            disabled={usarEnderecoCadastrado}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            label="UF"
            name="estado"
            value={endereco.estado}
            onChange={handleInputChange}
            fullWidth
            required
            inputProps={{ maxLength: 2 }}
            disabled={usarEnderecoCadastrado}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            label="CEP"
            name="cep"
            value={endereco.cep}
            onChange={handleInputChange}
            fullWidth
            required
            disabled={usarEnderecoCadastrado}
            slotProps={{ htmlInput: { maxLength: 10 } }}
          />
        </Grid>
      </Grid>

      <Grid size={12} sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2, fontWeight: 700 }}
          onClick={handleContinuarParaFrete}
        >
          Continuar para Pagamento
        </Button>
      </Grid>
    </>
  );
};

export default FormularioEndereco;
