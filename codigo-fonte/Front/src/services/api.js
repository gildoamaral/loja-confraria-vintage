import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // <- ESSENCIAL: isso garante que cookies sejam enviados automaticamente
});

export default api;
