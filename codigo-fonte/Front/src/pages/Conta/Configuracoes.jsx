import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  CircularProgress, 
  Alert, 
  Snackbar,
  Card,
  CardContent,
  Divider,
  Skeleton,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  Person as PersonIcon,
  Home as HomeIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { getAccountData, updateAccountData } from '../../services/usuarioService';
import { useCep } from '../../hooks/useCep';

const Configuracoes = () => {
  const { control, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [addressFieldsEnabled, setAddressFieldsEnabled] = useState(false);
  const [editingPersonalData, setEditingPersonalData] = useState(false);
  const [editingAddressData, setEditingAddressData] = useState(false);
  
  // Hook para buscar CEP
  const { addressData, loading: cepLoading, error: cepError, fetchAddress } = useCep();
  
  // Watch do campo CEP para formatação
  const cepValue = watch('cep', '');

  // Função para formatar CEP
  const formatCep = (value) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 8) {
      return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return cleanValue.slice(0, 8).replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Função para buscar endereço pelo CEP
  const handleSearchCep = async () => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      await fetchAddress(cleanCep);
    }
  };

  // Efeito para preencher campos quando dados do CEP chegarem
  useEffect(() => {
    if (addressData) {
      setValue('rua', addressData.rua);
      setValue('bairro', addressData.bairro);
      setValue('cidade', addressData.cidade);
      setValue('estado', addressData.estado);
      setAddressFieldsEnabled(true);
    }
  }, [addressData, setValue]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getAccountData();
        reset(data); // Preenche o formulário com os dados recebidos
        
        // Se já tem endereço preenchido, habilita os campos
        if (data.rua || data.bairro || data.cidade) {
          setAddressFieldsEnabled(true);
        }
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      setError('');
      await updateAccountData(data);
      setSuccess(true);
      setEditingPersonalData(false)
      setEditingAddressData(false);
    } catch (err) {
      setError(err.message || 'Erro ao atualizar dados');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="50%" height={40} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Skeleton variant="rectangular" height={56} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Skeleton variant="rectangular" height={56} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configurações da Conta
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Atualize suas informações pessoais e de entrega
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Dados Pessoais */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Dados Pessoais</Typography>
                  <IconButton
                    onClick={() => setEditingPersonalData(!editingPersonalData)}
                    size="small"
                    sx={{ ml: 'auto' }}
                    title={editingPersonalData ? "Cancelar edição" : "Editar dados pessoais"}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller 
                      name="nome" 
                      control={control} 
                      defaultValue="" 
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          label="Nome" 
                          fullWidth 
                          required 
                          variant="outlined"
                          disabled={!editingPersonalData}
                        />
                      )} 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller 
                      name="sobrenome" 
                      control={control} 
                      defaultValue="" 
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          label="Sobrenome" 
                          fullWidth 
                          required 
                          variant="outlined"
                          disabled={!editingPersonalData}
                        />
                      )} 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller 
                      name="email" 
                      control={control} 
                      defaultValue="" 
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          label="E-mail" 
                          fullWidth 
                          required 
                          disabled 
                          variant="outlined"
                          helperText="Email não pode ser alterado"
                        />
                      )} 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller 
                      name="telefone" 
                      control={control} 
                      defaultValue="" 
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          label="Telefone" 
                          fullWidth 
                          required 
                          variant="outlined"
                          disabled={!editingPersonalData}
                        />
                      )} 
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Endereço de Entrega */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <HomeIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Endereço de Entrega</Typography>
                  <IconButton
                    onClick={() => setEditingAddressData(!editingAddressData)}
                    size="small"
                    sx={{ ml: 'auto' }}
                    title={editingAddressData ? "Cancelar edição" : "Editar endereço"}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Controller 
                      name="cep" 
                      control={control} 
                      defaultValue="" 
                      render={({ field: { onChange, value, ...field } }) => (
                        <TextField 
                          {...field}
                          value={formatCep(value || '')}
                          onChange={(e) => onChange(formatCep(e.target.value))}
                          label="CEP" 
                          fullWidth 
                          variant="outlined"
                          placeholder="00000-000"
                          disabled={!editingAddressData}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={handleSearchCep}
                                  disabled={!editingAddressData || cepLoading || (cepValue?.replace(/\D/g, '').length !== 8)}
                                  size="small"
                                  title="Buscar endereço"
                                >
                                  {cepLoading ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <SearchIcon />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                          helperText={cepError || "Digite o CEP e clique na lupa para buscar o endereço"}
                          error={!!cepError}
                        />
                      )} 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <Controller 
                      name="rua" 
                      control={control} 
                      defaultValue="" 
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          label="Rua" 
                          fullWidth 
                          variant="outlined"
                          disabled={!editingAddressData || !addressFieldsEnabled}
                        />
                      )} 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Controller 
                      name="numero" 
                      control={control} 
                      defaultValue="" 
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          label="Número" 
                          fullWidth 
                          variant="outlined"
                          disabled={!editingAddressData || !addressFieldsEnabled}
                        />
                      )} 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <Controller 
                      name="complemento" 
                      control={control} 
                      defaultValue="" 
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          label="Complemento" 
                          fullWidth 
                          variant="outlined"
                          disabled={!editingAddressData || !addressFieldsEnabled}
                        />
                      )} 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller 
                      name="bairro" 
                      control={control} 
                      defaultValue="" 
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          label="Bairro" 
                          fullWidth 
                          variant="outlined"
                          disabled={!editingAddressData || !addressFieldsEnabled}
                        />
                      )} 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Controller 
                      name="cidade" 
                      control={control} 
                      defaultValue="" 
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          label="Cidade" 
                          fullWidth 
                          variant="outlined"
                          disabled={!editingAddressData || !addressFieldsEnabled}
                        />
                      )} 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Controller 
                      name="estado" 
                      control={control} 
                      defaultValue="" 
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          label="UF" 
                          fullWidth 
                          variant="outlined"
                          disabled={!editingAddressData || !addressFieldsEnabled}
                        />
                      )} 
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Botão de Salvar */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                startIcon={<SaveIcon />}
                disabled={isSubmitting || (!editingPersonalData && !editingAddressData)}
                sx={{ minWidth: 150 }}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)} 
        message="Dados atualizados com sucesso!" 
      />
    </Box>
  );
};

export default Configuracoes;