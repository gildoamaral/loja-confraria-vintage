import React, { useEffect, useState } from 'react';
import Styles from './Home.module.css';
import Compressor from 'compressorjs';

const HomeProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    quantidade: '',
    imagens: []
  });

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await fetch('http://localhost:3000/produtos');
        const data = await response.json();
        console.log('Produtos carregados:', data);
        setProdutos(data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };
    fetchProdutos();
  }, []);

  // Função de parsing para lidar com imagem já sendo array ou string JSON
  const parseImagens = (imagemData) => {
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
      await fetch(`http://localhost:3000/produtos/${id}`, {
        method: 'DELETE'
      });
      setProdutos(produtos.filter(produto => produto.id !== id));
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

      const response = await fetch(`http://localhost:3000/produtos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosAtualizados)
      });

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

  return (
    <div>
    <h1>Lista de Produtos</h1>
    {produtos.map(produto => (
      <div key={produto.id} className={Styles.produtoContainer}>
        {editando === produto.id ? (
          <div className={Styles.formContainer}>
            <h2>Editar Produto</h2>
            <form>
              <div className={Styles.formGroup}>
                <label>Nome:</label>
                <input
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className={Styles.inputField}
                />
              </div>

              <div className={Styles.formGroup}>
                <label>Descrição:</label>
                <input
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  className={Styles.inputField}
                />
              </div>

              <div className={Styles.formGroup}>
                <label>Preço:</label>
                <input
                  type="number"
                  name="preco"
                  value={formData.preco}
                  onChange={handleChange}
                  step="0.01"
                  className={Styles.inputField}
                />
              </div>

              <div className={Styles.formGroup}>
                <label>Quantidade:</label>
                <input
                  type="number"
                  name="quantidade"
                  value={formData.quantidade}
                  onChange={handleChange}
                  className={Styles.inputField}
                />
              </div>

              <div className={Styles.formGroup}>
                <label>Imagens:</label>
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className={Styles.fileInput}
                  disabled={formData.imagens.length >= 5}
                />
                <div className={Styles.galeria}>
                  {formData.imagens.map((imagem, index) => (
                    <div key={index} className={Styles.imageContainer}>
                      <img
                        src={imagem}
                        alt={`Imagem ${index + 1}`}
                        className={Styles.imagePreview}
                      />
                      <button
                        type="button"
                        className={Styles.removeButton}
                        onClick={() => handleRemoveImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={Styles.buttonGroup}>
                <button
                  type="button"
                  className={Styles.primaryButton}
                  onClick={() => handleAtualizar(produto.id)}
                >
                  Salvar
                </button>
                <button
                  type="button"
                  className={Styles.secondaryButton}
                  onClick={() => setEditando(null)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
          ) : (
            <div>
              <h2><strong>{produto.nome}</strong></h2>
              <p><strong>Descrição:</strong> {produto.descricao}</p>
              <p><strong>Preço:</strong> R$ {produto.preco}</p>
              <p><strong>Quantidade:</strong> {produto.quantidade}</p>
              <div className={Styles.galeria}>
                {parseImagens(produto.imagem).map((imagem, index) => (
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
      ))}
    </div>
  );
};

export default HomeProdutos;
