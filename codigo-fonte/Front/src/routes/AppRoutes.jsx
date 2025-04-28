import { Routes, Route } from "react-router-dom";
import HomeProdutos from "../pages/Produtos/Home.jsx";
import CadastroProduto from "../pages/Produtos/CadastroProduto.jsx";
import Login from "../pages/Login/Login.jsx";
import CadastroUsuario from "../pages/Cadastro/CadastroUsuario.jsx";
import HomeCliente from "../pages/Usuario/HomeClient.jsx";
import InformProduto from "../pages/Usuario/InformProduto.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeProdutos />} />
      <Route path="/cadastro-produto" element={<CadastroProduto />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
      <Route path="/home" element={<HomeCliente />} />
      <Route path="/produto/:id" element={<InformProduto />} />
    </Routes>
  );
}

export default AppRoutes;

