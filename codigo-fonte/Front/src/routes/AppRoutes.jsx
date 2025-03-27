import { Routes, Route } from "react-router-dom";
import HomeProdutos from "../pages/Produtos/Home.jsx";
import Cadastro from "../pages/Produtos/Cadastro.jsx";
import Login from "../pages/Login/Login.jsx";
import CadastroUsuario from "../pages/Cadastro/CadastroUsuario.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeProdutos />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
    </Routes>
  );
}

export default AppRoutes;

