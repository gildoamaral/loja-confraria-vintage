import { Routes, Route } from "react-router-dom";
import HomeProdutos from "../pages/Produtos/Home.jsx";
import CadastroProduto from "../pages/Produtos/CadastroProduto.jsx";
import Login from "../pages/Login/Login.jsx";
import CadastroUsuario from "../pages/Cadastro/CadastroUsuario.jsx";
import HomeCliente from "../pages/Usuario/HomeClient.jsx";
import InformProduto from "../pages/Usuario/InformProduto.jsx";
import Conta from "../pages/Conta/Conta.jsx";
import Estoque from "../pages/Estoque/Estoque.jsx";
import Carrinho from '../pages/Carrinho/Carrinho.jsx';
import Pagamento from '../pages/Pagamento/Pagamento.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeCliente />} />
      <Route path="/cadastro-produto" element={<CadastroProduto />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
      <Route path="/homeprodutos" element={<HomeProdutos />} />
      <Route path="/produto/:id" element={<InformProduto />} />
      <Route path="/conta" element={<Conta />} />
      <Route path="/estoque" element={<Estoque />} />
      <Route path="/pagamento" element={<Pagamento />} />
      <Route path='/carrinho' element={<Carrinho />} />
    </Routes>
  );
}

export default AppRoutes;

