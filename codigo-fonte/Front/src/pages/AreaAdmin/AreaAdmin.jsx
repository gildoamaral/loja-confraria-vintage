import { useState } from "react";
import styles from "./ListaPedidos.module.css";
import PageContainer from '../../components/PageContainer';
import CadastroProdutos from './CadastroProdutos';
import ListaPedidos from './ListaPedidos';
import GerenciarCarrossel from './GerenciarCarrossel';
import NewEstoqueProdutos from './NewEstoqueProdutos';
import AdminPedidos from './AdminPedidos';

const AreaAdmin = () => {
  const [abaAtiva, setAbaAtiva] = useState("estoque");

  return (
    <div>
      <PageContainer className={styles.container}>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${abaAtiva === "estoque" ? styles.activeTab : ""}`}
            onClick={() => setAbaAtiva("estoque")}
          >
            Estoque
          </button>
          <button
            className={`${styles.tab} ${abaAtiva === "cadastro" ? styles.activeTab : ""}`}
            onClick={() => setAbaAtiva("cadastro")}
          >
            Cadastro
          </button>
          <button
            className={`${styles.tab} ${abaAtiva === "pedidos" ? styles.activeTab : ""}`}
            onClick={() => setAbaAtiva("pedidos")}
          >
            Pedidos
          </button>
          <button
            className={`${styles.tab} ${abaAtiva === "carrossel" ? styles.activeTab : ""}`}
            onClick={() => setAbaAtiva("carrossel")}
          >
            Carrossel
          </button>
        </div>

        {abaAtiva === "pedidos" && <AdminPedidos />}
        {abaAtiva === "estoque" && <NewEstoqueProdutos />}
        {abaAtiva === "cadastro" && <CadastroProdutos />}
        {abaAtiva === "carrossel" && <GerenciarCarrossel />}
      </PageContainer>
    </div>
  );
};

export default AreaAdmin;