import React from 'react';
import { Box, Container, Typography, Paper, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LockIcon from '@mui/icons-material/Lock';

// Itens do menu de navegação
const menuItems = [
  { text: 'Painel', path: '/minha-conta', icon: <DashboardIcon /> },
  { text: 'Meus Pedidos', path: '/minha-conta/pedidos', icon: <ShoppingBagIcon /> },
  { text: 'Configurações', path: '/minha-conta/configuracoes', icon: <SettingsIcon /> },
  { text: 'Segurança', path: '/minha-conta/seguranca', icon: <LockIcon /> },
];

const MinhaContaLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Container sx={{ display: 'flex', mt: 4, mb: 4, gap: 3 }}>
      {/* Menu Lateral */}
      <Paper elevation={3} sx={{ width: 240, flexShrink: 0 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Área de Conteúdo */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet /> {/* Aqui é onde o Dashboard, Pedidos, etc. serão renderizados */}
      </Box>
    </Container>
  );
};

export default MinhaContaLayout;