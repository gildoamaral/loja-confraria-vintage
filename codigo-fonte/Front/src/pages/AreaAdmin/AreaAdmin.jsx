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
  useMediaQuery
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        Área Administrativa
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        gap: 3,
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        {/* Menu Lateral */}
        <Paper 
          elevation={3} 
          sx={{ 
            width: isMobile ? '100%' : 240, 
            flexShrink: 0,
            maxHeight: isMobile ? 'auto' : 'fit-content'
          }}
        >
          <List sx={{ p: 0 }}>
            {menuItems.map((item) => (
              <ListItem key={item.key} disablePadding>
                <ListItemButton
                  selected={abaAtiva === item.key}
                  onClick={() => setAbaAtiva(item.key)}
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
        </Paper>

        {/* Área de Conteúdo */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            minHeight: '400px'
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </Container>
  );
};

export default AreaAdmin;