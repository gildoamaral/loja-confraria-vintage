import { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./Pedidos.module.css";
import stylesEstoque from '../Estoque/Estoque.module.css';
import stylesCadastro from '../Produtos/CadastroProduto.module.css';

import Compressor from 'compressorjs';
import Header from '../../components/Header1';
import Footer from '../../components/Footer';
import PageContainer from '../../components/PageContainer';

// Definição de enums como arrays
const categorias = ['SAIA', 'SHORT', 'CALÇA', 'BLUSA', 'CAMISA', 'CONJUNTOS', 'VESTIDO'];
const ocasioes = ['CASAMENTO', 'BATIZADO', 'MADRINHAS', 'FORMATURA'];
const tamanhosValidos = ['P', 'M', 'G', 'GG'];
const coresValidas = ['VERMELHO', 'AZUL', 'AMARELO', 'VERDE', 'PRETO', 'BRANCO', 'ROSA'];

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("pedidos");
  const [pedidosExpandido, setPedidosExpandido] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    quantidade: '',
    imagens: []
  });
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [imagens, setImagens] = useState([]);
  const [quantidade, setQuantidade] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [cor, setCor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [ocasiao, setOcasiao] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const responsePedidos = await api.get('/pedidos/pagos', { withCredentials: true });
        setPedidos(responsePedidos.data);

        const response = await api.get('/produtos');
        setProdutos(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const parseImagens = (imagemData) => {
    if (!imagemData) return [];
    try {
      return Array.isArray(imagemData) ? imagemData : JSON.parse(imagemData);
    } catch {
      return [imagemData];
    }
  };

    // Função de parsing para lidar com imagem já sendo array ou string JSON
  const parseImagensEstoque = (imagemData) => {
    if (!imagemData) return [];
    if (Array.isArray(imagemData)) {
      return imagemData;
    }
    if (typeof imagemData === 'string') {
      try {
        const parsed = JSON.parse(imagemData);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (error) {
        console.error('Erro ao parsear imagem:', error);
        return [imagemData];
      }
    }
    return [];
  };

  const handleExcluir = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) {
      return;
    }

    try {
      await api.delete(`/produtos/${id}`);                                     // Usando a instância personalizada do axios
      setProdutos(produtos.filter(produto => produto.id !== id));
      console.log(`Produto "${nome}" excluído com sucesso!`);                  // Adicionando log de sucesso
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  const abrirEdicao = (produto) => {
    setEditando(produto.id);
    // Se produto.imagem já for um array, não precisamos parsear
    const imagensParsed =
      typeof produto.imagem === 'string'
        ? JSON.parse(produto.imagem)
        : produto.imagem;
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco.toString(),
      quantidade: produto.quantidade.toString(),
      imagens: imagensParsed || []
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...formData.imagens];

    if (files.length + newImages.length > 5) {
      alert('Máximo de 5 imagens permitidas');
      return;
    }

    for (const file of files) {
      await new Promise((resolve) => {
        new Compressor(file, {
          quality: 0.6,
          success(result) {
            const reader = new FileReader();
            reader.onloadend = () => {
              console.log('Imagem comprimida:', reader.result);
              newImages.push(reader.result);
              resolve();
            };
            reader.readAsDataURL(result);
          },
          error(err) {
            console.error('Erro ao comprimir imagem:', err);
            resolve();
          }
        });
      });
    }

    setFormData({ ...formData, imagens: newImages });
  };

  const handleRemoveImage = (index) => {
    const newImages = formData.imagens.filter((_, i) => i !== index);
    setFormData({ ...formData, imagens: newImages });
  };

  const handleAtualizar = async (id) => {
    try {
      const dadosAtualizados = {
        ...formData,
        preco: parseFloat(formData.preco),
        quantidade: parseInt(formData.quantidade, 10),
        imagem: JSON.stringify(formData.imagens) // Armazena as imagens como JSON
      };

      const response = await api.put(`/produtos/${id}`, dadosAtualizados);

      if (response.ok) {
        const produtoAtualizado = await response.json();
        // Certifica que o campo imagem esteja como array no front-end
        const imagemArray =
          typeof produtoAtualizado.imagem === 'string'
            ? JSON.parse(produtoAtualizado.imagem)
            : produtoAtualizado.imagem;
        setProdutos(produtos.map(p =>
          p.id === id ? { ...produtoAtualizado, imagem: imagemArray } : p
        ));
        setEditando(null);
      } else {
        console.error('Erro na resposta ao atualizar:', await response.json());
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Toggle para expandir/fechar pedido individual
  const toggleExpandirPedido = (id) => {
    setPedidosExpandido((prev) =>
      prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : [...prev, id]
    );
  };

    const handleRemoveImageCadastro = idx => setImagens(prev => prev.filter((_, i) => i !== idx));
  
    const handleSubmit = async e => {
      e.preventDefault();
      setIsSubmitting(true);
  
      // Validação de campos
      if (
        !nome ||
        !preco ||
        !quantidade ||
        !tamanho ||
        !cor ||
        !categoria
      ) {
        setMessage('Preencha todos os campos obrigatórios');
        setIsSubmitting(false);
        return;
      }
  
      // Validação de enums locais (evita envio de valor inesperado)
      if (!tamanhosValidos.includes(tamanho)) {
        setMessage(`Tamanho inválido. Escolha: ${tamanhosValidos.join(', ')}`);
        setIsSubmitting(false);
        return;
      }
      if (!coresValidas.includes(cor)) {
        setMessage(`Cor inválida. Escolha: ${coresValidas.join(', ')}`);
        setIsSubmitting(false);
        return;
      }
      if (!categorias.includes(categoria)) {
        setMessage(`Categoria inválida. Escolha: ${categorias.join(', ')}`);
        setIsSubmitting(false);
        return;
      }
  
      try {
        const imagensJSON = JSON.stringify(imagens);
        await api.post('/produtos', {
          nome,
          descricao,
          preco: parseFloat(preco),
          imagem: imagensJSON,
          quantidade: parseInt(quantidade, 10),
          tamanho,
          cor,
          categoria,
          ocasiao,
        });
  
        setMessage('Produto criado com sucesso!');
        // Reset dos campos
        setNome('');
        setDescricao('');
        setPreco('');
        setImagens([]);
        setQuantidade('');
        setTamanho('');
        setCor('');
        setCategoria('');
        setOcasiao('');
      } catch (error) {
        console.error('Erro ao criar produto:', error);
        setMessage(error.response?.data?.message || 'Erro ao criar produto');
      } finally {
        setIsSubmitting(false);
      }
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
        {abaAtiva === "pedidos" && (

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
          )}
          {abaAtiva === "estoque" && (
            <div className={styles.formContainer}>
            <h2>Lista de Produtos</h2>
            {produtos.length === 0 ? (
                <p>
                    {loading
                        ? "Carregando..."
                        : "Ainda não há nenhum produto por aqui."
                    }
                </p>
            ) : (
                produtos.map(produto => (
                  <div key={produto.id} className={stylesEstoque.produtoContainer}>
                    {editando === produto.id ? (
                      <div className={stylesEstoque.formContainer}>
                        <h2>Editar Produto</h2>
                        <form>
                          <div className={stylesEstoque.formGroup}>
                            <label>Nome:</label>
                            <input
                              name="nome"
                              value={formData.nome}
                              onChange={handleChange}
                              className={stylesEstoque.inputField}
                            />
                          </div>
            
                          <div className={stylesEstoque.formGroup}>
                            <label>Descrição:</label>
                            <input
                              name="descricao"
                              value={formData.descricao}
                              onChange={handleChange}
                              className={stylesEstoque.inputField}
                            />
                          </div>
            
                          <div className={stylesEstoque.formGroup}>
                            <label>Preço:</label>
                            <input
                              type="number"
                              name="preco"
                              value={formData.preco}
                              onChange={handleChange}
                              step="0.01"
                              className={stylesEstoque.inputField}
                            />
                          </div>
            
                          <div className={stylesEstoque.formGroup}>
                            <label>Quantidade:</label>
                            <input
                              type="number"
                              name="quantidade"
                              value={formData.quantidade}
                              onChange={handleChange}
                              className={stylesEstoque.inputField}
                            />
                          </div>
            
                          <div className={stylesEstoque.formGroup}>
                            <label>Imagens:</label>
                            <input
                              type="file"
                              multiple
                              onChange={handleImageChange}
                              className={stylesEstoque.fileInput}
                              disabled={formData.imagens.length >= 5}
                            />
                            <div className={stylesEstoque.galeria}>
                              {formData.imagens.map((imagem, index) => (
                                <div key={index} className={stylesEstoque.imageContainer}>
                                  <img
                                    src={imagem}
                                    alt={`Imagem ${index + 1}`}
                                    className={stylesEstoque.imagePreview}
                                  />
                                  <button
                                    type="button"
                                    className={stylesEstoque.removeButton}
                                    onClick={() => handleRemoveImageCadastro(index)}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
            
                          <div className={stylesEstoque.buttonGroup}>
                            <button
                              type="button"
                              className={stylesEstoque.primaryButton}
                              onClick={() => handleAtualizar(produto.id)}
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              className={stylesEstoque.secondaryButton}
                              onClick={() => setEditando(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      </div>
                      ) : (
                        <div>
                          <h3><strong>{produto.nome}</strong></h3>
                          <p><strong>Descrição:</strong> {produto.descricao}</p>
                          <p><strong>Preço:</strong> R$ {produto.preco}</p>
                          <p><strong>Quantidade:</strong> {produto.quantidade}</p>
                          <div className={stylesEstoque.galeria}>
                            {parseImagensEstoque(produto.imagem).map((imagem, index) => (
                              <img
                                key={index}
                                src={imagem}
                                alt={`${produto.nome} - Imagem ${index + 1}`}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ))}
                          </div>
                          <div>
                            <button onClick={() => abrirEdicao(produto)}>Editar</button>
                            <button onClick={() => handleExcluir(produto.id, produto.nome)}>Excluir</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                  )}
            </div>
          )}
          {abaAtiva === "cadastro" && (
            <div className={styles.formContainer}>
            <h2>Cadastro de Produtos</h2>
            <form onSubmit={handleSubmit} className={stylesCadastro.form}>
              {/* Nome */}
              <div className={stylesCadastro.formGroup}>
                <label className={stylesCadastro.label}>Nome<span className={stylesCadastro.required}>*</span>:</label>
                <input
                  className={stylesCadastro.input}
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                />
              </div>
    
              {/* Descrição */}
              <div className={stylesCadastro.formGroup}>
                <label className={stylesCadastro.label}>Descrição:</label>
                <input
                  className={stylesCadastro.input}
                  type="text"
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                />
              </div>
    
              {/* Preço */}
              <div className={stylesCadastro.formGroup}>
                <label className={stylesCadastro.label}>Preço<span className={stylesCadastro.required}>*</span>:</label>
                <input
                  className={stylesCadastro.input}
                  type="number"
                  step="0.01"
                  value={preco}
                  onChange={e => setPreco(e.target.value)}
                />
              </div>
    
              {/* Quantidade */}
              <div className={stylesCadastro.formGroup}>
                <label className={stylesCadastro.label}>Quantidade<span className={stylesCadastro.required}>*</span>:</label>
                <input
                  className={stylesCadastro.input}
                  type="number"
                  value={quantidade}
                  onChange={e => setQuantidade(e.target.value)}
                />
              </div>
    
              {/* Tamanho */}
              <div className={stylesCadastro.formGroup}>
                <label className={stylesCadastro.label}>Tamanho<span className={stylesCadastro.required}>*</span>:</label>
                <select
                  className={stylesCadastro.select}
                  value={tamanho}
                  onChange={e => setTamanho(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {tamanhosValidos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
    
              {/* Cor */}
              <div className={stylesCadastro.formGroup}>
                <label className={stylesCadastro.label}>Cor<span className={stylesCadastro.required}>*</span>:</label>
                <select
                  className={stylesCadastro.select}
                  value={cor}
                  onChange={e => setCor(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {coresValidas.map(c => <option key={c} value={c}>{c.charAt(0)+c.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
    
              {/* Categoria */}
              <div className={stylesCadastro.formGroup}>
                <label className={stylesCadastro.label}>Categoria<span className={stylesCadastro.required}>*</span>:</label>
                <select
                  className={stylesCadastro.select}
                  value={categoria}
                  onChange={e => setCategoria(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {categorias.map(cat => <option key={cat} value={cat}>{cat.charAt(0)+cat.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
    
              {/* Ocasião */}
              <div className={stylesCadastro.formGroup}>
                <label className={stylesCadastro.label}>Ocasião 'opicional'<span className={stylesCadastro.required}>*</span>:</label>
                <select
                  className={stylesCadastro.select}
                  value={ocasiao}
                  onChange={e => setOcasiao(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {ocasioes.map(o => <option key={o} value={o}>{o.charAt(0)+o.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
    
              {/* Imagens */}
              <div className={stylesCadastro.formGroup}>
                <label className={stylesCadastro.label}>Imagens (máx. 5)<span className={stylesCadastro.required}>*</span>:</label>
                <input
                  className={stylesCadastro.fileInput}
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={imagens.length >= 5}
                  onChange={handleImageChange}
                />
                <div className={stylesCadastro.imageGallery}>
                  {imagens.map((img, idx) => (
                    <div key={idx} className={stylesCadastro.imageItem}>
                      <img src={img} alt={`Preview ${idx}`} className={stylesCadastro.thumb} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className={stylesCadastro.removeButton}
                        aria-label="Remover imagem"
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
    
              {/* Botão de envio e mensagem */}
              <button type="submit" className={stylesCadastro.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Criar Produto'}
              </button>
              {message && <p className={stylesCadastro.message}>{message}</p>}
            </form>
            </div>
          )}
      </PageContainer>
      <Footer />
    </div>
    
  );
};

export default Pedidos;