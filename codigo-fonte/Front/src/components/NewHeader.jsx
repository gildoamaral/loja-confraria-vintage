import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PersonOutline,
  Person,
  ShoppingCartOutlined,
  AdminPanelSettings,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts';

const Navbar = () => {
  const { usuario, isAuthenticated, loading, logout } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMenuOpen = Boolean(anchorEl);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setVisible(false);
        window.dispatchEvent(new CustomEvent('navbarHidden'));
        if (isMenuOpen) {
          handleMenuClose();
        }
      } else if (currentScrollY < lastScrollY) {
        setVisible(true);
        window.dispatchEvent(new CustomEvent('navbarVisible'));
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY, isMenuOpen]);

  useEffect(() => {
    const updateCartCount = async () => {
      console.log("Evento 'cartUpdated' recebido, atualizando contagem do carrinho...");
      try {
        const cartCountResponse = await api.get('/api/cart/count');
        setCartItemCount(cartCountResponse.data.count);
      } catch (error) {
        console.error("Erro ao re-buscar contagem do carrinho:", error);
      }
    };

    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (isAuthenticated) {
        try {
          const cartCountResponse = await api.get('/api/cart/count');
          setCartItemCount(cartCountResponse.data.count);
        } catch (error) {
          console.error("Erro ao buscar contagem do carrinho:", error);
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    };
    fetchCartCount();
  }, [isAuthenticated]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleMobileMenuOpen = () => setMobileMenuOpen(true);
  const handleMobileMenuClose = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    handleMenuClose();
    handleMobileMenuClose();
    logout();
  };


  if (loading) {
    return (
      <>
        <Box height={63} />
        <AppBar position="fixed" sx={{ backgroundColor: 'transparent', boxShadow: 'none', zIndex: 1100 }}>
          <Toolbar />
        </AppBar>
      </>
    );
  }

  return (
    <>
      <Box height={isMobile ? 57 : 63} backgroundColor={"var(--primary-color-theme)"} />
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'var(--primary-color-theme)',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          color: '#5C3A21',
          transform: visible ? 'translateY(0)' : 'translateY(-110%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', position: 'relative' }}>
          {/* Menu Hambúrguer - Apenas Mobile */}
          {isMobile && (
            <IconButton color="inherit" onClick={handleMobileMenuOpen}>
              <MenuIcon />
            </IconButton>
          )}

          {/* Navegação Desktop - Escondida no Mobile */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button color="inherit" component={RouterLink} to="/">Home</Button>
              {/* <Button color="inherit" component={RouterLink} to="/colecoes">Coleções</Button> */}
              <Button color="inherit" component={RouterLink} to="/sobre">Sobre</Button>
              {isAuthenticated && usuario?.posicao === 'ADMIN' && (
                <Button color="inherit" component={RouterLink} to="/admin" startIcon={<AdminPanelSettings />}>
                  Administração
                </Button>
              )}
            </Box>
          )}

          {/* Logo Central - Sempre Visível */}
          <Typography 
            variant={isMobile ? "body1" : "h6"} 
            component={RouterLink} 
            to="/" 
            sx={{ 
              position: 'absolute', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              fontFamily: '"Cinzel", serif', 
              fontWeight: 'bold', 
              textDecoration: 'none', 
              color: 'inherit', 
              zIndex: 1 
            }}
          >
            CONFRARIA VINTAGE
          </Typography>

          {/* Ações do usuário - Desktop e Mobile */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Ícone do usuário - Apenas Desktop */}
            {!isMobile && isAuthenticated && (
              <>
                <IconButton color="inherit" onClick={handleMenuOpen}>
                  <Person />
                </IconButton>
                <Menu 
                  anchorEl={anchorEl} 
                  open={isMenuOpen} 
                  onClose={handleMenuClose} 
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} 
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <Typography sx={{ p: 1, fontWeight: 'bold' }}>Olá, {usuario.nome}!</Typography>
                  <MenuItem component={RouterLink} to="/minha-conta" onClick={handleMenuClose}>Minha Conta</MenuItem>
                  <MenuItem onClick={handleLogout}>Sair</MenuItem>
                </Menu>
              </>
            )}

            {/* Login - Apenas Desktop */}
            {!isMobile && !isAuthenticated && (
              <IconButton color="inherit" component={RouterLink} to="/login" state={{ from: location }}>
                <PersonOutline />
              </IconButton>
            )}

            {/* Carrinho - Sempre Visível */}
            <IconButton color="inherit" component={RouterLink} to="/carrinho">
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCartOutlined />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer do Menu Mobile */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <List>
            {/* Navegação */}
            <ListItem component={RouterLink} to="/" onClick={handleMobileMenuClose} sx={{ cursor: 'pointer' }}>
              <ListItemText sx={{color: "black"}} primary="Home" />
            </ListItem>

            {/* <ListItem component={RouterLink} to="/colecoes" onClick={handleMobileMenuClose} sx={{ cursor: 'pointer' }}>
              <ListItemText sx={{color: "black"}} primary="Coleções" />
            </ListItem> */}
            
            <ListItem component={RouterLink} to="/sobre" onClick={handleMobileMenuClose} sx={{ cursor: 'pointer' }}>
              <ListItemText sx={{color: "black"}} primary="Sobre" />
            </ListItem>

            {/* Admin - Só se for admin */}
            {isAuthenticated && usuario?.posicao === 'ADMIN' && (
              <ListItem component={RouterLink} to="/admin" onClick={handleMobileMenuClose} sx={{ cursor: 'pointer' }}>
                <ListItemIcon>
                  <AdminPanelSettings />
                </ListItemIcon>
                <ListItemText sx={{color: "black"}} primary="Administração" />
              </ListItem>
            )}

            <Divider sx={{ my: 1 }} />

            {/* Opções do usuário */}
            {isAuthenticated ? (
              <>
                <ListItem>
                  <ListItemText 
                    primary={`Olá, ${usuario.nome}!`} 
                    sx={{ fontWeight: 'bold' }}
                  />
                </ListItem>
                
                <ListItem component={RouterLink} to="/minha-conta" onClick={handleMobileMenuClose} sx={{ cursor: 'pointer' }}>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText sx={{color: "black"}} primary="Minha Conta" />
                </ListItem>
                
                <ListItem onClick={handleLogout} sx={{ cursor: 'pointer' }}>
                  <ListItemText primary="Sair" />
                </ListItem>
              </>
            ) : (
              <ListItem component={RouterLink} to="/login" onClick={handleMobileMenuClose} sx={{ cursor: 'pointer' }}>
                <ListItemIcon>
                  <PersonOutline />
                </ListItemIcon>
                <ListItemText sx={{color: "black"}} primary="Entrar" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;