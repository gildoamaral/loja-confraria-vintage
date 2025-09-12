import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useColdStartDetection = () => {
  const [isColdStart, setIsColdStart] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [isServerOnline, setIsServerOnline] = useState(false);

  const MAX_ATTEMPTS = 8;
  const PING_INTERVAL = 5000; // 5 segundos

  const pingServer = useCallback(async (timeoutMs = 3000) => {
    try {
      // Usa timeout baixo para detectar rapidamente se o servidor não está respondendo
      const response = await api.get('/', { 
        timeout: timeoutMs,
        // Não intercepta erros para este ping específico
        transformResponse: [(data) => data]
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }, []);

  const startColdStartDetection = useCallback(async () => {
    setIsConnecting(true);
    setAttempts(0);
    setProgress(0);
    setShowRetryButton(false);

    let currentAttempt = 0;

    const checkConnection = async () => {
      currentAttempt++;
      setAttempts(currentAttempt);
      setProgress((currentAttempt / MAX_ATTEMPTS) * 100);

      const isConnected = await pingServer();
      console.log(`Tentativa ${currentAttempt}: Servidor ${isConnected ? 'online' : 'offline'}`);

      if (isConnected) {
        // Servidor conectado, aguardar 5 segundos antes de mostrar mensagem de sucesso
        setTimeout(() => {
          setIsConnecting(false);
          setIsServerOnline(true);
          
          // Aguardar mais 5 segundos e recarregar a página (total: 10 segundos)
          setTimeout(() => {
            setIsColdStart(false);
            window.location.reload();
          }, 5000);
        }, 5000);
        return;
      }

      if (currentAttempt >= MAX_ATTEMPTS) {
        // Máximo de tentativas atingido
        setIsConnecting(false);
        setShowRetryButton(true);
        return;
      }

      // Continuar tentando após 5 segundos
      setTimeout(checkConnection, PING_INTERVAL);
    };

    checkConnection();
  }, [pingServer]);

  const checkInitialConnection = useCallback(async () => {
    const isConnected = await pingServer(1000);
    
    if (!isConnected) {
      // Servidor não está respondendo, iniciar detecção de cold start
      setIsColdStart(true);
      startColdStartDetection();
    }
  }, [pingServer, startColdStartDetection]);

  const retryConnection = useCallback(() => {
    setShowRetryButton(false);
    startColdStartDetection();
  }, [startColdStartDetection]);

  useEffect(() => {
    // Verificar conexão inicial apenas uma vez quando o componente monta
    checkInitialConnection();
  }, [checkInitialConnection]);

  return {
    isColdStart,
    isConnecting,
    attempts,
    progress,
    showRetryButton,
    retryConnection,
    isServerOnline,
    maxAttempts: MAX_ATTEMPTS
  };
};

export default useColdStartDetection;
