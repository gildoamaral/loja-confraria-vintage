import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Box,
  Grid,
  Divider,
  CircularProgress, // Adicione esta linha
} from '@mui/material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import CarrinhoItemCard from './CarrinhoItemCard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

function Carrinho() {
  const [carrinho, setCarrinho] = useState([]);
  const [carrinhoOriginal, setCarrinhoOriginal] = useState([]);
  const [loading, setLoading] = useState(true); // Novo estado
  const navigate = useNavigate();

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
      alert('Erro ao remover item do carrinho.');
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
      alert('Erro ao salvar o carrinho. Tente novamente.');
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
      <Box>
        <Box
          sx={{
            p: { xs: 1, sm: 3 },
            justifySelf: 'center',
            boxShadow: 4,
            minHeight: 500,
            position: 'relative',
            width: { xs: '100%', sm: 730 },
            backgroundColor: 'var(--primary-color-theme)',
            // borderRadius: { xs: 0, sm: 3 },
            // marginTop: { xs: '1rem', sm: '2rem' },
            // mx: 'auto',
            mt: 4,
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <CircularProgress color="primary" size={60} />
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Button
                  onClick={() => navigate(-1)}
                  sx={{ minWidth: 0, mr: 2, color: 'primary.main', position: 'absolute', left: 16 }}
                  aria-label="Voltar"
                >
                  <ArrowBackIosNewIcon />
                </Button>
                <ShoppingCartIcon sx={{ fontSize: 38, color: '#FF967E', mr: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  Seu Carrinho
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

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

              {carrinho.length > 0 && (
                <Box
                  sx={{
                    mt: 4,
                    p: 3,
                    maxWidth: 400,
                    ml: 'auto',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Total:
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary">
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
                      background: 'linear-gradient(90deg, #FF967E 0%, #FFB89C 100%)',
                      color: '#4B2626',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #FFB89C 0%, #FF967E 100%)',
                      },
                      mt: 2,
                    }}
                  >
                    Continuar
                  </Button>
                </Box>
              )}

              {carrinho.length === 0 && (
                <Box sx={{ textAlign: 'center', mt: 8, mb: 8 }}>
                  <ShoppingCartIcon sx={{ fontSize: 80, color: '#FFE5D2', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Seu carrinho está vazio.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </>
  );
}

export default Carrinho;
