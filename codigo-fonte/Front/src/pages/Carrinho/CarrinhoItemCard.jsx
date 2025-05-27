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
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#f3f3f3'}}>
      <CardMedia
        component="img"
        sx={{ width: 120, height: 120, objectFit: 'contain', borderRadius: 2, mr: 2 }}
        image={parseImagens(item.produto?.imagem)[0]}
        alt={item.produto?.nome}
      />
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" fontWeight={600}>{item.produto?.nome}</Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          {item.produto?.descricao}
        </Typography>
        <Stack direction="row" spacing={2} mb={1}>
          <Typography variant="body2">
            <b>Categoria:</b> {item.produto?.categoria}
          </Typography>
          <Typography variant="body2">
            <b>Cor:</b> {item.produto?.selectedCor || item.produto?.cor}
          </Typography>
          <Typography variant="body2">
            <b>Tamanho:</b> {item.produto?.selectedTamanho || item.produto?.tamanho}
          </Typography>
          <Typography variant="body2">
            <b>Ocasião:</b> {item.produto?.ocasiao}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body1" fontWeight={500}>
            {item.produto?.precoPromocional ? (
              <>
                <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 8 }}>
                  R$ {(item.produto?.preco ?? 0).toFixed(2)}
                </span>
                <span style={{ color: '#d32f2f' }}>
                  R$ {(item.produto?.precoPromocional ?? 0).toFixed(2)}
                </span>
              </>
            ) : (
              <>R$ {(item.produto?.preco ?? 0).toFixed(2)}</>
            )}
          </Typography>
          <TextField
            label="Qtd"
            type="number"
            size="small"
            value={item.quantidade}
            inputProps={{ min: 1, style: { width: 60 } }}
            onChange={(e) => {
              const value = Math.max(1, parseInt(e.target.value) || 1);
              atualizarQuantidade(item.id, value);
            }}
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