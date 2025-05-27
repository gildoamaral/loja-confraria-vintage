import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Box,
  Grid,
} from '@mui/material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import CarrinhoItemCard from './CarrinhoItemCard';
import Header from '../../components/Header';

function Carrinho() {
  const [carrinho, setCarrinho] = useState([]);
  const [carrinhoOriginal, setCarrinhoOriginal] = useState([]); // Novo estado
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCarrinho() {
      try {
        const res = await api.get('/pedidos/carrinho');
        setCarrinho(res.data.itens || []);
        setCarrinhoOriginal(res.data.itens || []); // Salva o original
      } catch (error) {
        console.error('Erro ao buscar carrinho:', error);
        setCarrinho([]);
        setCarrinhoOriginal([]);
      }
    }
    fetchCarrinho();
  }, []);


  const parseImagens = (imagemData) => {
    if (!imagemData) return [];
    try {
      return Array.isArray(imagemData) ? imagemData : JSON.parse(imagemData);
    } catch {
      return [imagemData];
    }
  };

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

      // Redireciona para pagamento
      navigate('/pagamento');
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

  return (
    <>
      <Header invisivel />
      <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, p: 2, backgroundColor: '#fff', borderRadius: 2, boxShadow: 3, marginTop: '2rem' }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Seu Carrinho
        </Typography>

        <Grid container spacing={3}>



          {carrinho.map((item) => (
            <CarrinhoItemCard
              key={item.id}
              item={item}
              parseImagens={parseImagens}
              atualizarQuantidade={atualizarQuantidade}
              removerDoCarrinho={removerDoCarrinho}
            />
          ))}


        </Grid>
        {carrinho.length === 0 && (
          <Typography variant="h6" color="text.secondary" align="center" mt={4}>
            Seu carrinho está vazio.
          </Typography>
        )}
        {carrinho.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleContinuar}
              sx={{
                // px: 8,
                // py: 1.5,
                fontWeight: 700,
                fontSize: '0.9rem',
                // borderRadius: 3,
                boxShadow: 2,
                background: 'linear-gradient(90deg, #FF967E 0%, #FFB89C 100%)',
                color: '#4B2626',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FFB89C 0%, #FF967E 100%)',
                },
              }}
            >
              Continuar
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
}

export default Carrinho;
