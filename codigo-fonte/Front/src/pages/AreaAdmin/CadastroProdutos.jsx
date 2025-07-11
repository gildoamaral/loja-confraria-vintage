import { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  IconButton,
  ImageList,
  ImageListItem,
  FormHelperText,
  Paper,
  Container
} from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';
import api from '../../services/api';

const categorias = [
  'SAIA', 'SHORT', 'CALÇA', 'BLUSA', 'CAMISA', 'CONJUNTOS', 'VESTIDO',
  'CALCADO', 'ACESSORIOS', 'OUTROS'
];
const coresValidas = [
  'VERMELHO', 'AZUL', 'AMARELO', 'VERDE', 'PRETO', 'BRANCO', 'ROSA',
  'CINZA', 'BEGE', 'ROXO', 'LARANJA', 'MARROM', 'PRATA', 'DOURADO'
];
const ocasioes = ['FESTAS', 'OCASIOES_ESPECIAIS', 'CASUAL'];
const tamanhosValidos = ['P', 'M', 'G', 'GG'];

const CadastroProdutos = () => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [imagens, setImagens] = useState([]);
  const [quantidade, setQuantidade] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [cor, setCor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [ocasiao, setOcasiao] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !nome ||
      !preco ||
      !quantidade ||
      !tamanho ||
      !cor ||
      !categoria
    ) {
      setMessage('Preencha todos os campos obrigatórios');
      setIsSubmitting(false);
      return;
    }

    if (imagens.length === 0) {
      setMessage('Adicione pelo menos uma imagem.');
      return;
    }

    if (!tamanhosValidos.includes(tamanho)) {
      setMessage(`Tamanho inválido. Escolha: ${tamanhosValidos.join(', ')}`);
      setIsSubmitting(false);
      return;
    }
    if (!coresValidas.includes(cor)) {
      setMessage(`Cor inválida. Escolha: ${coresValidas.join(', ')}`);
      setIsSubmitting(false);
      return;
    }
    if (!categorias.includes(categoria)) {
      setMessage(`Categoria inválida. Escolha: ${categorias.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    setMessage('Enviando imagens...');

    try {
      const formData = new FormData();

      imagens.forEach(imageFile => {
        formData.append('images', imageFile);
      });

      const uploadResponse = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadResults = uploadResponse.data;

      setMessage('Imagens enviadas! Criando produto...');

      const produtoData = {
        nome,
        descricao,
        preco: parseFloat(preco),
        quantidade: parseInt(quantidade, 10),
        tamanho,
        cor,
        categoria,
        ocasiao: ocasiao || null,
        uploadResults,
      };

      await api.post('/produtos', produtoData);

      setMessage('Produto criado com sucesso!');
      setNome('');
      setDescricao('');
      setPreco('');
      setImagens([]);
      setQuantidade('');
      setTamanho('');
      setCor('');
      setCategoria('');
      setOcasiao('');

    } catch (error) {
      console.error('Erro no processo de criação:', error);
      setMessage(error.response?.data?.message || 'Ocorreu um erro. Verifique o console.');
    } finally {
      setIsSubmitting(false);
    }


  };

  const getOcasiaoLabel = (ocasiao) => {
    switch (ocasiao) {
      case 'OCASIOES_ESPECIAIS':
        return 'Ocasiões Especiais';
      case 'FESTAS':
        return 'Festas';
      case 'CASUAL':
        return 'Casual';
      default:
        return ocasiao;
    }
  };

  const handleImageChangeCadastro = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagens.length > 5) {
      alert('Máximo de 5 imagens permitidas');
      return;
    }
    setImagens(prev => [...prev, ...files]);
  };

  const handleRemoveImage = (idx) => {
    setImagens(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Cadastro de Produtos
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            {/* LINHA 1: Nome, Preço, Quantidade */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                required
                fullWidth
                label="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                required
                fullWidth
                label="Preço"
                type="number"
                inputProps={{ step: "0.01" }}
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                required
                fullWidth
                label="Quantidade"
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                variant="outlined"
              />
            </Grid>

            {/* LINHA 2: Tamanho, Cor, Categoria, Ocasião */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl required fullWidth>
                <InputLabel>Tamanho</InputLabel>
                <Select
                  value={tamanho}
                  label="Tamanho"
                  onChange={(e) => setTamanho(e.target.value)}
                >
                  {tamanhosValidos.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl required fullWidth>
                <InputLabel>Cor</InputLabel>
                <Select
                  value={cor}
                  label="Cor"
                  onChange={(e) => setCor(e.target.value)}
                >
                  {coresValidas.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c.charAt(0) + c.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl required fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={categoria}
                  label="Categoria"
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  {categorias.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Ocasião</InputLabel>
                <Select
                  value={ocasiao}
                  label="Ocasião"
                  onChange={(e) => setOcasiao(e.target.value)}
                >
                  <MenuItem value="">Selecione</MenuItem>
                  {ocasioes.map((o) => (
                    <MenuItem key={o} value={o}>
                      {getOcasiaoLabel(o)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* LINHA 3: Descrição */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Descrição"
                multiline
                rows={4}
                value={descricao}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setDescricao(e.target.value);
                  }
                }}
                variant="outlined"
                inputProps={{ maxLength: 500 }}
                helperText={`${descricao.length}/500 caracteres`}
              />
            </Grid>

            {/* LINHA 4: Upload de Imagens */}
            <Grid size={{ xs: 12 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Imagens (máx. 5) *
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  disabled={imagens.length >= 5}
                  sx={{ mb: 2 }}
                >
                  Adicionar Imagens
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    onChange={handleImageChangeCadastro}
                  />
                </Button>
                <FormHelperText>
                  {imagens.length}/5 imagens selecionadas
                </FormHelperText>

                {imagens.length > 0 && (
                  <ImageList sx={{ width: '100%', height: 200 }} cols={5} rowHeight={160}>
                    {imagens.map((img, idx) => (
                      <ImageListItem key={idx} sx={{ position: 'relative' }}>
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Preview ${idx}`}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveImage(idx)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.8)',
                            },
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}
              </Box>
            </Grid>

            {/* Botão Submit */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  sx={{ px: 6, py: 1.5 }}
                >
                  {isSubmitting ? 'Enviando...' : 'Criar Produto'}
                </Button>
              </Box>
            </Grid>

            {/* Mensagem */}
            {message && (
              <Grid size={{ xs: 12 }}>
                <Alert
                  severity={message.includes('sucesso') ? 'success' : 'error'}
                  sx={{ mt: 2 }}
                >
                  {message}
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CadastroProdutos;
