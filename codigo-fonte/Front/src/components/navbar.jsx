import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{
        padding: "0.1rem 10rem", 
        backgroundColor: "var(--cor-secundaria)",
        borderRadius: "10px", 
        }}>

      <Link to="/" style={{ marginRight: "15px" }}>Home</Link>
      <Link to="/cadastro-produto" style={{ marginRight: "15px" }}>Cadastro</Link>
      <Link to="/login">Login</Link>
    </nav>
  );
}

export default Navbar;
