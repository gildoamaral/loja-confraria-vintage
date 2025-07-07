import { useState } from "react";
import styles from "./Pedidos.module.css";
import Header from '../../components/Header1';
import Footer from '../../components/Footer';
import PageContainer from '../../components/PageContainer';
import CadastroProdutos from './CadastroProdutos';
import EstoqueProdutos from './EstoqueProdutos';
import ListaPedidos from './ListaPedidos';

const AreaAdmin = () => {
  const [abaAtiva, setAbaAtiva] = useState("estoque");

  return (
    <div>
      <PageContainer className={styles.container}>
        <div className={styles.header}>
          <h2>Área do Administrador</h2>
        </div>
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
        </div>

        {abaAtiva === "pedidos" && <ListaPedidos />}
        {abaAtiva === "estoque" && <EstoqueProdutos />}
        {abaAtiva === "cadastro" && <CadastroProdutos />}
      </PageContainer>
      <Footer />
    </div>
  );
};

export default AreaAdmin;