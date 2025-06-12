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
import Pedidos from "../pages/Pedidos/Pedidos.jsx";
import ProtectedLayout from '../components/ProtectedLayout';
import NotFound from "../pages/NotFound/NotFound"; // Crie esse componente
import Carrossel from '../components/Carrossel/Carrossel.jsx';

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<HomeCliente />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
      <Route path="/produto/:id" element={<InformProduto />} />
      <Route path='/carrinho' element={<Carrinho />} />
      <Route path='/teste' element={<Carrossel />} />

      {/* Rotas privadas para qualquer usuário logado */}
      <Route element={<ProtectedLayout />}>
        <Route path="/conta" element={<Conta />} />
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="/pedidos" element={<Pedidos />} />
      </Route>

      {/* Rotas privadas só para admin */}
      <Route element={<ProtectedLayout adminOnly />}>
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/cadastro-produto" element={<CadastroProduto />} />
        <Route path="/homeprodutos" element={<HomeProdutos />} />
      </Route>

      {/* Rota para página não encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;

