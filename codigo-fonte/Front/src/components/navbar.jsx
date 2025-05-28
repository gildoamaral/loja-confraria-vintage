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
      } catch (error) {
        console.error("Erro ao verificar:", error);
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
  }, [logado]);

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
    <nav style={styles.navbar}>
      {isMobile ? (
        <div style={{display: "flex", width: '100vw', justifyContent: 'space-between', alignItems: 'center'}}>
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
              >
                {link.label}
              </MenuItem>
            ))}
          </Menu>
        </div>
      ) : (
        <>

          <Link to="/" style={{ ...styles.link, fontSize }}>Home</Link>
          {logado && usuario?.posicao === 'ADMIN' && (
            <>
              <Link to="/estoque" style={{ ...styles.link, fontSize, }}>Estoque</Link>
              <Link to="/cadastro-produto" style={{ ...styles.link, fontSize }}>Cadastro</Link>
            </>
          )}


          {logado ? (
            <>
              <Link to="/conta" style={{ ...styles.link, fontSize }}>Conta</Link>
              <Link
                  to="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout(); 
                  }}
                  style={{ ...styles.link, fontSize }}
                >
                  Logout
                </Link>
            </>
          ) : (
            <Link to="/login" style={{ ...styles.link, fontSize }}>Login</Link>
          )}
          <Link to="/carrinho" style={{ marginLeft: '1rem' }}>
            <Badge badgeContent={qtdCarrinho} color="error" overlap="circular">
              <ShoppingCartIcon sx={{ fontSize: 32, color: "#fae0d2" }} />
            </Badge>
          </Link>
        </>
      )}
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    height: "3rem",
    backgroundColor: "var(--cor-secundaria)",
    // padding: "0 2rem",
    marginTop: "3em",
  },
  quad1: {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
  },
  quad2: {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
  },
  link: {
    fontSize: "2.3rem",
    padding: "0 1rem",
    background: "none",
    fontFamily: "Playfair Display",
    color: "var(--cor-fonte-claro)",
  },
};

export default Navbar;