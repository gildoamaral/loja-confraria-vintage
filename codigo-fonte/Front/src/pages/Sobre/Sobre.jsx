import React from 'react';
import { ParallaxProvider, ParallaxBanner } from 'react-scroll-parallax';
import { useInView } from 'react-intersection-observer';
import { Box, Typography, Paper, Grid } from '@mui/material';
import img1 from './img1.png';
import img2 from './img2.png';

// --- NOVO COMPONENTE PARA SEÇÕES COM FADE-IN ---
const FadeInSection = ({ title, imageUrl, imagePosition = 'left', children }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // A animação acontece apenas uma vez
    threshold: 0.2,    // A animação começa quando 20% do elemento está visível
  });

  const imageGridOrder = imagePosition === 'left' ? 1 : 2;
  const textGridOrder = imagePosition === 'left' ? 2 : 1;

  return (
    <Box
      ref={ref}
      sx={{
        p: { xs: 3, md: 6 },
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        
        // Define o estilo de transição e o estado inicial (invisível)
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
      }}
    >
      <Grid container spacing={4} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }} order={{ xs: 1, md: imageGridOrder }}>
          <Box
            component="img"
            src={imageUrl}
            alt={title}
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: 3,
              mb: {sx: 10, sm: 4},
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} order={{ xs: 2, md: textGridOrder }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontFamily: 'Special Elite, Courier, monospace' }}>
            {title}
          </Typography>
          <Typography variant="body1" align="justify" sx={{ fontFamily: 'Special Elite, Courier, monospace' }}>
            {children}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};


// --- COMPONENTE PRINCIPAL DA PÁGINA ---
const SobreNos = () => {
  return (
    <ParallaxProvider>
      <Box bgcolor={'var(--secondary-color-theme)'}>
        {/* SEÇÃO 1: PARALLAX (Como antes) */}
        <ParallaxBanner
          layers={[{ image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1945&auto=format&fit=crop', speed: -20 }]}
          style={{ height: '90vh' }}
        >
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          }}>
            <Paper elevation={4} sx={{ p: 4, backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white' }}>
              <Typography variant="h2" component="h1" gutterBottom align="center">
                Nossa História
              </Typography>
              <Typography variant="h6" align="center" sx={{ fontWeight: 300 }}>
                A jornada que nos trouxe até aqui.
              </Typography>
            </Paper>
          </Box>
        </ParallaxBanner>

        {/* SEÇÃO 2: FADE-IN (Imagem à esquerda) */}
        <FadeInSection
          title="Nossa Identidade"
          imageUrl={img1}
          imagePosition="left"
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.
        </FadeInSection>
        
        {/* SEÇÃO 3: FADE-IN (Imagem à direita) */}
        <FadeInSection
          title="Nossos Valores"
          imageUrl={img2}
          imagePosition="right"
        >
          Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales.
        </FadeInSection>
      </Box>
    </ParallaxProvider>
  );
};

export default SobreNos;