import React, { useState, useEffect, useCallback } from 'react';
import AuthContext from './context';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Função para verificar o token no cookie ao carregar a aplicação
  const checkAuthStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/api/auth/status');
      setUsuario(data);
    } catch {
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Função de Login
  const login = async (email, senha, redirectTo = '/') => {
    try {
      // A chamada à API agora retorna os dados do usuário
      const response = await api.post('/login', { email, senha });

      if (response.status == 200) {
        console.log('Login bem-sucedido:', response.data);
        alert('Login realizado com sucesso!');
      }
      
      // Atualiza o estado global com os dados do usuário recebidos da API
      setUsuario(response.data.usuario);
      navigate(redirectTo, { replace: true });
      
    } catch (error) {
      throw error.response?.data || new Error('Erro ao fazer login');
    }
  };

  // Função de Logout
  const logout = async () => {
    try {
      await api.post('/usuarios/logout');
      setUsuario(null);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const value = {
    usuario,
    isAuthenticated: !!usuario,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
