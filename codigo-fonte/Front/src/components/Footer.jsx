import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import useMediaQuery from '@mui/material/useMediaQuery';

const Footer = () => {
  const isTablet = useMediaQuery('(max-width:900px)');
  const isMobile = useMediaQuery('(max-width:600px)');

  // Ajuste dinâmico dos estilos
  const footerStyle = {
    ...styles.footer,
    height: isMobile ? 'auto' : isTablet ? '14rem' : '10rem',
    fontSize: isMobile ? '1rem' : isTablet ? '1.2rem' : '1.5rem',
    padding: isMobile ? '1rem 0 0 0' : '1.5rem 0 0 0',
    marginTop: isMobile ? '2rem' : isTablet ? '4rem' : '7rem',
  };

  const footerDivStyle = {
    ...styles.footerDiv,
    flexDirection: isMobile ? 'column' : 'row',
    fontSize: isMobile ? '1rem' : isTablet ? '1.2rem' : '1rem',
    gap: isMobile ? '0.5rem' : '1rem',
    height: isMobile ? 'auto' : '100%',
    textAlign: isMobile ? 'center' : 'inherit',
  };

    const footerDivStyleIcons = {
    ...styles.footerDiv,
    fontSize: isMobile ? '1rem' : isTablet ? '1.2rem' : '1rem',
    gap: isMobile ? '0.5rem' : '1rem',
    height: isMobile ? 'auto' : '100%',
    textAlign: isMobile ? 'center' : 'inherit',
  };

  return (
    <footer style={footerStyle}>

      <h4 style={{ fontSize: isMobile ? '1.1rem' : '1rem', marginBottom: isMobile ? '0.5rem' : '1rem' }}>
        Encontre-nos nas redes sociais:
      </h4>
      <div style={footerDivStyleIcons}>
        <a href="https://www.facebook.com/profile.php?id=61551843227261" target="_blank" rel="noopener noreferrer" style={{
          margin: isMobile ? '0 0.5rem' : '0 1rem',
          // color: '#f8ccb4'
        }}>
          <FontAwesomeIcon icon={faFacebook} size={isMobile ? "lg" : "2x"} />
        </a>
        <a href="https://www.instagram.com/confrariavintage/" target="_blank" rel="noopener noreferrer" style={{
          margin: isMobile ? '0 0.5rem' : '0 1rem',
          // color: '#f8ccb4'
        }}>
          <FontAwesomeIcon icon={faInstagram} size={isMobile ? "lg" : "2x"} />
        </a>
      </div>

      <div style={styles.linhaDivisoria} />


      <div style={footerDivStyle}>
        <p style={{ margin: isMobile ? '0.2rem 0' : '0 1rem' }}>Endereço: Av Paulino Mendes Lima, 214, Eunápolis 45820-440</p>
        {!isMobile && <span style={{ margin: '0 1rem' }}>|</span>}
        <p style={{ margin: isMobile ? '0.2rem 0' : '0 1rem' }}>Telefone: (73) 98107-1533</p>
        {!isMobile && <span style={{ margin: '0 1rem' }}>|</span>}
        <p style={{ margin: isMobile ? '0.2rem 0' : '0 1rem' }}>E-mail: confrariavintage@hotmail.com</p>
      </div>
      {/* <div style={styles.footerDiv3}>
        <p>Todos os direitos reservados © 2025 bla bla bla...</p>
      </div> */}

    </footer>
  )
}

const styles = {
  footer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem 0 0 0',
    width: '100%',
    height: '17rem',
    marginTop: '7rem',
    // position: 'absolute',
    bottom: '0',
    backgroundColor: 'var(--cor-secundaria)',
    // fontSize: '1rem',
    // color: '#fae0d2',

  },
  linhaDivisoria: {
    width: '86%',
    height: '1px',
    opacity: '0.2',
    backgroundColor: 'black',
    margin: '0.5rem 0',
  },
  footerDiv: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    fontFamily: 'Darker Grotesque',
    // fontSize: '1.5rem',
  },
  footerDiv3: {
    fontFamily: 'Darker Grotesque',
    // fontSize: '0.8rem',
  }
  // footerDiv3
}

export default Footer