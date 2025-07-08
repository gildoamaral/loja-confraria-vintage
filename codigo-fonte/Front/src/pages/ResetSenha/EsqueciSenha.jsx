import { useState } from 'react';
import { Container, Button, Typography, Alert, Box, TextField } from '@mui/material';
import api from '../../services/api';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    ochre: {
      main: '#000',

    },
  },
});

const EsqueciSenha = () => {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Enviando e-mail de recuperação para:', email);

      await api.post('/usuarios/esqueci-senha', { email });
      setMensagem('E-mail de recuperação enviado com sucesso.');
      setErro(false);
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      setMensagem('Erro ao enviar e-mail. Verifique o endereço.');
      setErro(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>

      <Container maxWidth="sm" sx={{ my: 16 }}>
        <Typography variant="h4" gutterBottom textAlign={'center'}>
          Esqueci minha senha
        </Typography>
        <Box mt={5}>
          <Typography
            variant="body1"
            gutterBottom
            textAlign={'center'}
          >
            Digite seu email abaixo e enviaremos um link para redefini-la.
          </Typography>
          <form onSubmit={handleSubmit}>

            <TextField
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              fullWidth
              variant='filled'
              label="Digite seu e-mail"
              color='ochre'
              margin="normal"
              required
            />

            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                sx={{ backgroundColor: "#f38b66", width: "98%", mt: 1 }}
                type="submit"
              >
                Enviar
              </Button>
            </Box>
          </form>
          {mensagem && (
            <Alert severity={erro ? 'error' : 'success'} variant='standard' sx={{ mt: 2 }}>
              {mensagem}
            </Alert>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default EsqueciSenha;
