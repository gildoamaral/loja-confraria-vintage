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
      <CardContent sx={{p:0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <CardMedia
          component="img"
          sx={{
            width: { xs: '100%', sm: '160px !important' }, // ajuste aqui
            height: { xs: '100% !important', sm: '160px !important' }, // ajuste aqui
            objectFit: 'cover',
            borderRadius: 2,
            mr: { xs: 0, sm: 2 },
            mb: { xs: 1, sm: 0 },
            maxWidth: { xs: 70, sm: 160 },
            maxHeight: { xs: 100, sm: 160 },
            minWidth: { xs: 60, sm: 120 },
            minHeight: { xs: 80, sm: 120 },
          }}

          image={parseImagens(item.produto?.imagem)[0]}
          alt={item.produto?.nome}
        />
      </CardContent>
      <CardContent
        sx={{
          flex: 1,
          width: '100%',
          p: { xs: 1, sm: 2 },
          background: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: { xs: 'center', sm: 'flex-start' },
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, lineHeight: 1, fontSize: { xs: '1rem', sm: '1.25rem' }, textAlign: 'center' }}>
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
        <Stack direction={{ xs: 'row', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <div fontWeight={500} style={{ lineHeight: 10 }}>
            {item.produto?.precoPromocional ? (
              <>
                <Typography>R$</Typography>
                <Typography style={{ marginTop: "0rem", fontSize: "0.85em", textDecoration: 'line-through', color: '#888', marginRight: 8 }}>
                  {(item.produto?.preco ?? 0).toFixed(2)}
                </Typography>
                <Typography style={{ marginTop: "0rem", color: '#d32f2f' }}>
                  {(item.produto?.precoPromocional ?? 0).toFixed(2)}
                </Typography>
              </>
            ) : (
              <>
                <Typography>R$</Typography>
                <Typography style={{ margin: 0, padding: 0 }}>
                  {(item.produto?.preco ?? 0).toFixed(2)}
                </Typography>
              </>
            )}
          </div>
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