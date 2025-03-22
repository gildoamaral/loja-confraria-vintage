import { Routes, Route } from "react-router-dom";
import HomeProdutos from "../pages/Produtos/Home.jsx";
import Cadastro from "../pages/Produtos/Cadastro.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeProdutos />} />
      <Route path="/cadastro" element={<Cadastro />} />
    </Routes>
  );
}

export default AppRoutes;

