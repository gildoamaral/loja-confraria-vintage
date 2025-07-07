import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const CarrinhoItemCard = ({ item, atualizarQuantidade, removerDoCarrinho }) => {
  const imagemUrl =
    item.produto?.imagens?.[0]?.urls?.thumbnail ||
    'https://dummyimage.com/600x400/000/fc5858&text=image'; // Uma imagem placeholder

  const preco = item.produto?.precoPromocional ?? item.produto?.preco ?? 0;

  return (
    <Card sx={{ display: 'flex', mb: 2, position: 'relative', boxShadow: 'none', borderBottom: '1px solid #e0e0e0', borderRadius: 0, bgcolor: 'inherit' }}>
      <CardMedia
        component="img"
        sx={{ width: 120, height: 120, objectFit: 'cover', alignSelf: 'center', m: 1, borderRadius: 1 }}
        image={imagemUrl}
        alt={item.produto.nome}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 1 }}>
        <CardContent sx={{ flex: '1 0 auto', p: 1, pb: 0 }}>
          <Typography component="div" variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
            {item.produto.nome}
          </Typography>

          <Typography variant="body2" color="text.secondary" component="div">
            Tamanho: {item.produto.tamanho} | Cor: {item.produto.cor}
          </Typography>

          <Typography variant="subtitle1" color="text.primary" component="div" sx={{ fontWeight: 'bold', mt: 1 }}>
            R$ {preco.toFixed(2).replace('.', ',')}
          </Typography>
        </CardContent>

        {/* Controles de Quantidade */}
        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
          <IconButton
            aria-label="diminuir quantidade"
            onClick={() => atualizarQuantidade(item.id, Math.max(1, item.quantidade - 1))}
            disabled={item.quantidade <= 1}
            size="small"
          >
            <RemoveCircleOutlineIcon />
          </IconButton>
          <Typography sx={{ mx: 2 }}>{item.quantidade}</Typography>
          <IconButton
            aria-label="aumentar quantidade"
            onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
            size="small"
          >
            <AddCircleOutlineIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Botão de Remover */}
      <IconButton
        aria-label="remover do carrinho"
        onClick={() => removerDoCarrinho(item.id)}
        sx={{ position: 'absolute', top: 4, right: 4 }}
        size="small"
      >
        <DeleteForeverIcon color="error" />
      </IconButton>
    </Card>
  );
};

export default CarrinhoItemCard;