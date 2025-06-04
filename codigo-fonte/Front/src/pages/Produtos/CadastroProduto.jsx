import React, { useState } from 'react';
import api from '../../services/api';
import Styles from './CadastroProduto.module.css';
import Compressor from 'compressorjs';
import Header from '../../components/Header1';
import Footer from '../../components/Footer';
import PageContainer from '../../components/PageContainer';

// Definição de enums como arrays
const categorias = ['SAIA', 'SHORT', 'CALÇA', 'BLUSA', 'CAMISA', 'CONJUNTOS', 'VESTIDO'];
const ocasioes = ['CASAMENTO', 'BATIZADO', 'MADRINHAS', 'FORMATURA'];
const tamanhosValidos = ['P', 'M', 'G', 'GG'];
const coresValidas = ['VERMELHO', 'AZUL', 'AMARELO', 'VERDE', 'PRETO', 'BRANCO', 'ROSA'];

const CadastroProduto = () => {
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

  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    if (files.length + imagens.length > 5) {
      setMessage('Máximo de 5 imagens permitidas');
      return;
    }

    const compressedImages = [];
    files.forEach(file => {
      new Compressor(file, {
        quality: 0.6,
        success(result) {
          const reader = new FileReader();
          reader.onload = () => {
            compressedImages.push(reader.result);
            if (compressedImages.length === files.length) {
              setImagens(prev => [...prev, ...compressedImages]);
            }
          };
          reader.readAsDataURL(result);
        },
        error(err) {
          console.error('Erro ao comprimir imagem:', err);
          setMessage('Erro ao processar imagens');
        },
      });
    });
  };

  const handleRemoveImage = idx => setImagens(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validação de campos
    if (
      !nome ||
      !preco ||
      imagens.length === 0 ||
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
    <div className={Styles.cadastroContainer}>
      <Header />
      
      <PageContainer className={Styles.formContainer}>
        <h2 className={Styles.formTitle}>Criar Produto</h2>
        <form onSubmit={handleSubmit} className={Styles.form}>
          {/* Nome */}
          <div className={Styles.formGroup}>
            <label className={Styles.label}>Nome<span className={Styles.required}>*</span>:</label>
            <input
              className={Styles.input}
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div className={Styles.formGroup}>
            <label className={Styles.label}>Descrição:</label>
            <input
              className={Styles.input}
              type="text"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
            />
          </div>

          {/* Preço */}
          <div className={Styles.formGroup}>
            <label className={Styles.label}>Preço<span className={Styles.required}>*</span>:</label>
            <input
              className={Styles.input}
              type="number"
              step="0.01"
              value={preco}
              onChange={e => setPreco(e.target.value)}
            />
          </div>

          {/* Quantidade */}
          <div className={Styles.formGroup}>
            <label className={Styles.label}>Quantidade<span className={Styles.required}>*</span>:</label>
            <input
              className={Styles.input}
              type="number"
              value={quantidade}
              onChange={e => setQuantidade(e.target.value)}
            />
          </div>

          {/* Tamanho */}
          <div className={Styles.formGroup}>
            <label className={Styles.label}>Tamanho<span className={Styles.required}>*</span>:</label>
            <select
              className={Styles.select}
              value={tamanho}
              onChange={e => setTamanho(e.target.value)}
            >
              <option value="">Selecione</option>
              {tamanhosValidos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Cor */}
          <div className={Styles.formGroup}>
            <label className={Styles.label}>Cor<span className={Styles.required}>*</span>:</label>
            <select
              className={Styles.select}
              value={cor}
              onChange={e => setCor(e.target.value)}
            >
              <option value="">Selecione</option>
              {coresValidas.map(c => <option key={c} value={c}>{c.charAt(0)+c.slice(1).toLowerCase()}</option>)}
            </select>
          </div>

          {/* Categoria */}
          <div className={Styles.formGroup}>
            <label className={Styles.label}>Categoria<span className={Styles.required}>*</span>:</label>
            <select
              className={Styles.select}
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
            >
              <option value="">Selecione</option>
              {categorias.map(cat => <option key={cat} value={cat}>{cat.charAt(0)+cat.slice(1).toLowerCase()}</option>)}
            </select>
          </div>

          {/* Ocasião */}
          <div className={Styles.formGroup}>
            <label className={Styles.label}>Ocasião 'opicional'<span className={Styles.required}>*</span>:</label>
            <select
              className={Styles.select}
              value={ocasiao}
              onChange={e => setOcasiao(e.target.value)}
            >
              <option value="">Selecione</option>
              {ocasioes.map(o => <option key={o} value={o}>{o.charAt(0)+o.slice(1).toLowerCase()}</option>)}
            </select>
          </div>

          {/* Imagens */}
          <div className={Styles.formGroup}>
            <label className={Styles.label}>Imagens (máx. 5)<span className={Styles.required}>*</span>:</label>
            <input
              className={Styles.fileInput}
              type="file"
              accept="image/*"
              multiple
              disabled={imagens.length >= 5}
              onChange={handleImageChange}
            />
            <div className={Styles.imageGallery}>
              {imagens.map((img, idx) => (
                <div key={idx} className={Styles.imageItem}>
                  <img src={img} alt={`Preview ${idx}`} className={Styles.thumb} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className={Styles.removeButton}
                    aria-label="Remover imagem"
                  >×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Botão de envio e mensagem */}
          <button type="submit" className={Styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Criar Produto'}
          </button>
          {message && <p className={Styles.message}>{message}</p>}
        </form>
      </PageContainer>
      <Footer />
    </div>
  );
};

export default CadastroProduto;