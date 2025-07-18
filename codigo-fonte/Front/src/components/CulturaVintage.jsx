import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import culturaVintageImage from '../assets/cultura-vintage-bg.png'; // Importe a imagem de fundo

const CulturaVintage = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '1000px', md: '600px' },
        backgroundImage: `url(${culturaVintageImage})`, // Substitua pela URL da sua imagem
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', // Overlay escuro para melhor legibilidade
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: { xs: 'center', md: 'flex-start' },
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 4 },
              maxWidth: { xs: '100%', md: '600px' },
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: 'var(--cor-secundaria)',
                fontSize: { xs: '2rem', md: '2.5rem' },
                lineHeight: 1.2,
              }}
            >
              Nossa Cultura Vintage
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 3,
                color: '#2c3e50',
                fontWeight: 500,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
              }}
            >
              Onde a elegância encontra o estilo contemporâneo
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#5a6c7d',
                lineHeight: 1.7,
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                mb: 2,
              }}
            >
              Na <strong>Confraria Vintage</strong>, celebramos a beleza atemporal da moda clássica. 
              Cada peça é cuidadosamente selecionada para mulheres que valorizam a sofisticação, 
              a qualidade e o charme único que apenas o estilo vintage pode oferecer.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#5a6c7d',
                lineHeight: 1.7,
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                mb: 2,
              }}
            >
              Nossos produtos combinam a elegância com o conforto e 
              praticidade que a mulher moderna necessita. Desde vestidos delicados para 
              ocasiões especiais até peças casuais com toque retrô, nossa coleção é pensada 
              para mulheres que sabem que o estilo verdadeiro nunca sai de moda.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'var(--cor-secundaria)',
                lineHeight: 1.7,
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                fontWeight: 600,
                fontStyle: 'italic',
              }}
            >
              "Porque a verdadeira elegância é eterna, e você merece se sentir especial 
              em cada momento."
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default CulturaVintage;
