import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Defina aqui os dados das suas categorias
const categorias = [
  {
    nome: 'Roupas',
    // Imagem de exemplo - substitua pela sua
    imageUrl: 'https://images.unsplash.com/photo-1598554747476-c947c4731733?q=80&w=1964&auto=format&fit=crop',
    link: '/colecao/roupas',
  },
  {
    nome: 'Bolsas',
    // Imagem de exemplo - substitua pela sua
    imageUrl: 'https://images.unsplash.com/photo-1590737223933-292e38a3a115?q=80&w=1974&auto=format&fit=crop',
    link: '/colecao/bolsas',
  },
  {
    nome: 'Joias',
    // Imagem de exemplo - substitua pela sua
    imageUrl: 'https://images.unsplash.com/photo-1611652033952-de375b47b4a2?q=80&w=1974&auto=format&fit=crop',
    link: '/colecao/joias',
  },
];

const CategoriasDestaque = () => {
  return (
    <Box sx={{ py: { xs: 4, md: 4 }, px: 5, textAlign: 'center'}}>
      <Typography variant="h4" component="h2" gutterBottom>
        Compre por Categoria
      </Typography>
      <Grid container spacing={4} justifyContent="center" sx={{ mt: 3 }}>
        {categorias.map((categoria) => (
          <Grid key={categoria.nome} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper
              component={RouterLink}
              to={categoria.link}
              elevation={3}
              sx={{
                borderRadius: '50%', // A chave para o formato circular
                overflow: 'hidden',
                width: { xs: 250, sm: 280 },
                height: { xs: 250, sm: 280 },
                mx: 'auto', // Centraliza o círculo dentro da coluna do grid
                position: 'relative',
                display: 'block',
                textDecoration: 'none',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 8,
                },
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${categoria.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // Overlay escuro para dar contraste ao texto
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    transition: 'background-color 0.3s ease',
                  },
                  '&:hover:after': {
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    position: 'relative',
                    color: 'white',
                    fontWeight: 'bold',
                    zIndex: 1, // Garante que o texto fique acima do overlay
                  }}
                >
                  {categoria.nome}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoriasDestaque;