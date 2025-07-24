import React, { useEffect, useState } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { getProdutosDestaque } from '../../../services/ProdutosDestaque';
import ProdutoCard from './ProdutoCard'; // 1. Importe o seu componente

// Importe os componentes e os módulos necessários do Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
// import { Pagination } from 'swiper/modules';

// Importe os estilos do Swiper
import 'swiper/css';
// import 'swiper/css/pagination';
import './ProdutosDestaque.css'; // 2. Vamos adicionar um arquivo CSS para o toque final

const ProdutosDestaque = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestaques = async () => {
      try {
        const data = await getProdutosDestaque();
        setProdutos(data);
      } catch (error) {
        console.error("Erro ao carregar produtos em destaque:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDestaques();
  }, []);

  if (!loading && produtos.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: { xs: 3, md: 5 }, my: 11 }}>
      <Typography variant="h4" component="h2" align="center" gutterBottom>
        Produtos em Destaque
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, px: 2 }}>
            {[...Array(4)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" width={280} height={400} />
            ))}
        </Box>
      ) : (
        <Swiper
          loop={false}
          centeredSlides={true}
          slidesPerView={'auto'}
          spaceBetween={16}
          centerInsufficientSlides={true}
          breakpoints={{
            // A partir de telas médias (md), usamos um número fixo de slides
            900: {
              slidesPerView: 3,
              centeredSlides: false, // Descentraliza para um look de grade
            },
            1200: {
              slidesPerView: 4,
              centeredSlides: false,
            }
          }}
          className="produtos-destaque-swiper" // Classe para estilização customizada
        >
          {produtos.map((produto) => (
            <SwiperSlide key={produto.id} className="produtos-destaque-slide">
              {/* 3. Utilize o seu componente ProdutoCard aqui */}
              <ProdutoCard produto={produto} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </Box>
  );
};

export default ProdutosDestaque;