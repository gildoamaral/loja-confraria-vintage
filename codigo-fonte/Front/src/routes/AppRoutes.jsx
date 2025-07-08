import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login.jsx";
import CadastroUsuario from "../pages/Cadastro/CadastroUsuario.jsx";
import HomeCliente from "../pages/Home/HomeClient.jsx";
import InformProduto from "../pages/InformProdutos/InformProduto.jsx";
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

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* PUBLICAS */}
        <Route path="/" element={<HomeCliente />} />
        <Route path="/login" element={<Login />} />
        <Route path="/produto/:id" element={<InformProduto />} />
        <Route path='/sobre' element={<Sobre />} />
        <Route path="/cadastro-usuario" element={<CadastroUsuario />} />

        {/* USUÁRIO */}
        <Route element={<ProtectedLayout />}>
          <Route path="/conta" element={<Conta />} />
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

