import { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./Conta.module.css";
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Conta = () => {
  const [usuario, setUsuario] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("pedidos"); // 'info' ou 'pedidos'

  useEffect(() => {
    async function fetchData() {
      try {
        const responseUsuario = await api.get('/usuarios/conta', { withCredentials: true });
        setUsuario(responseUsuario.data);

        // Dados reais de pedidos da API
        const responsePedidos = await api.get('/pedidos', { withCredentials: true });
        setPedidos(responsePedidos.data);

        /*
        // Dados simulados de pedidos (mock) - só para comparação
        const pedidosMock = [
          {
            idCompra: 101,
            produto: "Vestido Vintage",
            descricaoProduto: "Vestido de festa vermelho - Tamanho M",
            preco: 199.90,
            data: "2025-04-01T14:30:00.000Z",
            formaPagamento: "Cartão de crédito",
            enderecoEntrega: "Rua Jasmim, 123 - Bairro Jardim Santa Genebra - Campinas",
            enderecoCobranca: "Rua das Palmeiras, 456 - Centro"
          },
          {
            idCompra: 102,
            produto: "Body",
            descricaoProduto: "Body de algodão - Tamanho P",
            preco: 89.90,
            data: "2025-03-15T10:15:00.000Z",
            formaPagamento: "Pix",
            enderecoEntrega: "Rua Jasmim, 123 - Bairro Jardim Santa Genebra - Campinas",
            enderecoCobranca: "Rua das Palmeiras, 456 - Centro"
          }
        ];
        setPedidos(pedidosMock);
        */

        setError(null);
      } catch (error) {
        console.error("Erro ao buscar dados", error);
        setError("Erro ao carregar dados da conta.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Carregando dados da conta...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Olá, <span className={styles.highlight}>{usuario?.nome || "Usuário"}</span>!</h1>
          <h3>Gerencie suas informações e acompanhe seus pedidos</h3>
        </div>

        {/* Abas de navegação */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${abaAtiva === "info" ? styles.activeTab : ""}`}
            onClick={() => setAbaAtiva("info")}
          >
            Minhas Informações
          </button>
          <button
            className={`${styles.tab} ${abaAtiva === "pedidos" ? styles.activeTab : ""}`}
            onClick={() => setAbaAtiva("pedidos")}
          >
            Meus Pedidos
          </button>
        </div>

        {/* Conteúdo das abas */}
        {abaAtiva === "info" && (
          <div className={styles.formContainer}>
            <h2>Minhas informações</h2>

            <div className={styles.inputGroup}>
              <label>Nome completo:</label>
              <p>{usuario?.nome} {usuario?.sobrenome || ""}</p>
            </div>

            <div className={styles.inputGroup}>
              <label>Data de nascimento:</label>
              <p>{usuario?.dataNascimento ? new Date(usuario.dataNascimento).toLocaleDateString() : "Não informada"}</p>
            </div>

            <div className={styles.inputGroup}>
              <label>Telefone:</label>
              <p>{usuario?.telefone || "Não informado"}</p>
            </div>

            <div className={styles.inputGroup}>
              <label>Email:</label>
              <p>{usuario?.email || "Email não informado"}</p>
            </div>

            <div className={styles.inputGroup}>
              <label>Endereço:</label>
              <p>{usuario?.endereco || "Não informado"}</p>
            </div>
          </div>
        )}

        {abaAtiva === "pedidos" && (
          <div className={styles.formContainer}>
            <h2>Meus pedidos</h2>
            {pedidos.length === 0 ? (
              <p>Você ainda não realizou nenhum pedido.</p>
            ) : (
              pedidos.map((pedido) => (
                <div key={pedido.id} className={styles.pedidoCard}>
                  <h3>Pedido #{pedido.id}</h3>
                  <p><strong>Status:</strong> {pedido.status}</p>
                  <p><strong>Data:</strong> {new Date(pedido.createdAt).toLocaleDateString()}</p>
                  <p><strong>Endereço de entrega:</strong> {pedido.enderecoEntrega || 'Não informado'}</p>

                  <div>
                    <strong>Itens:</strong>
                    <ul>
                      {pedido.itens?.map(item => (
                        <li key={item.id}>
                          Produto ID: {item.produtoId} - Quantidade: {item.quantidade}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Conta;
