import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import useMediaQuery from '@mui/material/useMediaQuery';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge';
import { Box } from '@mui/material';


function Navbar({ invisivel }) {
  const [usuario, setUsuario] = useState(null);
  const [logado, setLogado] = useState(false);
  const [qtdCarrinho, setQtdCarrinho] = useState(0);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 600px)');
  const isTablet = useMediaQuery('(max-width: 900px)');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    async function verificarLogin() {
      try {
        const res = await api.get("/usuarios/conta");

        if (res) {
          setUsuario(res.data);
          setLogado(true);
        }
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setLogado(false);
      }
    }

    verificarLogin();
  }, []);

  useEffect(() => {
    async function fetchCarrinho() {
      try {
        const res = await api.get('/pedidos/carrinho', { withCredentials: true });
        setQtdCarrinho(res.data?.itens?.length || 0);
      } catch {
        setQtdCarrinho(0);
      }
    }
    fetchCarrinho();
  }, [qtdCarrinho]);

  if (invisivel) {
    return null; // Não renderiza nada se "invisivel" for passado
  }

  const handleLogout = async () => {
    try {
      await api.post("/usuarios/logout", {}, { withCredentials: true });
      setLogado(false);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  // Menu mobile handlers
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Links para o menu
  const menuLinks = [
    { to: "/", label: "Home" },
    ...(logado && usuario?.posicao === 'ADMIN'
      ? [
        { to: "/estoque", label: "Estoque" },
        { to: "/cadastro-produto", label: "Cadastro" },
        { to: "/pedidos", label: "Pedidos" },
      ]
      : []),
    ...(logado
      ? [
        { to: "/conta", label: "Conta" },
        { to: "/login", label: "Logout", onClick: handleLogout },
      ]
      : [{ to: "/login", label: "Login" }]),
  ];

  // Defina o tamanho da fonte de acordo com o tamanho da tela
  let fontSize = "1.5rem";
  if (isMobile) fontSize = "1.2rem";
  else if (isTablet) fontSize = "1.7rem";

  return (
    <Box
      component="nav"
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        width: "100%",
        height: "4rem",
        backgroundColor: "var(--cor-secundaria)",

      }}
    >
      {/* Mobile menu */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" }, // xs/sm: mobile, md+: hidden
          width: '100vw',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuOpen}
          sx={{ ml: 1 }}
        >
          <MenuIcon fontSize="large" sx={{ color: "#fae0d2" }} />
        </IconButton>

        <Link to="/carrinho" style={{ marginRight: '1rem' }}>
          <Badge badgeContent={qtdCarrinho} color="error" overlap="circular">
            <ShoppingCartIcon sx={{ fontSize: 32, color: "#fae0d2" }} />
          </Badge>
        </Link>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {menuLinks.map((link) => (
            <MenuItem
              key={link.label}
              onClick={() => {
                handleMenuClose();
                if (link.onClick) link.onClick();
                else navigate(link.to);
              }}
              sx={{
                fontFamily: "Playfair Display",
                fontSize: { xs: "1.2rem", md: "1.7rem" },
                color: "var(--cor-fonte-claro)",
                width: '100vw',
              }}
            >
              {link.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Desktop menu */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" }, // xs/sm: hidden, md+: flex
          alignItems: "center",
          width: "100%",
          justifyContent: "space-around"
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Box
            component="span"
            sx={{
              fontSize: { xs: "1.2rem", md: "1.7rem" },
              px: 2,
              fontFamily: "Playfair Display",
              color: "var(--cor-fonte-claro)",
              background: "none",
            }}
          >
            Home
          </Box>
        </Link>
        {logado && usuario?.posicao === 'ADMIN' && (
          <>
            {/* <Link to="/estoque" style={{ textDecoration: 'none' }}>
              <Box component="span" sx={{ fontSize, px: 2, fontFamily: "Playfair Display", color: "var(--cor-fonte-claro)" }}>
                Estoque
              </Box>
            </Link>
            <Link to="/cadastro-produto" style={{ textDecoration: 'none' }}>
              <Box component="span" sx={{ fontSize, px: 2, fontFamily: "Playfair Display", color: "var(--cor-fonte-claro)" }}>
                Cadastro
              </Box>
            </Link> */}
            <Link to="/pedidos" style={{ textDecoration: 'none' }}>
              <Box component="span" sx={{ fontSize, px: 2, fontFamily: "Playfair Display", color: "var(--cor-fonte-claro)" }}>
                Administração
              </Box>
            </Link>
          </>
        )}

        {logado ? (
          <>
            <Link to="/conta" style={{ textDecoration: 'none' }}>
              <Box component="span" sx={{ fontSize, px: 2, fontFamily: "Playfair Display", color: "var(--cor-fonte-claro)" }}>
                Conta
              </Box>
            </Link>
            <Link
              to="/login"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              style={{ textDecoration: 'none' }}
            >
              <Box component="span" sx={{ fontSize, px: 2, fontFamily: "Playfair Display", color: "var(--cor-fonte-claro)" }}>
                Logout
              </Box>
            </Link>
          </>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Box component="span" sx={{ fontSize, px: 2, fontFamily: "Playfair Display", color: "var(--cor-fonte-claro)" }}>
              Login
            </Box>
          </Link>
        )}
        <Link to="/carrinho" style={{ marginLeft: '1rem' }}>
          <Badge badgeContent={qtdCarrinho} color="error" overlap="circular">
            <ShoppingCartIcon sx={{ fontSize: 32, color: "#fae0d2" }} />
          </Badge>
        </Link>
      </Box>
    </Box>
  );
}

export default Navbar;