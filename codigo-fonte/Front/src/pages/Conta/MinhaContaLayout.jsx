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
  IconButton,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Typography,
  Collapse
} from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LockIcon from '@mui/icons-material/Lock';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

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
  const [menuExpanded, setMenuExpanded] = useState(false);

  const handleMenuClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMenuExpanded(false);
    }
  };

  const menuContent = (
    <List sx={{ width: '100%' }}>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            selected={location.pathname === item.path}
            onClick={() => handleMenuClick(item.path)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#000',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#000',
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
        <AppBar position="static" color="default" elevation={1} onClick={() => setMenuExpanded(!menuExpanded)}>
          <Toolbar
          
          >
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Minha Conta
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
            >
              {menuExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Menu Mobile Suspenso */}
      {isMobile && (
        <Collapse in={menuExpanded}>
          <Paper elevation={3} sx={{ width: '100%' }}>
            {menuContent}
          </Paper>
        </Collapse>
      )}

      <Container maxWidth="xl" sx={{ 
        display: 'flex', 
        mt: isMobile ? 2 : 4, 
        mb: 4, 
        gap: 3,
        flexDirection: isMobile ? 'column' : 'row',
        px: { xs: 1, sm: 2, md: 3 }
      }}>
        {/* Menu Desktop */}
        {!isMobile && (
          <Paper elevation={3} sx={{ width: 240, flexShrink: 0, height: 'fit-content' }}>
            {menuContent}
          </Paper>
        )}

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