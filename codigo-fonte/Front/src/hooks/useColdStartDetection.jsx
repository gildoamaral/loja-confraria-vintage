import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useColdStartDetection = () => {
  const [isColdStart, setIsColdStart] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showRetryButton, setShowRetryButton] = useState(false);

  const MAX_ATTEMPTS = 8;
  const PING_INTERVAL = 3000; // 3 segundos

  const pingServer = useCallback(async () => {
    try {
      // Usa timeout baixo para detectar rapidamente se o servidor não está respondendo
      const response = await api.get('/', { 
        timeout: 1000,
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

      if (isConnected) {
        // Servidor conectado, esconder modal e recarregar página
        setIsColdStart(false);
        setIsConnecting(false);
        window.location.reload();
        return;
      }

      if (currentAttempt >= MAX_ATTEMPTS) {
        // Máximo de tentativas atingido
        setIsConnecting(false);
        setShowRetryButton(true);
        return;
      }

      // Continuar tentando após 3 segundos
      setTimeout(checkConnection, PING_INTERVAL);
    };

    checkConnection();
  }, [pingServer]);

  const checkInitialConnection = useCallback(async () => {
    const isConnected = await pingServer();
    
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
    maxAttempts: MAX_ATTEMPTS
  };
};

export default useColdStartDetection;
