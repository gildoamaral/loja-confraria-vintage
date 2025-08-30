import React, { useState } from 'react';
import { Container, Paper, Box, Typography, TextField, Button, Grid, Alert, FormHelperText } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import TextMaskAdapter from '../../components/TextMaskAdapter';
import CpfMaskAdapter from '../../components/CpfMaskAdapter';
import DddMaskAdapter from '../../components/DddMaskAdapter';
import TelefoneMaskAdapter from '../../components/TelefoneMaskAdapter';
import api from '../../services/api';
import inputStyles from '../../styles/inputStyles';

const Cadastro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    dataNascimento: null,
    cpf: '',
    email: '',
    ddd: '',
    telefone: '',
    senha: '',
    repetirSenha: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (newDate) => {
    setFormData({ ...formData, dataNascimento: newDate });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.nome) tempErrors.nome = "Nome é obrigatório.";
    if (!formData.sobrenome) tempErrors.sobrenome = "Sobrenome é obrigatório.";
    if (!formData.email) tempErrors.email = "Email é obrigatório.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Email inválido.";
    
    // Validação do CPF
    if (formData.cpf && !isValidCPF(formData.cpf)) {
      tempErrors.cpf = "CPF inválido.";
    }

    // Validação do DDD
    if (formData.ddd && formData.ddd.length !== 2) {
      tempErrors.ddd = "DDD deve ter 2 dígitos.";
    }

    // Se preencheu DDD, telefone é obrigatório e vice-versa
    if (!formData.ddd || !formData.telefone) {
      tempErrors.telefone = "DDD e telefone devem ser preenchidos";
    }
    
    if (formData.senha.length < 8) tempErrors.senha = "A senha deve ter no mínimo 8 caracteres.";
    if (formData.senha !== formData.repetirSenha) tempErrors.repetirSenha = "As senhas não coincidem.";
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Função para validar CPF
  const isValidCPF = (cpf) => {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;
    
    if (parseInt(cleanCPF.charAt(9)) !== digit1) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;
    
    return parseInt(cleanCPF.charAt(10)) === digit2;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');
    if (validate()) {
      setLoading(true);
      try {
        const dataParaEnviar = {
          ...formData,
          dataNascimento: formData.dataNascimento ? formData.dataNascimento.toISOString() : null
        };
        await api.post('/usuarios', dataParaEnviar);
        setSuccess('Cadastro realizado! Você será redirecionado para o login...');
        
        // Redireciona para o login após 5 segundos
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } catch (err) {
        setApiError(err.response?.data?.message || 'Erro ao realizar o cadastro.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container component="main" maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
        <Paper elevation={6} sx={{ padding: 4 }}>
          <Typography component="h1" variant="h5" align="center" sx={{ fontFamily: 'Special Elite, Courier, monospace' }}>
            Crie sua Conta
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{xs:12, sm: 6}}>
                <TextField name="nome" required fullWidth label="Nome" value={formData.nome} onChange={handleChange} error={!!errors.nome} helperText={errors.nome}  sx={inputStyles}/>
              </Grid>
              <Grid size={{xs:12, sm: 6}}>
                <TextField name="sobrenome" required fullWidth label="Sobrenome" value={formData.sobrenome} onChange={handleChange} error={!!errors.sobrenome} helperText={errors.sobrenome} sx={inputStyles}/>
              </Grid>
              <Grid size={{xs: 12}}>
                <DatePicker
                  label="Data de Nascimento"
                  value={formData.dataNascimento}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              <Grid size={{xs: 12}}>
                <TextField
                  name="cpf"
                  fullWidth
                  label="CPF"
                  value={formData.cpf}
                  onChange={handleChange}
                  InputProps={{
                    inputComponent: CpfMaskAdapter,
                  }}
                  error={!!errors.cpf}
                  helperText={errors.cpf}
                  sx={inputStyles}
                  required
                />
              </Grid>
              <Grid size={{xs: 12}}>
                <TextField name="email" required fullWidth label="Endereço de E-mail" type="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} sx={inputStyles} />
              </Grid>
              <Grid size={{xs: 12}}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    name="ddd"
                    label="DDD"
                    value={formData.ddd}
                    onChange={handleChange}
                    InputProps={{
                      inputComponent: DddMaskAdapter,
                    }}
                    error={!!errors.ddd}
                    helperText={errors.ddd}
                    sx={{ ...inputStyles, width: '120px' }}
                    required
                  />
                  <TextField
                    name="telefone"
                    fullWidth
                    label="Telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    InputProps={{
                      inputComponent: TelefoneMaskAdapter,
                    }}
                    error={!!errors.telefone}
                    helperText={errors.telefone}
                    sx={inputStyles}
                    required
                  />
                </Box>
              </Grid>
              <Grid size={{xs: 12}}>
                <TextField name="senha" required fullWidth label="Senha" type="password" value={formData.senha} onChange={handleChange} error={!!errors.senha} sx={inputStyles} />
                <FormHelperText>A senha deve conter no mínimo 8 caracteres.</FormHelperText>
              </Grid>
              <Grid size={{xs: 12}}>
                <TextField name="repetirSenha" required fullWidth label="Repetir Senha" type="password" value={formData.repetirSenha} onChange={handleChange} error={!!errors.repetirSenha} helperText={errors.repetirSenha} sx={inputStyles} />
              </Grid>
            </Grid>
            {apiError && <Alert severity="error" sx={{ mt: 2 }}>{apiError}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            <Button type="submit" fullWidth variant="contained" color='warning' sx={{ mt: 3, mb: 2 }} disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default Cadastro;