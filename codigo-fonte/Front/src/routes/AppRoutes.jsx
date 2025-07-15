import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login.jsx";
import NewLogin from "../pages/Login/NewLogin.jsx";
import CadastroUsuario from "../pages/Cadastro/NewCadastroUsuario.jsx";
import InformProduto from "../pages/InformProdutos/InformProduto.jsx";
import NewInformProduto from "../pages/InformProdutos/NewInformProduto.jsx";
import Conta from "../pages/Conta/Conta.jsx";
import Carrinho from '../pages/Carrinho/Carrinho.jsx';
import Pagamento from '../pages/Pagamento/Pagamento.jsx';
import ProtectedLayout from '../components/ProtectedLayout';
import NotFound from "../pages/NotFound/NotFound"; 
import EsqueciSenha from '../pages/ResetSenha/EsqueciSenha.jsx';
import ResetarSenha from '../pages/ResetSenha/ResetSenha.jsx';
import AreaAdmin from '../pages/AreaAdmin/AreaAdmin.jsx';
import Sobre from '../pages/Sobre/Sobre.jsx';
import MainLayout from '../components/MainLayout.jsx';
import HomePage from '../pages/Home/HomePage.jsx';
import MinhaContaLayout from '../pages/Conta/MinhaContaLayout.jsx';
import Dashboard from '../pages/Conta/Dashboard.jsx';
import Configuracoes from '../pages/Conta/Configuracoes.jsx';
import DetalhePedido from '../pages/Conta/DetalhePedidos.jsx';
import MeusPedidos from '../pages/Conta/MeusPedidos.jsx';
import Seguranca from '../pages/Conta/Seguranca.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* PUBLICAS */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<NewLogin />} />
        <Route path="/produto/:id" element={<NewInformProduto />} />
        <Route path='/sobre' element={<Sobre />} />
        <Route path="/cadastro-usuario" element={<CadastroUsuario />} />

        {/* USUÁRIO */}
        <Route element={<ProtectedLayout />}>
          <Route path="/conta" element={<Conta />} />
          <Route path="/minha-conta" element={<MinhaContaLayout />}>
                    <Route index element={<Dashboard />} />
                    {/* Futuras rotas entrarão aqui */}
                    <Route path="configuracoes" element={<Configuracoes />} />
                    <Route path="pedidos" element={<MeusPedidos />} />
                    <Route path="pedidos/:id" element={<DetalhePedido />} />
                    <Route path="seguranca" element={<Seguranca />} /> 
                </Route>
        </Route>

        {/* ADMIN */}
        <Route element={<ProtectedLayout adminOnly />}>
          <Route path="/admin" element={<AreaAdmin />} />
        </Route>

        {/* NOT FOUND */}
        <Route path="*" element={<NotFound />} />
      </Route>



      {/* <Route element={<MinimalLayout />}> */}
      {/* PUBLICAS */}
      <Route path='/carrinho' element={<Carrinho />} />
      <Route path="/esqueci-senha" element={<EsqueciSenha />} />
      <Route path="/resetar-senha/:token" element={<ResetarSenha />} />

      {/* PAGAMENTO */}
      <Route element={<ProtectedLayout />}>
        <Route path="/pagamento" element={<Pagamento />} />
      </Route>
      {/* </Route> */}

    </Routes>
  );
}

export default AppRoutes;

