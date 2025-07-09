import React from 'react';
import { Box, Container, Grid, Typography, IconButton, Link, Divider, Chip } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

const NewFooter = () => {
  const footerStyles = {
    textColor: '#5C3A21',
    linkColor: '#7C5A41',
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'var(--primary-color-theme, #FDF7F2)',
        color: footerStyles.textColor,
        py: { xs: 4, sm: 6 },
        borderTop: '1px solid #EAE0D5'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5} justifyContent="space-between">

          {/* COLUNA 1: A MARCA E REDES SOCIAIS */}
          <Grid>
            <Typography variant="h5" gutterBottom sx={{ fontFamily: '"Cinzel", serif', fontWeight: 'bold' }}>
              CONFRARIA VINTAGE
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Moda com alma e história. Peças selecionadas que transcendem o tempo.
            </Typography>
            <Box>
              <IconButton href="https://www.instagram.com/confrariavintage/" target="_blank" sx={{ color: footerStyles.textColor }}>
                <InstagramIcon />
              </IconButton>
              <IconButton href="https://www.facebook.com/profile.php?id=61551843227261" target="_blank" sx={{ color: footerStyles.textColor }}>
                <FacebookIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* COLUNA 2: NAVEGAÇÃO E LINKS LEGAIS */}
{/*           
          <Grid item xs={6} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Cinzel", serif', fontWeight: 'bold' }}>
              Institucional
            </Typography>
            <Link href="/sobre" display="block" color={footerStyles.linkColor} underline="hover" sx={{ mb: 1 }}>Sobre Nós</Link>
            <Link href="/politica-de-privacidade" display="block" color={footerStyles.linkColor} underline="hover" sx={{ mb: 1 }}>Política de Privacidade</Link>
            <Link href="/termos-e-uso" display="block" color={footerStyles.linkColor} underline="hover" sx={{ mb: 1 }}>Termos e Uso</Link>
          </Grid> */}

          {/* COLUNA 3: CONTATO E ENDEREÇO */}
          <Grid>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Cinzel", serif', fontWeight: 'bold' }}>
              Contato
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PlaceOutlinedIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
              <Typography variant="body2">Rua das Flores, 123 - Centro, Rio de Janeiro - RJ</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneOutlinedIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
              <Typography variant="body2">(21) 99999-8888</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailOutlinedIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
              <Typography variant="body2">contato@confrariavintage.com</Typography>
            </Box>
          </Grid>

        </Grid>

        <Divider sx={{ my: 4, borderColor: '#EAE0D5' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            © {new Date().getFullYear()} Confraria Vintage. Todos os direitos reservados.
          </Typography>
          <Chip label="Versão Beta" variant="outlined" size="small" />
        </Box>

      </Container>
    </Box>
  );
};

export default NewFooter;