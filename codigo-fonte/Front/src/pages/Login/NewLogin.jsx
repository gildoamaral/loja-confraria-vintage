import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Paper, Box, Typography, TextField, Button, Grid, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts'; // 1. Importa o hook do contexto
import inputStyles from '../../styles/inputStyles';

const Login = () => {
  const { login } = useAuth(); // 2. Pega a função de login do contexto
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  
  // Lista de páginas que não devem ser usadas como destino após login
  const paginasExcluidas = ['/cadastro-usuario', '/login', '/esqueci-senha', '/reset-senha'];
  const fromPath = location.state?.from?.pathname || "/";
  const from = paginasExcluidas.includes(fromPath) ? "/" : fromPath;
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // 3. Chama a função de login do contexto. Sem reload, sem navigate local.
      await login(formData.email, formData.senha);
      setSuccess('Login realizado com sucesso! Redirecionando...');

      // Redireciona após 2 segundos
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 2000);

    } catch (err) {
      setError(err.message || 'Erro ao tentar fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={6} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ fontFamily: 'Special Elite, Courier, monospace' }}>
          Entrar na sua conta
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="email" label="Endereço de E-mail" name="email" value={formData.email} onChange={handleChange} sx={inputStyles} />
          <TextField margin="normal" required fullWidth name="senha" label="Senha" type="password" id="senha" value={formData.senha} onChange={handleChange} sx={inputStyles} />
          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
          {success &&
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center', mt: 2, width: '100%' }}>
              <Alert severity="success" sx={{ flexGrow: 1, mb: 3 }}>{success} </Alert>
              <CircularProgress color="success" size={24} />

            </Box>
}
          <Button type="submit" fullWidth color="warning" variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          <Grid container justifyContent="space-between">
            <Grid>
              <Link to="/esqueci-senha" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="error">Esqueceu a senha?</Typography>
              </Link>
            </Grid>
            <Grid>
              <Link to="/cadastro-usuario" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="error">{"Não tem uma conta? Cadastre-se"}</Typography>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;