import { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./Pedidos.module.css";
import Header from '../../components/Header1';
import Footer from '../../components/Footer';
import PageContainer from '../../components/PageContainer';

const Pedidos = () => {
//   const [usuario, setUsuario] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("pedidos");

  // Estado para edição
//   const [editando, setEditando] = useState(false);
//   const [formDados, setFormDados] = useState({
//     nome: "",
//     sobrenome: "",
//     telefone: "",
//     email: "",
//     endereco: "",
//     dataNascimento: "",
//   });
//   const [salvando, setSalvando] = useState(false);
//   const [msgSucesso, setMsgSucesso] = useState("");
//   const [msgErro, setMsgErro] = useState("");

  // Controle dos pedidos expandidos (array de ids)
  const [pedidosExpandido, setPedidosExpandido] = useState([]);

  const parseImagens = (imagemData) => {
    if (!imagemData) return [];
    try {
      return Array.isArray(imagemData) ? imagemData : JSON.parse(imagemData);
    } catch {
      return [imagemData];
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const responsePedidos = await api.get('/pedidos/pagos', { withCredentials: true });
        setPedidos(responsePedidos.data);
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormDados((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSalvar = async () => {
//     setSalvando(true);
//     setMsgErro("");
//     setMsgSucesso("");
//     try {
//       const response = await api.put("/pedidos/conta", formDados, { withCredentials: true });
//       const usuarioAtualizado = response.data.usuario || response.data;

//       setUsuario(usuarioAtualizado);
//       setMsgSucesso("Dados atualizados com sucesso!");
//       setEditando(false);
//     } catch (err) {
//       console.error("Erro ao atualizar dados:", err);
//       setMsgErro("Falha ao atualizar dados. Tente novamente.");
//     } finally {
//       setSalvando(false);
//     }
//   };

  // Toggle para expandir/fechar pedido individual
  const toggleExpandirPedido = (id) => {
    setPedidosExpandido((prev) =>
      prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : [...prev, id]
    );
  };

  return (
    <div>
      <Header />
      <PageContainer className={styles.container}>
        <div className={styles.header}>
          {/* <h1>Olá, <span className={styles.highlight}>{"Administrador"}</span>!</h1> */}
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
          <div className={styles.formContainer}>
            <h2>Lista de pedidos</h2>
            {pedidos.length === 0 ? (
                <p>
                    {loading
                        ? "Carregando..."
                        : "Ainda não há nenhum pedido por aqui."
                    }
                </p>
            ) : (
              pedidos.map((pedido) => {
                const totalPedido = pedido.itens?.reduce((acc, item) => {
                  const precoUnitario = item.produto.preco || 0;
                  return acc + precoUnitario * item.quantidade;
                }, 0) || 0;

                const estaExpandido = pedidosExpandido.includes(pedido.id);

                return (
                  <div key={pedido.id} className={styles.pedidoCard}>
                    <h3
  style={{ cursor: "pointer", userSelect: "none" }}
  onClick={() => toggleExpandirPedido(pedido.id)}
>
  Pedido #{pedido.id}{" "}
  <span style={{
    display: "inline-block",
    transform: estaExpandido ? "rotate(90deg)" : "rotate(0deg)",
    transition: "transform 0.2s ease",
    fontWeight: "bold",
    marginLeft: "5px",
  }}>
    &gt;
  </span>
</h3>

                    {estaExpandido && (
                      <>
                        <p><strong>Nome:</strong> {pedido.usuario?.nome + ' ' + pedido.usuario?.sobrenome}</p>
                        <p><strong>Email:</strong> {pedido.usuario?.email}</p>
                        <p><strong>Telefone:</strong> {pedido.usuario?.telefone}</p>
                        <br/>
                        <p><strong>Status do pedido:</strong> {pedido.status}</p>
                        <p><strong>Status do pagamento:</strong> {pedido.pagamento?.status || 'Não informado'}</p>
                        <p><strong>Método de pagamento:</strong> {pedido.pagamento?.metodo || 'Não informado'}</p>
                        <p>
                          <strong>Data do pedido:</strong>{" "}
                          {pedido?.criadoEm
                            ? new Date(pedido.criadoEm.split("T")[0] + "T12:00:00").toLocaleDateString()
                            : "Data não informada"}
                        </p>
                        <p><strong>Endereço de entrega:</strong> {pedido.enderecoEntrega || 'Não informado'}</p>

                        <div>
                          <strong>Itens:</strong>
                          <ul>
                            {pedido.itens?.map(item => {
                              const produtoImagens = parseImagens(item.produto.imagem);
                              const imagem = produtoImagens[0] || "/placeholder.png";
                              const precoUnitario = item.produto.preco || 0;
                              const subtotal = precoUnitario * item.quantidade;

                              return (
                                <li key={item.id} className={styles.itemPedido}>
                                  <img
                                    src={imagem}
                                    alt={item.produto.nome}
                                    className={styles.imagemProduto}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                  <div>
                                    <strong>{item.produto.nome}</strong><br />
                                    Tamanho: {item.produto.tamanho || "Não informado"}<br />
                                    Cor: {item.produto.cor || "Não informada"}<br />
                                    Quantidade: {item.quantidade}<br />
                                    Preço unitário: R$ {precoUnitario.toFixed(2)}<br />
                                    Subtotal: R$ {subtotal.toFixed(2)}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                          <p><strong>Total do pedido:</strong> R$ {totalPedido.toFixed(2)}</p>
                         <button
                            className={styles.botaoEnviado}
                            onClick={async () => {
                                try {
                                await api.put(`/pedidos/${pedido.id}/status`, { status: 'ENVIADO' }, { withCredentials: true });
                                setPedidos(prev =>
                                    prev.map(p =>
                                    p.id === pedido.id ? { ...p, status: 'ENVIADO' } : p
                                    )
                                );
                                } catch (error) {
                                console.error("Erro ao atualizar status:", error.response?.data || error);
                                alert("Erro ao marcar como enviado");
                                }
                            }}
                            >
                            Enviado
                        </button>
                        <button
                            className={styles.botaoCancelado}
                            onClick={async () => {
                                try {
                                await api.put(`/pedidos/${pedido.id}/status`, { status: 'CANCELADO' }, { withCredentials: true });
                                setPedidos(prev =>
                                    prev.map(p =>
                                    p.id === pedido.id ? { ...p, status: 'CANCELADO' } : p
                                    )
                                );
                                } catch (error) {
                                console.error("Erro ao atualizar status:", error.response?.data || error);
                                alert("Erro ao marcar como cancelado");
                                }
                            }}
                            >
                            Cancelado
                        </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
      </PageContainer>
      <Footer />
    </div>
  );
};

export default Pedidos;