import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Alert, Snackbar, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { alterarSenha } from '../../services/usuarioService';

const Seguranca = () => {
  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      senhaAtual: '',
      novaSenha: '',
      confirmarNovaSenha: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const novaSenhaValue = watch('novaSenha');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const response = await alterarSenha({
        senhaAtual: data.senhaAtual,
        novaSenha: data.novaSenha,
      });

      console.log('Senha alterada com sucesso:', response);
      setSuccess(true);
      reset(); // Limpa o formulário após o sucesso
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit(onSubmit)} 
      sx={{ 
        maxWidth: '600px',
        p: { xs: 1, sm: 2, md: 0 }
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.8rem', sm: '2.1rem', md: '2.5rem' } }}>
        Segurança
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
        Para sua segurança, recomendamos que você escolha uma senha forte e não a compartilhe com ninguém.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="senhaAtual"
            control={control}
            rules={{ required: 'Senha atual é obrigatória' }}
            render={({ field }) => (
              <TextField 
                {...field} 
                label="Senha Atual" 
                type="password" 
                fullWidth 
                required 
                error={!!errors.senhaAtual}
                helperText={errors.senhaAtual?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="novaSenha"
            control={control}
            rules={{ 
              required: 'Nova senha é obrigatória',
              minLength: { value: 8, message: 'A senha deve ter no mínimo 8 caracteres' }
            }}
            render={({ field }) => (
              <TextField 
                {...field} 
                label="Nova Senha" 
                type="password" 
                fullWidth 
                required 
                error={!!errors.novaSenha}
                helperText={errors.novaSenha?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="confirmarNovaSenha"
            control={control}
            rules={{ 
              required: 'Confirmação de senha é obrigatória',
              validate: value => value === novaSenhaValue || 'As senhas não coincidem'
            }}
            render={({ field }) => (
              <TextField 
                {...field} 
                label="Confirmar Nova Senha" 
                type="password" 
                fullWidth 
                required 
                error={!!errors.confirmarNovaSenha}
                helperText={errors.confirmarNovaSenha?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ 
              backgroundColor: 'var(--cor-marca-escuro)', 
              '&:hover': { backgroundColor: 'brown' },
              '&:disabled': { backgroundColor: 'grey.400' }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Alterar Senha'}
          </Button>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)} 
        message="Senha alterada com sucesso!"
      />
    </Box>
  );
};

export default Seguranca;