import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.link}>Home</Link>
      <Link to="/cadastro-produto" style={styles.link}>Cadastro</Link>
      <Link to="/login" style={styles.link}>Login</Link>
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
  },
};

export default Navbar;
