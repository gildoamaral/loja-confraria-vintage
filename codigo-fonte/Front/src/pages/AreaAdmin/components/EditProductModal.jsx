import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  FormHelperText
} from '@mui/material';
import inputStyles from '../../../styles/inputStyles';


// Defina os valores dos seus Enums aqui para os menus de seleção
const CATEGORIAS = ['SAIA', 'SHORT', 'CALÇA', 'BLUSA', 'CAMISA', 'CONJUNTOS', 'VESTIDO', 'CALCADO', 'ACESSORIOS', 'OUTROS'];
const OCASIOES = ['CASAMENTO', 'BATIZADO', 'MADRINHAS', 'FORMATURA', 'OCASIOES_ESPECIAIS', 'CASUAL', 'FESTAS', 'OUTROS'];

const EditProductModal = ({ open, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({});

  // Popula o formulário com os dados do produto quando o modal abre
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        precoPromocional: product.precoPromocional ?? '', // Garante que não seja null
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'switch' ? checked : value, // <-- MUDANÇA 1: Handle Switch
    }));
  };


  const handleSave = () => {
    // Prepara os dados para enviar, convertendo para os tipos corretos
    const dataToSave = {
      ...formData,
      preco: parseFloat(formData.preco),
      quantidade: parseInt(formData.quantidade, 10),
      precoPromocional: formData.precoPromocional ? parseFloat(formData.precoPromocional) : null,
      ocasiao: formData.ocasiao === '' ? null : formData.ocasiao, // Converte string vazia para null
    };
    onSave(dataToSave);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar Produto: {product.nome}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField name="nome" label="Nome do Produto" value={formData.nome || ''} onChange={handleChange} fullWidth sx={inputStyles} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField name="quantidade" label="Quantidade" type="number" value={formData.quantidade || 0} onChange={handleChange} fullWidth sx={inputStyles} />
          </Grid>
          <Grid size={12}>
            <TextField name="descricao" label="Descrição" value={formData.descricao || ''} onChange={handleChange} fullWidth multiline rows={3} sx={inputStyles} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField name="preco" label="Preço (R$)" type="number" value={formData.preco || ''} onChange={handleChange} fullWidth sx={inputStyles} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField name="precoPromocional" label="Preço Promocional (Opcional)" type="number" value={formData.precoPromocional || ''} onChange={handleChange} fullWidth sx={inputStyles} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField name="categoria" label="Categoria" value={formData.categoria || ''} onChange={handleChange} fullWidth select sx={inputStyles}>
              {CATEGORIAS.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField name="ocasiao" label="Ocasião" value={formData.ocasiao || ''} onChange={handleChange} fullWidth select sx={inputStyles}>
              <MenuItem value="">Nenhuma (Para CONFRARIA)</MenuItem>
              {OCASIOES.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid size={12}>
            <FormControlLabel
              control={<Switch checked={formData.ativo || false} onChange={handleChange} name="ativo" />}
              label="Produto Ativo"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'var(--cor-marca-escuro)',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'var(--cor-marca-escuro)',
                },
              }}
            />
            {/* 
            <FormControlLabel
            control={
              <Switch
                name="emDestaque"
                checked={formData.emDestaque || false}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Colocar em Destaque na Homepage"
          />
          <FormHelperText>
            Apenas 5 produtos podem ser marcados como destaque. Se o limite for atingido, este produto não aparecerá na homepage.
          </FormHelperText>
           */}
          </Grid>

        </Grid>


      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='error'>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" sx={{ bgcolor: 'var(--cor-marca-escuro)', color: 'white', '&:hover': { bgcolor: 'var(--cor-marca)' } }}>Salvar Alterações</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProductModal;