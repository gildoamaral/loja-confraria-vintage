import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardActionArea, CardMedia, CardContent, Typography, Box } from '@mui/material';

const ProdutoCard = ({ produto }) => {
  // Acessa a imagem de forma segura, usando a versão 'medium' para o card
  const imagemPrincipalUrl = produto.imagens?.[0]?.urls?.medium 
    || 'https://via.placeholder.com/400?text=Sem+Imagem';
  
  // Define o preço a ser exibido, priorizando o promocional
  const precoFinal = produto.precoPromocional ?? produto.preco;
  const temPromocao = produto.precoPromocional != null;

  return (
    <Card 
      sx={{ 
        height: 350, 
        width: 250,
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: 6,
        }
      }}
    >
      <CardActionArea component={Link} to={`/produto/${produto.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
        <CardMedia
          component="img"
          sx={{
            aspectRatio: '4/5', // Proporção da imagem para manter a consistência
            objectFit: 'cover',
            height: 270,
          }}
          image={imagemPrincipalUrl}
          alt={produto.nome}
        />
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h6" component="h3" sx={{ fontSize: '1rem', fontWeight: '600' }}>
            {produto.nome}
          </Typography>
          <Box>
            {temPromocao && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ textDecoration: 'line-through', display: 'inline', mr: 1 }}
              >
                R$ {produto.preco.toFixed(2).replace('.', ',')}
              </Typography>
            )}
            <Typography variant="h6" color="primary" sx={{ display: 'inline', fontWeight: '700' }}>
              R$ {precoFinal.toFixed(2).replace('.', ',')}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProdutoCard;