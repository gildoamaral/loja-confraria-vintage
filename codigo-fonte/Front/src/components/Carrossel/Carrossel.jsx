import React from 'react'
import Slider from 'react-slick'
import { IconButton, useMediaQuery } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import img1 from './Gen1.png'
import img2 from './Gen2.png'
import img3 from './Gen3.png'



const Carrossel = () => {
  const isMobile = useMediaQuery('(max-width:600px)')

  const images =
    [
      <img src={img1} alt={`slide-1`} style=
        {
          {
            width: '100%',
            height: '100vh',
            objectFit: 'cover',
        objectPosition: isMobile ? 'center' : '0 5%',
          }
        }
      />,
      <img src={img2} alt={`slide-2`} style=
        {
          {
            width: '100%',
            height: '100vh',
            objectFit: 'cover',
        objectPosition: isMobile ? 'center' : '0 40%',
          }
        }
      />,
      <img src={img3} alt={`slide-3`} style=
        {
          {
            width: '100%',
            height: '100vh',
            objectFit: 'cover',
        objectPosition: isMobile ? '10% 0' : '0 40%',
          }
        }
      />
    ]

  function NextArrow(props) {
    const { onClick } = props
    return (
      <IconButton
        onClick={onClick}
        sx={{
          position: 'absolute',
          top: '50%',
          right: 16,
          zIndex: 1,
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.1)',
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.3)' }
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
    )
  }

  function PrevArrow(props) {
    const { onClick } = props
    return (
      <IconButton
        onClick={onClick}
        sx={{
          position: 'absolute',
          top: '50%',
          left: 16,
          zIndex: 1,
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.1)',
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.3)' }
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>
    )
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    pauseOnHover: true,
    arrows: true,
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Slider {...settings}>
        {images.map((img, idx) => (
          <div key={idx}>
            {img}
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default Carrossel