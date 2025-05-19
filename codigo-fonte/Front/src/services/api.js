import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // <- ESSENCIAL: isso garante que cookies sejam enviados automaticamente
});

export default api;
