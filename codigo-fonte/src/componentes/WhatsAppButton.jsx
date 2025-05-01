import React from 'react';
import { FaWhatsapp } from 'react-icons/fa'; // Ícone do WhatsApp

const WhatsAppButton = () => {
  const phoneNumber = '5573981071533'; // Substitua pelo número real
  const message = 'Olá!Gostaria de saber mais.';
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappURL}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.floatingButton}
    >
      <FaWhatsapp size={28} style={{ marginRight: 8 }} />
      Fale conosco
    </a>
  );
};

const styles = {
  floatingButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#25D366',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '30px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    fontWeight: 'bold',
  },
};

export default WhatsAppButton;
