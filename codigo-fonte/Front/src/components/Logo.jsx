import React, { useState } from 'react';
import logo from '../assets/logo-sem-fundo.png';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';

const Logo = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: isMobile ? '10rem' : '8rem',
        width: isMobile ? '23rem' : '32rem',
        overflow: 'hidden',
        marginBottom: isMobile ? '2rem' : '1em',
        marginTop: isMobile ? '2rem' : '2em',
      }}
    >
      <img
        src={logo}
        alt="logo"
        style={{
          width: isMobile ? '30rem' : '28rem',
          height: '100%',
          objectFit: 'cover',
          filter: hover
            ? 'drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.9)) contrast(1.2)'
            : 'none',
          transition: 'filter 0.3s ease-in-out',
          cursor: 'pointer'
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => navigate('/')}
      />
    </div>
  );
};

export default Logo;