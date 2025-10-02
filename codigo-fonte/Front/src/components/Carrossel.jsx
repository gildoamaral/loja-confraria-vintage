import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

// Estilos CSS customizados para mobile
const mobileCarouselStyles = `
  .mobile-carousel .swiper-pagination {
    bottom: 20px;
  }
  
  .mobile-carousel .swiper-pagination-bullet {
    width: 8px;
    height: 8px;
    background: rgba(255, 255, 255, 0.5);
    margin: 0 4px;
  }
  
  .mobile-carousel .swiper-pagination-bullet-active {
    background: white;
    width: 20px;
    border-radius: 4px;
  }
  
  @media (max-width: 640px) {
    .mobile-carousel .swiper-pagination {
      bottom: 15px;
    }
    
    .mobile-carousel .swiper-pagination-bullet {
      width: 6px;
      height: 6px;
      margin: 0 3px;
    }
    
    .mobile-carousel .swiper-pagination-bullet-active {
      width: 16px;
    }
  }
`;

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

  // Adiciona os estilos CSS customizados ao DOM
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = mobileCarouselStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Forçar autoplay no mobile após carregar as imagens
  useEffect(() => {
    if (!loading && slides.length > 0) {
      // Pequeno delay para garantir que o Swiper foi inicializado
      const timer = setTimeout(() => {
        const swiperElement = document.querySelector('.mobile-carousel .swiper');
        if (swiperElement && swiperElement.swiper) {
          swiperElement.swiper.autoplay.start();
          console.log('Autoplay forçado a iniciar no mobile');
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [loading, slides]);

    useEffect(() => {
      const originalOverflowX = document.body.style.overflowX
      
      document.body.style.overflowX = 'hidden'
      
      return () => {
        document.body.style.overflowX = originalOverflowX
      }
    }, [])

  useEffect(() => {
    const fetchCarrosselImagens = async () => {
      try {
        const response = await api.get('/api/carrossel');
        // Adição crucial aqui:
        if (Array.isArray(response.data)) {
          setSlides(response.data);
        } else {
          console.error("Dados da API não são um array:", response.data);
          setSlides([]); // Garante que slides seja sempre um array, mesmo que vazio
        }
      } catch (error) {
        console.error("Erro ao buscar imagens do carrossel:", error);
        setSlides([]); // Em caso de erro, garante que slides seja um array vazio
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
    <Box sx={{ 
      height: { xs: '30vh', sm: '70vh', md: '100vh' }, // Altura responsiva
      width: '100vw', 
      position: 'relative'
    }}>
      <Swiper
        // 4. Instala os módulos que vamos usar
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 3000, // Configuração padrão para todos os dispositivos
          disableOnInteraction: false, // Mantém autoplay mesmo após interação
          pauseOnMouseEnter: false, // Não pausa no hover (melhor para mobile)
        }}
        effect="fade"
        pagination={{ 
          clickable: true,
          dynamicBullets: true, // Melhor para mobile
        }}
        // 5. Conecta nossas setas customizadas
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        // Configurações específicas para mobile
        breakpoints={{
          // Mobile (até 640px)
          320: {
            autoplay: {
              delay: 3000,
              disableOnInteraction: false, // CORRIGIDO: mantém autoplay no mobile
              pauseOnMouseEnter: false,
            },
            pagination: {
              clickable: true,
              dynamicBullets: true,
            },
            allowTouchMove: true, // Permite swipe no mobile
          },
          // Tablet (641px até 1024px)
          641: {
            autoplay: {
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true, // Pode pausar no hover em tablets
            },
            allowTouchMove: true,
          },
          // Desktop (1025px+)
          1025: {
            autoplay: {
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            },
            allowTouchMove: false, // Desabilita swipe no desktop
          },
        }}
        style={{ height: '100%' }}
        className="mobile-carousel"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            {slide.link ? (
              <Link to={slide.link}>
                <img
                  src={slide.urls.large}
                  alt={`Slide ${slide.posicao + 1}`}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    // Melhora a qualidade da imagem no mobile
                    imageRendering: 'crisp-edges'
                  }}
                />
              </Link>
            ) : (
              <img
                src={slide.urls.large}
                alt={`Slide ${slide.posicao + 1}`}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  imageRendering: 'crisp-edges'
                }}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 6. Nossos botões customizados que o Swiper vai controlar */}
      {/* Botões ocultos no mobile para melhor experiência com swipe */}
      <IconButton 
        className="swiper-button-prev-custom" 
        sx={{ 
          ...arrowStyles, 
          left: 16,
          display: { xs: 'none', sm: 'flex' } // Oculto no mobile
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>
      <IconButton 
        className="swiper-button-next-custom" 
        sx={{ 
          ...arrowStyles, 
          right: { sm: 26, md: 16 },
          display: { xs: 'none', sm: 'flex' } // Oculto no mobile
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
};

export default Carrossel;