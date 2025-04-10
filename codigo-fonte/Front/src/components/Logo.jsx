import React from 'react';
import logo from '../assets/logo-sem-fundo.png';

const Logo = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '6rem',
        width: '25rem',
        // backgroundColor: 'green',
        overflow: 'hidden'
      }}
    >
      <img
        src={logo}
        alt="logo"
        style={{
          width: '20rem',
          height: '100%',
          objectFit: 'cover',
          filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.9)) contrast(1.2)'
        }}
      />
    </div>
  );
};

export default Logo;