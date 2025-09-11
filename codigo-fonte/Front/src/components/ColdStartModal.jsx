import React from 'react';
import './ColdStartModal.css';

const ColdStartModal = ({
  isVisible,
  progress,
  isConnecting,
  showRetryButton,
  isServerOnline,
  onRetry
}) => {
  if (!isVisible) return null;

  return (
    <div className="cold-start-overlay">
      <div className="cold-start-modal">
        <div className="cold-start-content">
          {/* Mensagem de sucesso quando servidor está online */}
          {isServerOnline ? (
            <>
              <div className="cold-start-icon">
                <div className="success-icon">✓</div>
              </div>
              <h2 className="cold-start-title success">
                Servidor Online!
              </h2>
              <p className="cold-start-description success">
                Você será levado para a tela inicial...
              </p>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </>
          ) : (
            <>
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

            </>
          )}

          {/* Barra de progresso */}
          {isConnecting && !isServerOnline && (
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className='cold-start-description-small'>
                Plano gratuito do Railway contém Cold Start. Isso causa um leve atraso na primeira conexão.
              </p>
            </div>
          )}

          {/* Botão de tentar novamente */}
          {showRetryButton && !isServerOnline && (
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

        </div>
      </div>
    </div>
  );
};

export default ColdStartModal;
