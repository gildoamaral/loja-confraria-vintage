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
      peso: formData.peso ? parseFloat(formData.peso) : null,
      altura: formData.altura ? parseFloat(formData.altura) : null,
      largura: formData.largura ? parseFloat(formData.largura) : null,
      comprimento: formData.comprimento ? parseFloat(formData.comprimento) : null,
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

          {/* Campos de dimensões para frete */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField 
              name="peso" 
              label="Peso (kg)" 
              type="number" 
              inputProps={{ step: 0.1 }}
              value={formData.peso || ''} 
              onChange={handleChange} 
              fullWidth 
              sx={inputStyles}
              placeholder="Ex: 0.5" 
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField 
              name="altura" 
              label="Altura (cm)" 
              type="number" 
              inputProps={{ step: 0.1 }}
              value={formData.altura || ''} 
              onChange={handleChange} 
              fullWidth 
              sx={inputStyles}
              placeholder="Ex: 30.0" 
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField 
              name="largura" 
              label="Largura (cm)" 
              type="number" 
              inputProps={{ step: 0.1 }}
              value={formData.largura || ''} 
              onChange={handleChange} 
              fullWidth 
              sx={inputStyles}
              placeholder="Ex: 25.5" 
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField 
              name="comprimento" 
              label="Comprimento (cm)" 
              type="number" 
              inputProps={{ step: 0.1 }}
              value={formData.comprimento || ''} 
              onChange={handleChange} 
              fullWidth 
              sx={inputStyles}
              placeholder="Ex: 40.0" 
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField name="categoria" label="Categoria" value={formData.categoria || ''} onChange={handleChange} fullWidth select sx={inputStyles}>
              {CATEGORIAS.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField name="ocasiao" label="Ocasião" value={formData.ocasiao || ''} onChange={handleChange} fullWidth select sx={inputStyles}>
              <MenuItem value="">Nenhuma (Para CONFRARIA)</MenuItem>
              {OCASIOES.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </TextField>
          </Grid>

          {/* Campos de cor e tamanho */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField 
              name="cor" 
              label="Cor" 
              value={formData.cor || ''} 
              fullWidth 
              sx={inputStyles}
              placeholder="Ex: Azul, Vermelho, Preto..." 
              InputProps={{
                readOnly: true,
              }}
              helperText="Campo somente leitura"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField 
              name="tamanho" 
              label="Tamanho" 
              value={formData.tamanho || ''} 
              fullWidth 
              sx={inputStyles}
              placeholder="Ex: P, M, G, GG..." 
              InputProps={{
                readOnly: true,
              }}
              helperText="Campo somente leitura"
            />
          </Grid>

          {/* Nota sobre campos de dimensões */}
          <Grid size={12}>
            <FormHelperText sx={{ fontSize: '0.75rem', color: 'text.secondary', textAlign: 'center', mt: 1 }}>
              Os campos Peso, Altura, Largura e Comprimento são importantes para o cálculo do frete
            </FormHelperText>
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