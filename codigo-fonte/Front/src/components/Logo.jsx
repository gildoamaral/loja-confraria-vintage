import React, { useState } from 'react';
import logo from '../assets/logo-sem-fundo.png';
import { Box, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Logo = () => {
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      overflow="hidden"
      py='1rem'
    >

        <Avatar
          src={logo}
          alt="Logo Confraria Vintage"
          variant="square"
          sx={{
            width: '20rem',
            height: '10rem',
            objectFit: 'contain',
            filter: hover
              ? 'drop-shadow(2px 2px 6px rgba(0, 0, 0, 0.6)) contrast(1.1)'
              : 'none',
            transition: 'filter 0.3s ease-in-out',
            cursor: 'pointer',
            bgcolor: 'transparent',
            maxWidth: '100%',
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => navigate('/')}
        />
    </Box>
  );
};

export default Logo;