import { useCarrinho } from '../../context/useCarrinho';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
  TextField,
  Box,
  Grid,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function Carrinho() {
  const { carrinho, removerDoCarrinho, atualizarQuantidade } = useCarrinho();

  const parseImagens = (imagemData) => {
    if (!imagemData) return [];
    try {
      return Array.isArray(imagemData) ? imagemData : JSON.parse(imagemData);
    } catch {
      return [imagemData];
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
            <Grid key={item.id}>

              <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#f3f3f3' }}>
                <CardMedia
                  component="img"
                  sx={{ width: 120, height: 120, objectFit: 'contain', borderRadius: 2, mr: 2 }}
                  image={parseImagens(item.imagem)}
                  alt={item.nome}
                />

                <CardContent sx={{ flex: 1 }}>

                  <Typography variant="h6" fontWeight={600}>{item.nome}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {item.descricao}
                  </Typography>

                  <Stack direction="row" spacing={2} mb={1}>
                    <Typography variant="body2">
                      <b>Categoria:</b> {item.categoria}
                    </Typography>
                    <Typography variant="body2">
                      <b>Cor:</b> {item.selectedCor || item.cor}
                    </Typography>
                    <Typography variant="body2">
                      <b>Tamanho:</b> {item.selectedTamanho || item.tamanho}
                    </Typography>
                    <Typography variant="body2">
                      <b>Ocasião:</b> {item.ocasiao}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body1" fontWeight={500}>
                      {item.precoPromocional ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 8 }}>
                            R$ {item.preco.toFixed(2)}
                          </span>
                          <span style={{ color: '#d32f2f' }}>
                            R$ {item.precoPromocional.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <>R$ {item.preco.toFixed(2)}</>
                      )}
                    </Typography>
                    <TextField
                      label="Qtd"
                      type="number"
                      size="small"
                      value={item.quantidade}
                      inputProps={{ min: 1, style: { width: 60 } }}
                      onChange={(e) =>
                        atualizarQuantidade(item.id, parseInt(e.target.value))
                      }
                      sx={{ ml: 2 }}
                    />
                    <IconButton
                      color="error"
                      onClick={() => removerDoCarrinho(item.id)}
                      sx={{ ml: 2 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>



            </Grid>


          ))}
        </Grid>
        {carrinho.length === 0 && (
          <Typography variant="h6" color="text.secondary" align="center" mt={4}>
            Seu carrinho está vazio.
          </Typography>
        )}
        {carrinho.length > 0 && (
          <Box sx={{mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={""}
              sx={{
                // px: 4,
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
              href="/pagamento"
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
