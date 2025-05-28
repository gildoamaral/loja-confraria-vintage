import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  TextField,
  Stack,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const CarrinhoItemCard = ({
  item,
  parseImagens,
  atualizarQuantidade,
  removerDoCarrinho
}) => (
  <Grid>
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
);

export default CarrinhoItemCard;