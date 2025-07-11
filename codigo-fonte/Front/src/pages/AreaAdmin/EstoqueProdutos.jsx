import { useState, useEffect } from 'react';
import api from '../../services/api';
import stylesEstoque from './EstoqueProdutos.module.css';
import Compressor from 'compressorjs';

const EstoqueProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    quantidade: '',
    imagens: []
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/produtos');
        setProdutos(response.data);
        console.log("Produtos carregados:", response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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
      await api.delete(`/produtos/${id}`);
      setProdutos(produtos.filter(produto => produto.id !== id));
      console.log(`Produto "${nome}" excluído com sucesso!`);
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

      if (response.status === 200) {
        const produtoAtualizado = response.data;
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

  return (
    <div className={stylesEstoque.formContainer}>
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
                            onClick={() => handleRemoveImage(index)}
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
  );
};

export default EstoqueProdutos;
