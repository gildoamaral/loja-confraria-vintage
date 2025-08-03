import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Box,
  Grid,
  Divider,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import CarrinhoItemCard from './CarrinhoItemCard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';


function Carrinho() {
  const [carrinho, setCarrinho] = useState([]);
  const [carrinhoOriginal, setCarrinhoOriginal] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    async function fetchCarrinho() {
      try {
        const res = await api.get('/pedidos/carrinho');
        setCarrinho(res.data.itens || []);
        setCarrinhoOriginal(res.data.itens || []);
        console.log('Carrinho carregado:', res.data.itens);

      } catch (error) {
        console.error('Erro ao buscar carrinho:', error);
        setCarrinho([]);
        setCarrinhoOriginal([]);
      } finally {
        setLoading(false); // Finaliza o loading
      }
    }
    fetchCarrinho();
  }, []);

  const removerDoCarrinho = async (itemId) => {
    try {
      await api.delete(`/pedidos/item/${itemId}`);
      setCarrinho((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      showMessage('Erro ao remover item do carrinho.');
      console.error('Erro ao remover item:', error);
    }
  };

  // Função para salvar o carrinho no banco
  const handleContinuar = async () => {
    try {
      // Verifica itens alterados
      const itensAlterados = carrinho.filter((item, idx) =>
        item.quantidade !== carrinhoOriginal[idx]?.quantidade
      );

      // Atualiza apenas os itens alterados
      await Promise.all(
        itensAlterados.map(item =>
          api.put(`/pedidos/item/${item.id}`, { quantidade: item.quantidade })
        )
      );

      setCarrinhoOriginal(carrinho);
      // Redireciona para pagamento, passando valorTotal e quantidadeTotal
      navigate('/pagamento', { state: { valorTotal, quantidadeTotal } });
    } catch (error) {
      showMessage('Erro ao salvar o carrinho. Tente novamente.');
      console.error('Erro ao salvar o carrinho:', error);
    }
  };

  const atualizarQuantidade = (itemId, novaQuantidade) => {
    setCarrinho((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantidade: novaQuantidade } : item
      )
    );
  };

  // Calcula o valor total do carrinho
  const valorTotal = carrinho.reduce((total, item) => {
    const preco = item.produto?.precoPromocional ?? item.produto?.preco ?? 0;
    return total + preco * item.quantidade;
  }, 0);

  // Calcula a quantidade total de produtos
  const quantidadeTotal = carrinho.reduce((total, item) => total + item.quantidade, 0);

  return (
    <>
      {/* <Header invisivel /> */}
        <Box
          sx={{
            p: { xs: "1rem", sm: "3rem" },
            justifySelf: 'center',
            minHeight: 600,
            position: 'relative',
            width: { xs: '100%', sm: '100%' },
            mx: 'auto',
            backgroundColor: 'var(--primary-color-theme)',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <CircularProgress color="primary" size={60} />
            </Box>
          ) : (
            <>

              {carrinho.length > 0 ? (
                <Grid container spacing={3}>
                  {/* Lista de produtos do carrinho */}
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Grid container spacing={2} direction="column">
                      {carrinho.map((item) => (
                        <Grid size={12} key={item.id}>
                          <CarrinhoItemCard
                            item={item}
                            atualizarQuantidade={atualizarQuantidade}
                            removerDoCarrinho={removerDoCarrinho}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Resumo do pedido */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box
                      sx={{
                        p: 3,
                        borderLeft: { md: '1px solid', xs: 'none' },
                        borderColor: { md: 'divider' },
                        ml: { md: 2 },
                        position: { md: 'sticky' },
                        top: { md: 20 },
                      }}
                    >
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                        Resumo do Pedido
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1">
                          Quantidade de itens:
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {quantidadeTotal}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight={700}>
                          Total:
                        </Typography>
                        <Typography variant="h5" fontWeight={700} sx={{ color: 'var(--cor-marca)' }}>
                          R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        onClick={handleContinuar}
                        sx={{
                          fontWeight: 700,
                          fontSize: '1rem',
                          boxShadow: 2,
                          background: 'var(--cor-marca)',
                          color: '#4B2626',
                          '&:hover': {
                            background: 'var(--cor-marca-escuro)',
                          },
                          py: 1.5,
                        }}
                      >
                        Continuar
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', mt: 8, mb: 8 }}>
                  <ShoppingCartIcon sx={{ fontSize: 80, color: 'var(--cor-marca)', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{fontFamily: 'Special Elite, Courier, monospace'}}>
                    Seu carrinho está vazio.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>

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
}

export default Carrinho;
