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
    <Card
      sx={{
        display: 'flex',
        flexDirection: { xs: 'row', sm: 'row' }, // Coluna no mobile, linha no desktop
        alignItems: { xs: 'stretch', sm: 'center' },
        p: { xs: 1, sm: 2 },
        backgroundColor: '#f3f3f3',
        mb: { xs: 2, sm: 0 },
      }}
    >
      <CardMedia
        component="img"
        sx={{
          width: { xs: '100%', sm: '160px !important' }, // ajuste aqui
          height: { xs: '20px !important', sm: '160px !important' }, // ajuste aqui
          objectFit: 'cover',
          borderRadius: 2,
          mr: { xs: 0, sm: 2 },
          mb: { xs: 1, sm: 0 },
          maxWidth: { xs: '100%', sm: 160 },
          maxHeight: { xs: 100, sm: 160 },
          minWidth: { xs: 60, sm: 120 },
          minHeight: { xs: 80, sm: 120 },
        }}

        image={parseImagens(item.produto?.imagem)[0]}
        alt={item.produto?.nome}
      />
      <CardContent
        sx={{
          flex: 1,
          width: '100%',
          p: { xs: 1, sm: 2 },
          background: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          {item.produto?.nome}
        </Typography>
        <Stack direction="row" spacing={2} mb={1} flexWrap="wrap">
          <Typography variant="body2">
            <b>Cor:</b> {item.produto?.selectedCor || item.produto?.cor}
          </Typography>
          <Typography variant="body2">
            <b>Tamanho:</b> {item.produto?.selectedTamanho || item.produto?.tamanho}
          </Typography>
        </Stack>
        <Stack direction={{ xs: 'row', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
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
            sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 1, sm: 0 } }}
          />
          <IconButton
            color="error"
            onClick={() => removerDoCarrinho(item.id)}
            sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 1, sm: 0 } }}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  </Grid>
);

export default CarrinhoItemCard;