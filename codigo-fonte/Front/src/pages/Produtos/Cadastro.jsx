import React, { useState } from 'react';
import axios from 'axios';

const CadastroProduto = () => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome || !preco || !imagem || quantidade === '') {
      setMessage('Campos obrigatórios faltando');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/produtos', {
        nome,
        descricao,
        preco: parseFloat(preco),
        imagem,
        quantidade: parseInt(quantidade, 10)
      });
      setMessage('Produto criado com sucesso!');
      setNome('');
      setDescricao('');
      setPreco('');
      setImagem('');
      setQuantidade('');
    } catch (error) {
      console.error('Erro ao criar produto:', error.response ? error.response.data : error.message);
      setMessage('Erro ao criar produto');
    }
  };

  return (
    <div>
      <h2>Criar Produto</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input 
            type="text" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
          />
        </div>
        <div>
          <label>Descrição:</label>
          <input 
            type="text" 
            value={descricao} 
            onChange={(e) => setDescricao(e.target.value)} 
          />
        </div>
        <div>
          <label>Preço:</label>
          <input 
            type="number" 
            step="0.01" 
            value={preco} 
            onChange={(e) => setPreco(e.target.value)} 
          />
        </div>
        <div>
          <label>Imagem (URL):</label>
          <input 
            type="text" 
            value={imagem} 
            onChange={(e) => setImagem(e.target.value)} 
          />
        </div>
        <div>
          <label>Quantidade:</label>
          <input 
            type="number" 
            value={quantidade} 
            onChange={(e) => setQuantidade(e.target.value)} 
          />
        </div>
        <button type="submit">Criar Produto</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CadastroProduto;
