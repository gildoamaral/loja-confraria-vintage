import React, { useState } from 'react';
// import axios from 'axios';                                                  // Não é necessário, pois estamos usando a instância configurada
import api from '../../services/api';                                          // Importando a instância do axios configurada
import Compressor from 'compressorjs';

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

      // await axios.post('http://localhost:3000/produtos', {                  // <--- Não é necessário, pois estamos usando a instância configurada do axios
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
    <div>
      <h2>Criar Produto</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <label>Descrição:</label>
          <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>
        <div>
          <label>Preço:</label>
          <input type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} required />
        </div>
        <div>
          <label>Quantidade:</label>
          <input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required />
        </div>
        <div>
          <label>Tamanho:</label>
          <select value={tamanho} onChange={(e) => setTamanho(e.target.value)} required>
            <option value="">Selecione</option>
            <option value="P">P</option>
            <option value="M">M</option>
            <option value="G">G</option>
            <option value="GG">GG</option>
          </select>
        </div>
        <div>
          <label>Cor:</label>
          <select value={cor} onChange={(e) => setCor(e.target.value)} required>
            <option value="">Selecione</option>
            <option value="VERMELHO">Vermelho</option>
            <option value="AZUL">Azul</option>
            <option value="AMARELO">Amarelo</option>
            <option value="VERDE">Verde</option>
            <option value="PRETO">Preto</option>
            <option value="BRANCO">Branco</option>
            <option value="ROSA">Rosa</option>
          </select>
        </div>
        <div>
          <label>Imagens (máx. 5):</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            multiple
            disabled={imagens.length >= 5}
          />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            {imagens.map((img, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img
                  src={img}
                  alt={`Preview ${index}`}
                  style={{ width: '100px', height: 'auto', borderRadius: '4px' }}
                />
                <button 
                  type="button"
                  style={{ 
                    position: 'absolute', 
                    top: '0', 
                    right: '0', 
                    backgroundColor: 'black', 
                    color: 'white',
                    border: 'none',  
                    cursor: 'pointer',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => handleRemoveImage(index)}
                  aria-label="Remover imagem"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Criar Produto'}
        </button>
      </form>
      {message && <p style={{ color: message.includes('sucesso') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
};

export default CadastroProduto;