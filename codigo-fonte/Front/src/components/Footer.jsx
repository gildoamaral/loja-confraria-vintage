import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer style={styles.footer}>

      <h5>Encontre-nos nas redes sociais:</h5>
      <div style={styles.footerDiv}>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ margin: '0 0.5rem', color: '#4B2626' }}>
          <FontAwesomeIcon icon={faFacebook} size="2x" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ margin: '0 0.5rem', color: '#4B2626' }}>
          <FontAwesomeIcon icon={faInstagram} size="2x" />
        </a>
      </div>

      <div style={styles.linhaDivisoria} />


      <div style={styles.footerDiv}>
        <p>Endereço: Rua Exemplo, 123 - Cidade Exemplo, EX</p>
        <span style={{ margin: '0 1rem' }}>|</span>
        <p>Telefone: (11) 98765-4321</p>
      </div>
      <div style={styles.footerDiv3}>
        <p>Todos os direitos reservados © 2025 bla bla bla...</p>
      </div>

    </footer>
  )
}

const styles = {
  footer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem 0',
    width: '100%',
    height: '8.2rem',
    position: 'absolute',
    bottom: '0',
    backgroundColor: 'var(--cor-secundaria)',
  },
  linhaDivisoria: {
    width: '86%',
    height: '1px',
    opacity: '0.17',
    backgroundColor: '#4B2626',
    // margin: '0.5rem 0',
  },
  footerDiv: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: '#4B2626',
    fontFamily: 'Darker Grotesque',
    fontSize: '0.8rem',
  },
  footerDiv3: {
    position: 'absolute',
    bottom: '0rem',
    fontFamily: 'Darker Grotesque',
    fontSize: '0.8rem',
  }
}

export default Footer