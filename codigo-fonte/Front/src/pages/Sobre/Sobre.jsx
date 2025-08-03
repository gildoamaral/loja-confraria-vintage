import React, { useState, useEffect } from 'react';
import { ParallaxProvider, ParallaxBanner } from 'react-scroll-parallax';
import { useInView } from 'react-intersection-observer';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import api from '../../services/api';

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
        maxWidth: '100%',
        overflow: 'hidden',
        // Define o estilo de transição e o estado inicial (invisível)
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
      }}
    >
      <Grid container spacing={4} alignItems="center" sx={{ maxWidth: '100%', margin: 0 }}>
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
        <Grid size={{ xs: 12, md: 6 }} order={{ xs: 2, md: textGridOrder }} >
          <Box sx={{ 
            maxWidth: '100%',
            overflow: 'hidden',
            wordBreak: 'break-word',
            pr: { xs: 0, md: 2 } // padding right para desktop
          }}>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontFamily: 'Special Elite, Courier, monospace',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto'
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="body1" 
              align="justify" 
              sx={{ 
                fontFamily: 'Special Elite, Courier, monospace',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                lineHeight: 1.6
              }}
            >
              {children}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};


// --- COMPONENTE PRINCIPAL DA PÁGINA ---
const SobreNos = () => {
  const [secoes, setSecoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buscar dados das seções da API
  useEffect(() => {
    const fetchSecoes = async () => {
      try {
        const response = await api.get('/api/sobre');
        setSecoes(response.data);
      } catch (error) {
        console.error('Erro ao buscar seções:', error);
        // Em caso de erro, usar dados padrão
        setSecoes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSecoes();
  }, []);

  // Função para obter dados da seção ou usar fallback
  const getSecaoData = (secaoKey, fallbackTitle, fallbackText, fallbackImage) => {
    const secao = secoes.find(s => s.secao === secaoKey);
    return {
      titulo: secao?.titulo || fallbackTitle,
      texto: secao?.texto || fallbackText,
      imagem: secao?.urlsImagem?.large || fallbackImage
    };
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: 'var(--secondary-color-theme)'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Obter dados das seções
  const identidadeData = getSecaoData(
    'identidade',
    'Nossa Identidade',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.',
    'https://picsum.photos/700/800'
  );

  const valoresData = getSecaoData(
    'valores',
    'Nossos Valores',
    'Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales.',
    'https://picsum.photos/700/800'
  );

  return (
    <ParallaxProvider>
      <Box bgcolor={'var(--secondary-color-theme)'}>
        {/* SEÇÃO 1: PARALLAX (Como antes) */}
        <ParallaxBanner
          layers={[{ image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1945&auto=format&fit=crop', speed: -20 }]}
          style={{ height: '90vh', marginBottom: '50px' }}
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
          title={identidadeData.titulo}
          imageUrl={identidadeData.imagem}
          imagePosition="left"
        >
          {identidadeData.texto}
        </FadeInSection>
        
        {/* SEÇÃO 3: FADE-IN (Imagem à direita) */}
        <FadeInSection
          title={valoresData.titulo}
          imageUrl={valoresData.imagem}
          imagePosition="right"
        >
          {valoresData.texto}
        </FadeInSection>
      </Box>
    </ParallaxProvider>
  );
};

export default SobreNos;