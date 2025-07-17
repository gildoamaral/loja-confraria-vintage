import React from 'react';
import {
  Box,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';

const SeletorEndereco = ({ 
  usarEnderecoCadastrado, 
  setUsarEnderecoCadastrado, 
  handleNovoEndereco, 
  usuario, 
  enderecoLinha, 
  enderecoSelecionado, 
  setEnderecoSelecionado,
  endereco,
  enderecoUsuario
}) => {
  
  const handleAlignment = (event, newAlignment) => {
    if (newAlignment !== null) {
      if (newAlignment === 'cadastrado') {
        setUsarEnderecoCadastrado(true);
      } else {
        handleNovoEndereco();
      }
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <ToggleButtonGroup
        value={usarEnderecoCadastrado ? 'cadastrado' : 'novo'}
        exclusive
        onChange={handleAlignment}
        aria-label="Opção de endereço"
        fullWidth
      >
        <ToggleButton value="cadastrado" disabled={!enderecoUsuario.linha && !enderecoLinha}>
          Usar endereço cadastrado
        </ToggleButton>
        <ToggleButton value="novo">
          Preencher novo endereço
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Opções de endereço só aparecem se usarEnderecoCadastrado for true */}
      {usarEnderecoCadastrado && (enderecoUsuario.linha || enderecoLinha) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 2, flexWrap: 'wrap' }}>
          {/* Endereço do Usuário */}
          {enderecoUsuario.linha && (
            <Paper
              elevation={enderecoSelecionado?.linha === enderecoUsuario.linha ? 6 : 1}
              sx={{
                p: 2,
                cursor: 'pointer',
                border: enderecoSelecionado?.linha === enderecoUsuario.linha ? '2px solid #1976d2' : '1px solid #ccc',
                background: enderecoSelecionado?.linha === enderecoUsuario.linha ? '#e3f2fd' : '#fff',
                '&:hover': {
                  background: '#e3f2fd',
                },
              }}
              onClick={() => {
                setEnderecoSelecionado({
                  linha: enderecoUsuario.linha,
                  dados: {
                    rua: usuario.rua || '',
                    numero: usuario.numero || '',
                    complemento: usuario.complemento || '',
                    bairro: usuario.bairro || '',
                    cidade: usuario.cidade || '',
                    estado: usuario.estado || '',
                    cep: usuario.cep || '',
                  }
                });
              }}
            >
              <Typography variant="body2" fontWeight={700}>Endereço do Cadastro</Typography>
              <Typography variant="body2">{enderecoUsuario.linha}</Typography>
            </Paper>
          )}

          {/* Endereço do Pedido */}
          {enderecoLinha && (!enderecoUsuario.linha || enderecoLinha !== enderecoUsuario.linha) && (
            <Paper
              elevation={enderecoSelecionado?.linha !== enderecoUsuario.linha ? 6 : 1}
              sx={{
                p: 2,
                cursor: 'pointer',
                border: enderecoSelecionado?.linha === enderecoLinha ? '2px solid #1976d2' : '1px solid #ccc',
                background: enderecoSelecionado?.linha === enderecoLinha ? '#e3f2fd' : '#fff',
                '&:hover': {
                  background: '#e3f2fd',
                },
              }}
              onClick={() => {
                setEnderecoSelecionado({
                  linha: enderecoLinha,
                  dados: { ...endereco }
                });
              }}
            >
              <Typography variant="body2" fontWeight={700}>Endereço do Pedido</Typography>
              <Typography variant="body2">{enderecoLinha}</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Mensagem se nenhum endereço */}
      {usarEnderecoCadastrado && !enderecoUsuario.linha && !enderecoLinha && (
        <Typography variant="caption" color="error">
          Nenhum endereço cadastrado.
        </Typography>
      )}
    </Box>
  );
};

export default SeletorEndereco;
