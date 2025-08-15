import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa'; // Ícone do WhatsApp

const WhatsAppButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  const phoneNumber = '5573981071533'; // Substitua pelo número real
  const message = 'Olá! Gostaria de saber mais sobre os produtos da loja.';
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappURL}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button"
      style={{
        ...styles.floatingButton,
        ...(isHovered ? styles.floatingButtonHover : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <FaWhatsapp 
        size={30} 
        className="whatsapp-icon"
        style={{
          marginRight: 8,
          filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))',
        }} 
      />
      <span className="whatsapp-text" style={styles.buttonText}>Fale conosco</span>
      
      {/* CSS Animation */}
      <style>{`

        
        @keyframes slideIn {
          from { 
            transform: translateX(100%);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .whatsapp-button {
            padding: 12px !important;
            font-size: 14px !important;
            bottom: 20px !important;
            right: 20px !important;
            border-radius: 50% !important;
            width: 56px !important;
            height: 56px !important;
            min-width: 56px !important;
            max-width: 56px !important;
          }
          
          .whatsapp-text {
            display: none !important;
          }
          
          .whatsapp-icon {
            margin-right: 0 !important;
          }
        }
      `}</style>
    </a>
  );
};

const styles = {
  floatingButton: {
    position: 'fixed',
    bottom: '25px',
    right: '25px',
    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    color: 'white',
    padding: '11px 18px',
    borderRadius: '50px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 25px rgba(37, 211, 102, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    fontWeight: '600',
    fontSize: '16px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    animation: 'slideIn 0.5s ease-out',
    maxWidth: '200px',
    minWidth: '60px',
  },
  
  floatingButtonHover: {
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: '0 12px 35px rgba(37, 211, 102, 0.6), 0 8px 20px rgba(0, 0, 0, 0.2)',
    background: 'linear-gradient(135deg, #2BE477 0%, #14A085 100%)',
  },
  
  buttonText: {
    fontWeight: '600',
    letterSpacing: '0.5px',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    whiteSpace: 'nowrap',
  },
};

export default WhatsAppButton;
