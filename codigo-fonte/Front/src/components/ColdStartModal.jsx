import React from 'react';
import './ColdStartModal.css';

const ColdStartModal = ({ 
  isVisible, 
  progress, 
  isConnecting, 
  showRetryButton, 
  onRetry 
}) => {
  if (!isVisible) return null;

  return (
    <div className="cold-start-overlay">
      <div className="cold-start-modal">
        <div className="cold-start-content">
          {/* Logo ou ícone */}
          <div className="cold-start-icon">
            <div className="loading-spinner"></div>
          </div>

          {/* Título */}
          <h2 className="cold-start-title">
            Inicializando Servidor
          </h2>

          {/* Descrição */}
          <p className="cold-start-description">
            O servidor está iniciando. Isso pode levar alguns segundos...
          </p>

          {/* Barra de progresso */}
          {isConnecting && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Botão de tentar novamente */}
          {showRetryButton && (
            <div className="retry-container">
              <p className="retry-message">
                Não foi possível conectar com o servidor.
              </p>
              <button 
                className="retry-button" 
                onClick={onRetry}
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Loading dots para quando está conectando */}
          {isConnecting && (
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColdStartModal;
