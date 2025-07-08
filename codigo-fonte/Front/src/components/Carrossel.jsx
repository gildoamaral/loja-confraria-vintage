import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 1. Importa os componentes e estilos do Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import { Box, CircularProgress, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import api from '../services/api';

// 2. Estilos para as setas de navegação (customizadas)
const arrowStyles = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 10,
  color: 'white',
  backgroundColor: 'rgba(0,0,0,0.2)',
  '&:hover': { backgroundColor: 'rgba(0,0,0,0.4)' },
};

const Carrossel = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. Busca as imagens da API
  useEffect(() => {
    const fetchCarrosselImagens = async () => {
      try {
        const response = await api.get('/api/carrossel');
        setSlides(response.data);
      } catch (error) {
        console.error("Erro ao buscar imagens do carrossel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarrosselImagens();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (slides.length === 0) {
    return null; // Não renderiza nada se não houver imagens
  }

  return (
    <Box sx={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <Swiper
        // 4. Instala os módulos que vamos usar
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        effect="fade"
        pagination={{ clickable: true }}
        // 5. Conecta nossas setas customizadas
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        style={{ height: '100%' }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            {slide.link ? (
              <Link to={slide.link}>
                <img
                  src={slide.urls.large}
                  alt={`Slide ${slide.posicao + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Link>
            ) : (
              <img
                src={slide.urls.large}
                alt={`Slide ${slide.posicao + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 6. Nossos botões customizados que o Swiper vai controlar */}
      <IconButton className="swiper-button-prev-custom" sx={{ ...arrowStyles, left: 16 }}>
        <ArrowBackIosNewIcon />
      </IconButton>
      <IconButton className="swiper-button-next-custom" sx={{ ...arrowStyles, right: 16 }}>
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
};

export default Carrossel;