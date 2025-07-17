import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Typography
} from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LockIcon from '@mui/icons-material/Lock';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const menuContent = (
    <List sx={{ width: 240 }}>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            selected={location.pathname === item.path}
            onClick={() => handleMenuClick(item.path)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box>
      {/* AppBar para mobile */}
      {isMobile && (
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Minha Conta
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Container maxWidth="xl" sx={{ 
        display: 'flex', 
        mt: isMobile ? 2 : 4, 
        mb: 4, 
        gap: 3,
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        {/* Menu Desktop */}
        {!isMobile && (
          <Paper elevation={3} sx={{ width: 240, flexShrink: 0, height: 'fit-content' }}>
            {menuContent}
          </Paper>
        )}

        {/* Menu Mobile - Drawer */}
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
            },
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6">Minha Conta</Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          {menuContent}
        </Drawer>

        {/* Área de Conteúdo */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            width: { xs: '100%', md: 'calc(100% - 240px)' },
            minHeight: '400px'
          }}
        >
          <Outlet />
        </Box>
      </Container>
    </Box>
  );
};

export default MinhaContaLayout;