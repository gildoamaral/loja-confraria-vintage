import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Navbar() {
  const [usuario, setUsuario] = useState(null);
  const [logado, setLogado] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function verificarLogin() {
      try {
        const res = await api.get("/usuarios/conta", { withCredentials: true });
        
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

  const handleLogout = async () => {
    try {
      navigate("/login");
      await api.post("/usuarios/logout", {}, { withCredentials: true });
      setLogado(false);
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.link}>Home</Link>
      
      {logado ? (
        <>
        {usuario?.posicao == 'ADMIN' ? 
        (
          <>
            <Link to="/estoque" style={styles.link}>Estoque</Link>
            <Link to="/cadastro-produto" style={styles.link}>Cadastro</Link>
          </>
        ) : (
          <></>
        )}
          <Link to="/conta" style={styles.link}>Conta</Link>
          <Link to="/login" onClick={handleLogout} style={styles.link}>Logout</Link>
        </>
      ) : (
        <Link to="/login" style={styles.link}>Login</Link>
      )}
    </nav>
  );
}

const styles = {
  navbar: {
    width: "80%",
    backgroundColor: "var(--cor-secundaria)",
    borderRadius: "10px", 
    textAlign: "center",
  },
  link: {
    padding: "0 3rem",
    background: "none",
  },
};

export default Navbar;
