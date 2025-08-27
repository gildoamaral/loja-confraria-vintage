import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  IconButton,
  Paper,
  Divider,
  Container,
  CircularProgress,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import api from '../../services/api';
import { useAuth } from '../../contexts'; // Importa nosso contexto de autenticação
import inputStyles from '../../styles/inputStyles';

const InformProduto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth(); // Pega o status de login do contexto

  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantidade, setQuantidade] = useState(1);
  const [selectedTamanho, setSelectedTamanho] = useState('');
  const [selectedCor, setSelectedCor] = useState('');
  const [cepDestino, setCepDestino] = useState('');
  const [freteOptions, setFreteOptions] = useState([]);
  const [loadingFrete, setLoadingFrete] = useState(false);
  // Novo estado para controlar o modal de sucesso
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Estados para controlar as mensagens
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  const showMessage = (message, severity = 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/produtos/${id}`);
        setProduto(data);
      } catch (err) {
        console.error('Erro ao buscar produto:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduto();
  }, [id]);


  // Inicializa cor e tamanho quando o produto é carregado
  useEffect(() => {
    if (produto) {
      if (produto.cor) {
        const primeiraCor = produto.cor.split(',')[0].trim().toUpperCase();
        setSelectedCor(primeiraCor);
      }
      if (produto.tamanho) {
        const primeiroTamanho = produto.tamanho.split(',')[0].trim().toUpperCase();
        setSelectedTamanho(primeiroTamanho);
      }
    }
  }, [produto]);

  const calcularFrete = async () => {
    if (!cepDestino.match(/^\d{5}-?\d{3}$/)) {
      showMessage('Informe um CEP válido (8 dígitos).');
      return;
    }
    setLoadingFrete(true);
    try {
      const body = {
        cepDestino,
        altura: produto.altura,
        largura: produto.largura,
        comprimento: produto.comprimento,
        peso: produto.peso
      };
      const response = await api.post('/frete', body);
      const sorted = response.data
        .sort((a, b) => parseFloat(a.price || a.valor) - parseFloat(b.price || b.valor))
        .slice(0, 5);
      setFreteOptions(sorted);
    } catch (err) {
      console.error('Erro ao calcular frete:', err);
      showMessage('Não foi possível calcular o frete.');
    } finally {
      setLoadingFrete(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  if (!produto) {
    return <Typography sx={{ textAlign: 'center', mt: 4 }}>Produto não encontrado.</Typography>;
  }

  const handleAddToCart = async () => {
    // Verifica se o produto está ativo
    if (!produto.ativo) {
      showMessage('Este produto está inativo e não pode ser adicionado ao carrinho.', 'warning');
      return;
    }

    // Verifica se cor e tamanho foram selecionados
    if (!selectedTamanho || !selectedCor) {
      showMessage('Por favor selecione o tamanho e a cor', 'warning');
      return;
    }

    // Verifica se o usuário está logado
    if (!isAuthenticated) {
      showMessage('Faça login para adicionar produtos ao carrinho.', 'info');
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }

    try {
      setLoading(true);
      const item = {
        produtoId: produto.id,
        quantidade,
        tamanho: selectedTamanho,
        cor: selectedCor
      };
      await api.post('/pedidos/criar', item);
      window.dispatchEvent(new Event('cartUpdated'));
      setSuccessModalOpen(true);
    } catch (error) {
      showMessage('Erro ao adicionar produto ao carrinho.');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const imagensDoProduto = produto.imagens?.sort((a, b) => a.posicao - b.posicao) || [];
  const imagemPrincipal = imagensDoProduto[activeImageIndex]?.urls?.large || 'https://via.placeholder.com/800?text=Sem+Imagem';

  return (
    <>
      <Container maxWidth="lg" sx={{ my: { xs: 2, md: 5 } }}>
        <Typography variant="overline" color="text.secondary">{produto.categoria.toLowerCase()} ♦ {produto.id}</Typography>

        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
          <Grid container spacing={{ xs: 2, md: 4 }}>
            {/* Coluna da Galeria de Imagens (Esquerda) */}
            <Grid size={{ xs: 12, md: 7.3 }}  >
              <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
                <img
                  src={imagemPrincipal}
                  alt={produto.nome}
                  style={{ display: 'block', objectFit: 'cover', width: '100%', height: 500, objectPosition: 'top' }}
                />
              </Box>
              <Grid container spacing={1} justifyContent="start">
                {imagensDoProduto.map((imagem, idx) => (
                  <Grid size="auto" key={imagem.id}>
                    <Box
                      component="img"
                      src={imagem.urls.thumbnail}
                      alt={`Thumbnail ${idx + 1}`}
                      onClick={() => setActiveImageIndex(idx)}
                      sx={{
                        width: 80, height: 80, objectFit: 'cover', borderRadius: '4px',
                        border: idx === activeImageIndex ? '3px solid' : '3px solid transparent',
                        borderColor: idx === activeImageIndex ? 'black' : 'transparent',
                        transition: 'border-color 0.2s', cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.light' }
                      }}
                    />

                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Coluna de Informações e Ações (Direita) */}
            <Grid size={{ xs: 12, md: 4.7 }} >

              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 5 }}>
                  <Typography variant="h4" component={'h1'} fontWeight={700} sx={{ fontFamily: 'Special Elite, Courier, monospace' }}>{produto.nome}</Typography>
                  {!produto.ativo && (
                    <Chip
                      label="Inativo"
                      color="error"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>


                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {/* Coluna 1: Cor e Tamanho */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    {/* COR */}
                    {produto.cor && (
                      <Box>
                        <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.4, fontFamily: 'Special Elite, Courier, monospace' }} >
                          Cor: <span style={{ color: 'gray' }}>{selectedCor}</span>
                        </Typography>
                      </Box>
                    )}

                    {/* TAMANHO */}
                    {produto.tamanho && (
                      <Box>
                        <Typography variant="body2" fontWeight="medium" sx={{ fontFamily: 'Special Elite, Courier, monospace' }}>
                          Tamanho: <span style={{ color: 'gray' }}>{selectedTamanho}</span>
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  {/* Coluna 2: Preço */}
                  <Grid size={{ xs: 12, sm: 6 }} >
                    <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'Special Elite, Courier, monospace' }}>
                      Preço:
                    </Typography>
                    {produto.precoPromocional ? (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: 'line-through',
                              color: 'text.secondary',
                              fontSize: '0.8rem'
                            }}
                          >
                            R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}
                          </Typography>
                          <Typography variant="h6" color="error" fontWeight="bold" sx={{ fontFamily: 'Special Elite, Courier, monospace' }}>
                            R$ {parseFloat(produto.precoPromocional).toFixed(2).replace('.', ',')}
                          </Typography>
                        </Box>
                        <Chip
                          label={`- ${Math.round(((produto.preco - produto.precoPromocional) / produto.preco) * 100)}%`}
                          color="error"
                          size="small"
                          variant='outlined'
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      </>
                    ) : (
                      <Typography variant="h5" color="error" fontWeight="900" sx={{ fontFamily: 'Libre Bodoni, Courier, monospace' }}>
                        R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}
                      </Typography>
                    )}
                  </Grid>
                </Grid>


                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontFamily: 'Special Elite, Courier, monospace',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {produto.descricao}
                </Typography>


                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 10 }}>
                  <Typography fontWeight="medium" sx={{ fontFamily: 'Special Elite, Courier, monospace' }}>Quantidade:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '20px' }}>
                    <IconButton onClick={() => setQuantidade(q => Math.max(1, q - 1))} size="small"><RemoveIcon /></IconButton>
                    <Typography sx={{ px: 2, fontWeight: 'bold' }}>{quantidade}</Typography>
                    <IconButton onClick={() => setQuantidade(q => q + 1)} size="small"><AddIcon /></IconButton>
                  </Box>
                  {/* <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'Special Elite, Courier, monospace' }}>( {produto.quantidade} unidades restantes )</Typography> */}
                </Box>


                <Box mt={4} width={'50%'} sx={{ display: 'flex', justifyContent: 'center', width: '100%', pb: 5 }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{ bgcolor: produto.ativo ? 'black' : 'grey.400', color: 'white' }}
                    fullWidth
                    startIcon={<AddShoppingCartIcon />}
                    onClick={handleAddToCart}
                    disabled={loading || !produto.ativo}
                  >
                    {loading ? 'Adicionando...' : produto.ativo ? 'Adicionar ao Carrinho' : 'Produto Inativo'}
                  </Button>
                </Box>


                <Box >
                  <Typography variant="h6" sx={{ mb: 2 }}>Calcular Frete</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Seu CEP"
                      variant="outlined"
                      size="small"
                      value={cepDestino}
                      onChange={e => setCepDestino(e.target.value)}
                      placeholder="00000-000"
                      sx={inputStyles}
                    />
                    <Button variant="outlined" color="warning" onClick={calcularFrete} disabled={loadingFrete}>
                      {loadingFrete ? <CircularProgress size={24} /> : 'Calcular'}
                    </Button>
                  </Box>
                  <Typography variant='caption' color='text.secondary'>
                    Isto é uma estimativa. O valor final, apenas na área de pagamento.
                  </Typography>

                  {/* Exibição das opções de frete */}
                  {freteOptions.length > 0 && (
                    <Box sx={{ mt: 2 }}>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '84%' }}>
                        {freteOptions.map(opt => (
                          <Box
                            key={opt.id || opt.codigo}
                            sx={{
                              p: "0rem 1rem",
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {opt.company?.picture && (
                                  <img
                                    src={opt.company.picture}
                                    alt={opt.company.name}
                                    style={{ width: 30, height: 30, objectFit: 'contain' }}
                                  />
                                )}
                                <Typography variant="body2" fontWeight="medium">
                                  {opt.name || opt.codigo}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body1" fontWeight="bold" color="primary">
                                  R$ {parseFloat(opt.price || opt.valor).toFixed(2).replace('.', ',')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {opt.delivery_time || opt.prazoEntrega} dias úteis
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      <Dialog open={successModalOpen} onClose={() => setSuccessModalOpen(false)}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Produto Adicionado!</DialogTitle>
        <DialogActions sx={{ justifyContent: 'center', p: 2, gap: 2 }}>
          <Button onClick={() => { setSuccessModalOpen(false); navigate('/'); }} variant="outlined" sx={{ color: 'black', borderColor: 'black' }}>
            Continuar Comprando
          </Button>
          <Button onClick={() => navigate('/carrinho')} variant="contained" autoFocus sx={{ bgcolor: 'black', color: 'white' }}>
            Ir para o Carrinho
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default InformProduto;