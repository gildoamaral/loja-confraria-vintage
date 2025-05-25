import { useCarrinho } from '../../context/useCarrinho';
import {
  Typography,
  Button,
  Box,
  Grid,
} from '@mui/material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import CarrinhoItemCard from './CarrinhoItemCard';

function Carrinho() {
  const { carrinho, removerDoCarrinho, atualizarQuantidade } = useCarrinho();
  // console.log("o carrinho: ", carrinho.id);
  console.log("O Carrinho (pagina do Carrinho): ", carrinho);

  const navigate = useNavigate();

  const parseImagens = (imagemData) => {
    if (!imagemData) return [];
    try {
      return Array.isArray(imagemData) ? imagemData : JSON.parse(imagemData);
    } catch {
      return [imagemData];
    }
  };

  // Função para salvar o carrinho no banco
  const handleContinuar = async () => {
    try {
      // 1. Busca o usuário logado (backend deve ler do cookie JWT)
      // 2. Para cada item do carrinho, chama a rota de criar/adicionar item ao pedido
      for (const product of carrinho) {
        console.log(product);

        await api.post('/pedidos/criar', {
          produtoId: product.id,
          quantidade: product.quantidade,
          // usuarioId será obtido no backend pelo JWT
        });
      }
      // 3. Redireciona para pagamento
      navigate('/pagamento');
    } catch (error) {
      alert('Erro ao salvar o carrinho. Tente novamente.');
      console.error('Erro ao salvar o carrinho:', error);
    }
  };

  return (
    <>
      <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, p: 2, backgroundColor: '#fff', borderRadius: 2, boxShadow: 3 }}>
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
