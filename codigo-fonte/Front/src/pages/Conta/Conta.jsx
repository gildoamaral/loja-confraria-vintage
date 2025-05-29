import { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./Conta.module.css";
import Header from '../../components/Header1';
import Footer from '../../components/Footer';
import PageContainer from '../../components/PageContainer';

const Conta = () => {
  const [usuario, setUsuario] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("pedidos");

  const [editando, setEditando] = useState(false);
  const [formDados, setFormDados] = useState({
    nome: "",
    sobrenome: "",
    telefone: "",
    email: "",
    endereco: "",
    dataNascimento: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [msgSucesso, setMsgSucesso] = useState("");
  const [msgErro, setMsgErro] = useState("");

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
        const responseUsuario = await api.get('/usuarios/conta', { withCredentials: true });
        const dadosUsuario = responseUsuario.data.usuario || responseUsuario.data;

        setUsuario(dadosUsuario);
        setFormDados({
          nome: dadosUsuario.nome || "",
          sobrenome: dadosUsuario.sobrenome || "",
          telefone: dadosUsuario.telefone || "",
          email: dadosUsuario.email || "",
          endereco: dadosUsuario.endereco || "",
          dataNascimento: dadosUsuario.dataNascimento
            ? dadosUsuario.dataNascimento.split("T")[0]
            : "",
        });

        const responsePedidos = await api.get('/pedidos', { withCredentials: true });
        setPedidos(responsePedidos.data);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDados((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSalvar = async () => {
    setSalvando(true);
    setMsgErro("");
    setMsgSucesso("");
    try {
      const response = await api.put("/usuarios/conta", formDados, { withCredentials: true });
      const usuarioAtualizado = response.data.usuario || response.data;

      setUsuario(usuarioAtualizado);
      setMsgSucesso("Dados atualizados com sucesso!");
      setEditando(false);
    } catch (err) {
      console.error("Erro ao atualizar dados:", err);
      setMsgErro("Falha ao atualizar dados. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const toggleExpandirPedido = (id) => {
    setPedidosExpandido((prev) =>
      prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : [...prev, id]
    );
  };

  if (loading) return <p>Carregando dados da conta...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <Header />
      <PageContainer className={styles.container}>
        <div className={styles.header}>
          <h1>Olá, <span className={styles.highlight}>{usuario?.nome || "Usuário"}</span>!</h1>
          <h3>Gerencie suas informações e acompanhe seus pedidos</h3>
        </div>

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

        {abaAtiva === "info" && (
          <div className={styles.formContainer}>
            <h2>Minhas informações</h2>
            {!editando ? (
              <>
                <div className={styles.inputGroup}>
                  <label>Nome completo:</label>
                  <p>{usuario?.nome} {usuario?.sobrenome || ""}</p>
                </div>
                <div className={styles.inputGroup}>
                  <label>Data de nascimento:</label>
                  <p>
                    {usuario?.dataNascimento
                      ? new Date(usuario.dataNascimento.split("T")[0] + "T12:00:00").toLocaleDateString()
                      : "Não informada"}
                  </p>
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

                <button className={styles.botaoEditar} onClick={() => setEditando(true)}>
                  Editar
                </button>
              </>
            ) : (
              <>
                <div className={styles.inputGroup}>
                  <label>Nome:</label>
                  <input
                    type="text"
                    name="nome"
                    value={formDados.nome}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Sobrenome:</label>
                  <input
                    type="text"
                    name="sobrenome"
                    value={formDados.sobrenome}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Data de nascimento:</label>
                  <input
                    type="date"
                    name="dataNascimento"
                    value={formDados.dataNascimento}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Telefone:</label>
                  <input
                    type="text"
                    name="telefone"
                    value={formDados.telefone}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formDados.email}
                    onChange={handleChange}
                    disabled
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Endereço:</label>
                  <input
                    type="text"
                    name="endereco"
                    value={formDados.endereco}
                    onChange={handleChange}
                  />
                </div>
                {msgErro && <p className={styles.erroMsg}>{msgErro}</p>}
                {msgSucesso && <p className={styles.sucessoMsg}>{msgSucesso}</p>}

                <button
                  className={styles.botaoSalvar}
                  onClick={handleSalvar}
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
                <button
                  className={styles.botaoCancelar}
                  onClick={() => {
                    setEditando(false);
                    setFormDados({
                      nome: usuario.nome || "",
                      sobrenome: usuario.sobrenome || "",
                      telefone: usuario.telefone || "",
                      email: usuario.email || "",
                      endereco: usuario.endereco || "",
                      dataNascimento: usuario.dataNascimento
                        ? usuario.dataNascimento.split("T")[0]
                        : "",
                    });
                    setMsgErro("");
                    setMsgSucesso("");
                  }}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        )}

        {abaAtiva === "pedidos" && (
          <div className={styles.formContainer}>
            <h2>Meus pedidos</h2>
            {pedidos.filter(p => p.status !== "CARRINHO").length === 0 ? (
              <p>Você ainda não realizou nenhum pedido.</p>
            ) : (
              pedidos
                .filter(pedido => pedido.status !== "CARRINHO")
                .map((pedido) => {
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
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        )}
      </PageContainer>
      <Footer />
    </div>
  );
};

export default Conta;
