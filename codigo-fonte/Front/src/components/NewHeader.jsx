import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Badge,
  Menu,      // --- 1. IMPORTAÇÕES ADICIONAIS ---
  MenuItem,
} from '@mui/material';
import {
  PersonOutline,
  Person,
  ShoppingCartOutlined,
  AdminPanelSettings,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import api from '../services/api';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const location = useLocation();

  // --- 2. ESTADO PARA O MENU ---
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        const userStatusResponse = await api.get('/api/auth/status');
        if (userStatusResponse.status === 200) {
          const userData = userStatusResponse.data;
          setUser(userData);
          const cartCountResponse = await api.get('/api/cart/count');
          setCartItemCount(cartCountResponse.data.count);
        }
      } catch (error) {
        console.log('Usuário não autenticado ou erro ao buscar dados: ', error);
        setUser(null);
        setCartItemCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchNavbarData();
  }, []);

  // useEffect para controlar o scroll
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        // Descendo e passou de 50px
        setVisible(false);
        // Fecha o menu se estiver aberto
        if (isMenuOpen) {
          handleMenuClose();
        }
      } else if (currentScrollY < lastScrollY) {
        // Subindo
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY, isMenuOpen]);

  useEffect(() => {
    // Função para ser chamada quando o evento 'cartUpdated' for disparado
    const updateCartCount = async () => {
      console.log("Evento 'cartUpdated' recebido, atualizando contagem do carrinho...");
      try {
        const cartCountResponse = await api.get('/api/cart/count');
        setCartItemCount(cartCountResponse.data.count);
      } catch (error) {
        console.error("Erro ao re-buscar contagem do carrinho:", error);
      }
    };

    // Adiciona o 'ouvinte' de eventos
    window.addEventListener('cartUpdated', updateCartCount);

    // Função de limpeza: remove o 'ouvinte' quando o componente for desmontado
    // Isso é muito importante para evitar vazamentos de memória.
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  // --- 3. FUNÇÕES PARA O MENU E LOGOUT ---
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose(); // Garante que o menu feche
    try {
      // Usa sua instância 'api' para chamar a rota de logout
      await api.post('/usuarios/logout');
      // Redireciona para a home, forçando a atualização do estado da aplicação
      window.location.href = '/';
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };


  if (loading) {
    return (
      <>
        <Box height={63} />
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: 'transparent',
            boxShadow: 'none',
            zIndex: 1100,
          }}
        >
          <Toolbar />
        </AppBar>
      </>
    );
  }

  return (
    <>
      <Box height={63} backgroundColor={"var(--primary-color-theme)"} />

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
          {/* Links da Esquerda (sem alterações) */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" component={RouterLink} to="/">Home</Button>
            <Button color="inherit" component={RouterLink} to="/sobre">Sobre</Button>
            {user?.posicao === 'ADMIN' && (
              <Button
                color="inherit"
                component={RouterLink}
                to="/admin"
                startIcon={<AdminPanelSettings />}
              >
                Administração
              </Button>
            )}
          </Box>

          {/* Nome da Marca no Centro (sem alterações) */}
          <Typography
            variant="h6"
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

          {/* --- 4. JSX ATUALIZADO PARA OS ÍCONES DA DIREITA --- */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user ? (
              // Se o usuário existe, renderiza o ícone que abre o menu
              <>
                <IconButton color="inherit" onClick={handleMenuOpen}>
                  <Person />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={isMenuOpen}
                  onClose={handleMenuClose}
                  // disableScrollLock={true}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <Typography sx={{ p: 1 }}>Olá Usuário!</Typography>
                  <MenuItem component={RouterLink} to="/conta" onClick={handleMenuClose}>
                    Minha Conta
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Sair</MenuItem>
                </Menu>
              </>
            ) : (
              // Se não existe, renderiza o ícone que leva para a página de login
              <IconButton color="inherit" component={RouterLink} to="/login" state={{ from: location }}>
                <PersonOutline />
              </IconButton>
            )}

            <IconButton color="inherit" component={RouterLink} to="/carrinho">
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCartOutlined />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;