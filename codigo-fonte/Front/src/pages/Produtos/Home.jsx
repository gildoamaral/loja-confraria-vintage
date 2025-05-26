import React, { useEffect, useState } from 'react';
import Styles from './Home.module.css';
import Compressor from 'compressorjs';
import api from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const HomeProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    nome: '',
    descricao: '',
    preco: '',
    precoPromocional: '',  // novo campo
    quantidade: '',
    imagens: []
  });

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await api.get('/produtos');
        console.log('Produtos carregados:', response.data);
        setProdutos(response.data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };
    fetchProdutos();
  }, []);

  const parseImagens = (imagemData) => {
    if (!imagemData) return [];
    if (Array.isArray(imagemData)) return imagemData;
    if (typeof imagemData === 'string') {
      try {
        const parsed = JSON.parse(imagemData);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [imagemData];
      }
    }
    return [];
  };

  const abrirEdicao = (produto) => {
    console.log('Produto selecionado para edição:', produto);
    const imagensParsed = parseImagens(produto.imagem);
    setEditando(produto.id);
    setFormData({
      id: produto.id,
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      preco: produto.preco != null ? produto.preco.toString() : '',
      precoPromocional: produto.precoPromocional != null ? produto.precoPromocional.toString() : '',
      quantidade: produto.quantidade != null ? produto.quantidade.toString() : '',
      imagens: imagensParsed
    });
  };

  const cancelarEdicao = () => {
    setEditando(null);
    setFormData({ id: null, nome: '', descricao: '', preco: '', precoPromocional: '', quantidade: '', imagens: [] });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    let newImages = [...formData.imagens];

    if (files.length + newImages.length > 5) {
      alert('Máximo de 5 imagens permitidas');
      return;
    }

    for (const file of files) {
      await new Promise(resolve => {
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

    setFormData(prev => ({ ...prev, imagens: newImages }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.id != null) {
      await handleAtualizar(formData.id);
    }
  };

  const handleAtualizar = async (id) => {
    try {
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco),
        precoPromocional: formData.precoPromocional !== ''
          ? parseFloat(formData.precoPromocional)
          : null,
        quantidade: parseInt(formData.quantidade, 10),
        imagem: JSON.stringify(formData.imagens)
      };
      const response = await api.put(`/produtos/${id}`, payload);
      const updated = response.data;
      updated.imagem = parseImagens(updated.imagem);
      setProdutos(prev => prev.map(p => p.id === id ? updated : p));
      cancelarEdicao();
      console.log('Produto atualizado:', updated);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
    }
  };

  const handleExcluir = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) {
      try {
        await api.delete(`/produtos/${id}`);
        setProdutos(prev => prev.filter(p => p.id !== id));
        console.log(`Produto "${nome}" excluído com sucesso!`);
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
  };

  return (
    <div>
      <Header />
      <h1>Produtos cadastrados</h1>
      <div className={Styles.listcard}>
        {produtos.map(produto => (
          <div key={produto.id} className={Styles.produtoContainer}>
            {editando === produto.id ? (
              <div className={Styles.formContainer}>
                <h2>Editar Produto</h2>
                <form onSubmit={handleSave}>
                  <div className={Styles.formGroup}>
                    <label htmlFor="nome">Nome:</label>
                    <input
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className={Styles.inputField}
                    />
                  </div>
                  <div className={Styles.formGroup}>
                    <label htmlFor="descricao">Descrição:</label>
                    <input
                      id="descricao"
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleChange}
                      className={Styles.inputField}
                    />
                  </div>
                  <div className={Styles.formGroup}>
                    <label htmlFor="preco">Preço:</label>
                    <input
                      id="preco"
                      type="number"
                      name="preco"
                      value={formData.preco}
                      onChange={handleChange}
                      step="0.01"
                      className={Styles.inputField}
                    />
                  </div>
                  <div className={Styles.formGroup}>
                    <label htmlFor="precoPromocional">Preço Promocional:</label>
                    <input
                      id="precoPromocional"
                      type="number"
                      name="precoPromocional"
                      value={formData.precoPromocional}
                      onChange={handleChange}
                      step="0.01"
                      className={Styles.inputField}
                      placeholder="Opcional"
                    />
                  </div>
                  <div className={Styles.formGroup}>
                    <label htmlFor="quantidade">Quantidade:</label>
                    <input
                      id="quantidade"
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
                      {formData.imagens.map((img, i) => (
                        <div key={i} className={Styles.imageContainer}>
                          <img
                            src={img}
                            alt={`Imagem ${i + 1}`}
                            className={Styles.imagePreview}
                          />
                          <button
                            type="button"
                            className={Styles.removeButton}
                            onClick={() => handleRemoveImage(i)}>
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={Styles.buttonGroup}>
                    <button type="submit" className={Styles.primaryButton}>Salvar</button>
                    <button type="button" className={Styles.cancelButton} onClick={cancelarEdicao}>Cancelar</button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <div className={Styles.galeria}>
                  {parseImagens(produto.imagem).map((img, i) => (
                    <div key={i} className={Styles.imageContainer}>
                      <img
                        src={img}
                        alt={`${produto.nome} ${i + 1}`}
                        className={Styles.imagePreview}
                        onError={e => e.target.style.display = 'none'}
                      />
                    </div>
                  ))}
                </div>
                <h2>{produto.nome}</h2>
                <p className={Styles.priceDisplay}>
                  {produto.precoPromocional != null ? (
                    <>
                      <span className={Styles.originalPrice}> Valor: R${produto.preco.toFixed(2)}</span>
                      <span className={Styles.promoPrice}> Preço promocional: R$ {produto.precoPromocional.toFixed(2)}</span>
                    </>
                  ) : (
                    <span>R$ {produto.preco.toFixed(2)}</span>
                  )}
                </p>
                <p><strong>Quantidade:</strong> {produto.quantidade}</p>

                <div className={Styles.buttonGroup}>
                  <button className={Styles.primaryButton} onClick={() => abrirEdicao(produto)}>Editar</button>
                  <button className={Styles.secondaryButton} onClick={() => handleExcluir(produto.id, produto.nome)}>Excluir</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default HomeProdutos;
