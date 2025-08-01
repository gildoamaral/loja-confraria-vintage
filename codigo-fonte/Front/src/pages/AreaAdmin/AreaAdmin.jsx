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
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  AppBar,
  Toolbar,
  Collapse
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CadastroProdutos from './CadastroProdutos';
import GerenciarCarrossel from './GerenciarCarrossel';
import NewEstoqueProdutos from './NewEstoqueProdutos';
import AdminPedidos from './AdminPedidos';

// Itens do menu de navegação
const menuItems = [
  { text: 'Estoque', key: 'estoque', icon: <InventoryIcon /> },
  { text: 'Cadastro', key: 'cadastro', icon: <AddBoxIcon /> },
  { text: 'Pedidos', key: 'pedidos', icon: <ShoppingCartIcon /> },
  { text: 'Carrossel', key: 'carrossel', icon: <ViewCarouselIcon /> },
];

const AreaAdmin = () => {
  const [abaAtiva, setAbaAtiva] = useState("estoque");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [menuExpanded, setMenuExpanded] = useState(false);

  const handleMenuClick = (key) => {
    setAbaAtiva(key);
    if (isMobile) {
      setMenuExpanded(false);
    }
  };

  // Função para renderizar o conteúdo baseado na aba ativa
  const renderContent = () => {
    switch (abaAtiva) {
      case 'pedidos':
        return <AdminPedidos />;
      case 'estoque':
        return <NewEstoqueProdutos />;
      case 'cadastro':
        return <CadastroProdutos />;
      case 'carrossel':
        return <GerenciarCarrossel />;
      default:
        return <NewEstoqueProdutos />;
    }
  };

  const menuContent = (
    <List sx={{ width: '100%' }}>
      {menuItems.map((item) => (
        <ListItem key={item.key} disablePadding>
          <ListItemButton
            selected={abaAtiva === item.key}
            onClick={() => handleMenuClick(item.key)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#000',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#333',
                },
                '& .MuiListItemIcon-root': {
                  color: '#fff',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
              },
              py: 1.5,
            }}
          >
            <ListItemIcon sx={{ color: abaAtiva === item.key ? '#fff' : '#666' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                '& .MuiTypography-root': { 
                  fontWeight: abaAtiva === item.key ? 600 : 400 
                } 
              }} 
            />
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
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Área Administrativa
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
        mt: isMobile ? 2 : 4, 
        mb: 4,
        px: { xs: 0, sm: 2, md: 3 }
      }}>
        {!isMobile && (
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
            Área Administrativa
          </Typography>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          gap: 3,
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {/* Menu Desktop */}
          {!isMobile && (
            <Paper 
              elevation={3} 
              sx={{ 
                width: 240, 
                flexShrink: 0,
                height: 'fit-content'
              }}
            >
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
            {renderContent()}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AreaAdmin;