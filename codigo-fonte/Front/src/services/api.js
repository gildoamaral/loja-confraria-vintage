import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // <- ESSENCIAL: isso garante que cookies sejam enviados automaticamente
});

// Interceptor de resposta para tratar expiração de token
api.interceptors.response.use(
  (response) => {
    // Se a resposta é bem-sucedida, apenas retorna
    console.log("Resposta da API:", response);
    return response;
  },
  (error) => {
    // Verifica se o erro é de token expirado (401 Unauthorized)
    console.error("Erro da API:", error);
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message;
      
      // Verifica se é especificamente erro de token expirado
      const isTokenExpired = (
        errorMessage?.toLowerCase().includes('expired') ||
        errorMessage?.toLowerCase().includes('invalid') ||
        errorMessage?.toLowerCase().includes('inválido') ||
        errorMessage?.toLowerCase().includes('negado') || 
        errorMessage?.toLowerCase().includes('expirado')
      );

         console.log(isTokenExpired, errorMessage);

      if (isTokenExpired) {
        // Dispara evento customizado para notificar sobre token expirado
        window.dispatchEvent(new CustomEvent('tokenExpired', {
          detail: {
            message: 'Sua sessão expirou. Faça login novamente.',
            originalError: error
          }
        }));
        
        // Limpa qualquer estado de autenticação local se existir
        // (isso será capturado pelo AuthProvider)
        window.dispatchEvent(new CustomEvent('forceLogout'));
        
        return Promise.reject({
          ...error,
          tokenExpired: true,
          message: 'Sessão expirada'
        });
      }
    }
    
    // Para outros erros, apenas rejeita normalmente
    return Promise.reject(error);
  }
);

export default api;
