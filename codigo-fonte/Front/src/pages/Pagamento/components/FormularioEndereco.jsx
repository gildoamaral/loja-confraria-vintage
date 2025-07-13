import React from 'react';
import {
  Grid,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  Box,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const FormularioEndereco = ({ 
  endereco, 
  handleEnderecoChange, 
  usarEnderecoCadastrado, 
  handleContinuarParaFrete,
  mostrarCamposEndereco,
  cepLoading,
  cepError,
  handleBuscarCep,
  validarCepCompleto
}) => {



  return (
    <>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="CEP"
            name="cep"
            value={endereco.cep}
            onChange={handleEnderecoChange}
            fullWidth
            required
            disabled={usarEnderecoCadastrado}
            error={!!cepError}
            helperText={cepError}
            placeholder="00.000-000"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {cepLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <IconButton
                        onClick={handleBuscarCep}
                        disabled={!validarCepCompleto() || usarEnderecoCadastrado}
                        size="small"
                        aria-label="Buscar CEP"
                        color={validarCepCompleto() ? "primary" : "default"}
                        sx={{ 
                          transition: 'color 0.2s ease',
                          '&:hover': {
                            backgroundColor: validarCepCompleto() ? 'primary.light' : 'action.hover'
                          }
                        }}
                      >
                        <SearchIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }
            }}
          />
        </Grid>

        {/* Campos do endereço só aparecem após buscar o CEP */}
        {mostrarCamposEndereco && (
          <>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                label="Rua / Logradouro"
                name="rua"
                value={endereco.rua}
                onChange={handleEnderecoChange}
                fullWidth
                required
                // Desabilita enquanto o CEP é buscado
                disabled={usarEnderecoCadastrado || cepLoading}
                slotProps={{
                  inputLabel: { shrink: !!endereco.rua } // Garante que o label não sobreponha o texto
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Número"
                name="numero"
                value={endereco.numero}
                onChange={handleEnderecoChange}
                fullWidth
                required
                disabled={usarEnderecoCadastrado}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 12 }}>
              <TextField
                label="Complemento"
                name="complemento"
                value={endereco.complemento}
                onChange={handleEnderecoChange}
                fullWidth
                disabled={usarEnderecoCadastrado}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                label="Bairro"
                name="bairro"
                value={endereco.bairro}
                onChange={handleEnderecoChange}
                fullWidth
                required
                disabled={usarEnderecoCadastrado || cepLoading}
                slotProps={{
                  inputLabel: { shrink: !!endereco.bairro }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                label="Cidade"
                name="cidade"
                value={endereco.cidade}
                onChange={handleEnderecoChange}
                fullWidth
                required
                disabled={usarEnderecoCadastrado || cepLoading}
                slotProps={{
                  inputLabel: { shrink: !!endereco.cidade }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="UF"
                name="estado"
                value={endereco.estado}
                onChange={handleEnderecoChange}
                fullWidth
                required
                disabled={usarEnderecoCadastrado || cepLoading}
                slotProps={{
                  inputLabel: { shrink: !!endereco.estado },
                  htmlInput: { maxLength: 2 }
                }}
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Botão de continuar só aparece após mostrar os campos */}
      {mostrarCamposEndereco && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ fontWeight: 700, px: 5 }}
            onClick={handleContinuarParaFrete}
            disabled={usarEnderecoCadastrado}
          >
            Continuar
          </Button>
        </Box>
      )}
    </>
  );
};

export default FormularioEndereco;