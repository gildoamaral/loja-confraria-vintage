import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/'; // Verifique se o caminho está correto
import { CircularProgress, Box } from '@mui/material';

const AdminLayout = () => {
  // CORREÇÃO: Usando 'loading' em vez de 'loadingAuth' para sincronizar com seu context
  const { usuario, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Se o usuário não estiver logado ou não for um admin, redirecione para a home
  if (!usuario || usuario.posicao !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // Se for admin, renderiza o conteúdo da rota
};

export default AdminLayout;