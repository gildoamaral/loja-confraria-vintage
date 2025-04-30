import React, { useState } from 'react';                                        
import api from '../../services/api';  
import Styles from './CadastroProduto.module.css';                                       
import Compressor from 'compressorjs';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const CadastroProduto = () => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [imagens, setImagens] = useState([]);
  const [quantidade, setQuantidade] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [cor, setCor] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
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
        }
      });
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setImagens(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!nome || !preco || imagens.length === 0 || quantidade === '' || !tamanho || !cor) {
      setMessage('Preencha todos os campos obrigatórios');
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
      });

      setMessage('Produto criado com sucesso!');
      setNome('');
      setDescricao('');
      setPreco('');
      setImagens([]);
      setQuantidade('');
      setTamanho('');
      setCor('');
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
      <main className={Styles.formContainer}>
        <h2 className={Styles.formTitle}>Criar Produto</h2>
        <form onSubmit={handleSubmit} className={Styles.form}>
          <div className={Styles.formGroup}>
            <label className={Styles.label}>
              Nome<span className={Styles.required}>*</span>:
            </label>
            <input
              className={Styles.input}
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
          </div>
          <div className={Styles.formGroup}>
            <label className={Styles.label}>Descrição:</label>
            <input
              className={Styles.input}
              type="text"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
            />
          </div>
          <div className={Styles.formGroup}>
            <label className={Styles.label}>
              Preço<span className={Styles.required}>*</span>:
            </label>
            <input
              className={Styles.input}
              type="number"
              step="0.01"
              value={preco}
              onChange={e => setPreco(e.target.value)}
              required
            />
          </div>
          <div className={Styles.formGroup}>
            <label className={Styles.label}>
              Quantidade<span className={Styles.required}>*</span>:
            </label>
            <input
              className={Styles.input}
              type="number"
              value={quantidade}
              onChange={e => setQuantidade(e.target.value)}
              required
            />
          </div>
          <div className={Styles.formGroup}>
            <label className={Styles.label}>
              Tamanho<span className={Styles.required}>*</span>:
            </label>
            <select
              className={Styles.select}
              value={tamanho}
              onChange={e => setTamanho(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {['P','M','G','GG'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className={Styles.formGroup}>
            <label className={Styles.label}>
              Cor<span className={Styles.required}>*</span>:
            </label>
            <select
              className={Styles.select}
              value={cor}
              onChange={e => setCor(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {['VERMELHO','AZUL','AMARELO','VERDE','PRETO','BRANCO','ROSA'].map(c => (
                <option key={c} value={c}>{c.charAt(0)+c.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div className={Styles.formGroup}>
            <label className={Styles.label}>
              Imagens (máx. 5)<span className={Styles.required}>*</span>:
            </label>
            <input
              className={Styles.fileInput}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              multiple
              disabled={imagens.length >= 5}
            />
            <div className={Styles.imageGallery}>
              {imagens.map((img, idx) => (
                <div className={Styles.imageItem} key={idx}>
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

          <button type="submit" className={Styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Criar Produto'}
          </button>

          {message && <p className={Styles.message}>{message}</p>}
        </form>
      </main>
      <Footer />
    </div>

  );
};

export default CadastroProduto;