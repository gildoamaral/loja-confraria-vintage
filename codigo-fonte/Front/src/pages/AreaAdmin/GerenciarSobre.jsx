import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import api from '../../services/api';

const GerenciarSobre = () => {
  const [secoes, setSecoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para o modal de edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSecao, setEditingSecao] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    texto: '',
    imagem: null
  });
  const [uploadLoading, setUploadLoading] = useState(false);

  // Buscar seções ao carregar o componente
  useEffect(() => {
    fetchSecoes();
  }, []);

  const fetchSecoes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/sobre');
      setSecoes(response.data);
    } catch (err) {
      setError('Erro ao carregar seções');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (secao) => {
    setEditingSecao(secao);
    setFormData({
      titulo: secao.titulo,
      texto: secao.texto,
      imagem: null
    });
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setEditingSecao(null);
    setFormData({ titulo: '', texto: '', imagem: null });
    setError('');
    setSuccess('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagem: file
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.titulo.trim() || !formData.texto.trim()) {
      setError('Título e texto são obrigatórios');
      return;
    }


    try {
      setUploadLoading(true);
      setError('');

      const data = new FormData();
      data.append('titulo', formData.titulo);
      data.append('texto', formData.texto);

      
      if (formData.imagem) {
        data.append('image', formData.imagem);
      }


      await api.put(`/api/sobre/${editingSecao.secao}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Seção atualizada com sucesso!');
      fetchSecoes();
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err) {
      setError('Erro ao salvar seção');
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  // Função para criar seções padrão se não existirem
  const criarSecoesIniciais = async () => {
    try {
      const secoesIniciais = [
        {
          secao: 'identidade',
          titulo: 'Nossa Identidade',
          texto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.',
        },
        {
          secao: 'valores',
          titulo: 'Nossos Valores', 
          texto: 'Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor.',
        }
      ];

      for (const secao of secoesIniciais) {
        const data = new FormData();
        data.append('titulo', secao.titulo);
        data.append('texto', secao.texto);
        
        await api.put(`/api/sobre/${secao.secao}`, data);
      }
      
      fetchSecoes();
      setSuccess('Seções iniciais criadas com sucesso!');
    } catch (err) {
      setError('Erro ao criar seções iniciais');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciar Página Sobre
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {secoes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Nenhuma seção encontrada
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Clique no botão abaixo para criar as seções iniciais da página Sobre
          </Typography>
          <Button 
            variant="contained" 
            onClick={criarSecoesIniciais}
            startIcon={<EditIcon />}
          >
            Criar Seções Iniciais
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {secoes.map((secao) => (
            <Grid size={12} key={secao.id}>
              <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, minHeight: 200, boxShadow: 6 }}>
                {secao.urlsImagem?.large && (
                  <CardMedia
                    component="img"
                    sx={{ 
                      width: {sm: 250, xs: "100%"},
                      height: 250,
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                    image={secao.urlsImagem.large}
                    alt={secao.titulo}
                  />
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom>
                      {secao.titulo}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="textSecondary"
                      sx={{ 
                        display: '-webkit-box',
                        '-webkit-line-clamp': 4,
                        '-webkit-box-orient': 'vertical',
                        overflow: 'hidden',
                        flex: 1,
                        
                      }}
                    >
                      {secao.texto}
                    </Typography>
                    <Box sx={{ mt: 'auto' }}>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditClick(secao)}
                        fullWidth
                      >
                        Editar
                      </Button>
                    </Box>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal de Edição */}
      <Dialog 
        open={editModalOpen} 
        onClose={handleCloseModal} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Editar {editingSecao?.titulo}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <TextField
            fullWidth
            label="Título"
            value={formData.titulo}
            onChange={(e) => handleInputChange('titulo', e.target.value)}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Texto"
            value={formData.texto}
            onChange={(e) => handleInputChange('texto', e.target.value)}
            margin="normal"
            multiline
            rows={6}
          />
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<ImageIcon />}
              fullWidth
            >
              {formData.imagem ? 'Imagem Selecionada' : 'Selecionar Nova Imagem'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            {formData.imagem && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                {formData.imagem.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={uploadLoading}
          >
            {uploadLoading ? <CircularProgress size={20} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default GerenciarSobre;
