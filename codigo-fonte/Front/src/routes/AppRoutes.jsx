import { Routes, Route } from "react-router-dom";
import HomeProdutos from "../pages/Produtos/Home.jsx";
import CadastroProduto from "../pages/Produtos/CadastroProduto.jsx";
import Login from "../pages/Login/Login.jsx";
import CadastroUsuario from "../pages/Cadastro/CadastroUsuario.jsx";
import Conta from "../pages/Conta/Conta.jsx";
import Estoque from "../pages/Estoque/Estoque.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeProdutos />} />
      <Route path="/cadastro-produto" element={<CadastroProduto />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
      <Route path="/conta" element={<Conta />} />
      <Route path="/estoque" element={<Estoque />} />
    </Routes>
  );
}

export default AppRoutes;

