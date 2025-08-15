import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // <- ESSENCIAL: isso garante que cookies sejam enviados automaticamente
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Verifica se o erro é de token expirado (401 Unauthorized)
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
        window.dispatchEvent(new CustomEvent('tokenExpired', {
          detail: {
            message: 'Sua sessão expirou. Faça login novamente.',
            originalError: error
          }
        }));
        
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
