import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Alert, Box, InputAdornment, IconButton } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '../../services/api';
import Footer from '../../components/Footer';
import Header from '../../components/Header1';

const theme = createTheme({
  palette: {
    ochre: {
      main: '#000',

    },
  },
});

const ResetarSenha = () => {
  const [novaSenha, setNovaSenha] = useState('');
  const [repetirSenha, setRepetirSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showRepetirSenha, setShowRepetirSenha] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (novaSenha !== repetirSenha) {
      setMensagem('As senhas não coincidem.');
      setErro(true);
      return;
    }
    try {
      await api.post('usuarios/resetar-senha', { token, novaSenha });
      setMensagem('Senha redefinida com sucesso. Redirecionando...');
      setErro(false);
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      setMensagem('Erro ao redefinir senha. Token inválido ou expirado.');
      setErro(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Header />
      <Container maxWidth="sm">
        <Box my={8}>
          <Typography variant="h4" gutterBottom align="center">
            Redefinir Senha
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type={showNovaSenha ? 'text' : 'password'}
              label="Nova senha"
              variant='filled'
              color='ochre' // agora você pode usar sua cor customizada
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              margin="normal"
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Mostrar/ocultar senha"
                        onClick={() => setShowNovaSenha((show) => !show)}
                        edge="end"
                      >
                        {showNovaSenha ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }
              }
            />
            <TextField
              fullWidth
              type={showRepetirSenha ? 'text' : 'password'}
              variant='filled'
              label="Repetir nova senha"
              color='ochre'
              value={repetirSenha}
              onChange={(e) => setRepetirSenha(e.target.value)}
              margin="normal"
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Mostrar/ocultar senha"
                        onClick={() => setShowRepetirSenha((show) => !show)}
                        edge="end"
                      >
                        {showRepetirSenha ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }
              }
            />
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="contained"
                type="submit"
                sx={{ backgroundColor: "#f38b66", width: "50%" }}
              >
                Redefinir
              </Button>
            </Box>
          </form>
          {mensagem && (
            <Alert severity={erro ? 'error' : 'success'} sx={{ mt: 2 }}>
              {mensagem}
            </Alert>
          )}
        </Box>
      </Container>
      <Footer />
    </ThemeProvider>
  );
};

export default ResetarSenha;
