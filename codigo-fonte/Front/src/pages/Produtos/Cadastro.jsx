import React, { useState } from 'react';
import axios from 'axios';

const CadastroProduto = () => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [cor, setCor] = useState('');
  const [message, setMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagem(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome || !preco || !imagem || quantidade === '' || !tamanho || !cor) {
      setMessage('Campos obrigatórios faltando');
      return;
    }

    try {
      await axios.post('http://localhost:3000/produtos', {
        nome,
        descricao,
        preco: parseFloat(preco),
        imagem,
        quantidade: parseInt(quantidade, 10),
        tamanho,
        cor,
      });
      setMessage('Produto criado com sucesso!');
      setNome('');
      setDescricao('');
      setPreco('');
      setImagem('');
      setQuantidade('');
      setTamanho('');
      setCor('');
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
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div>
          <label>Descrição:</label>
          <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>
        <div>
          <label>Preço:</label>
          <input type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} />
        </div>
        <div>
          <label>Quantidade:</label>
          <input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
        </div>
        <div>
          <label>Tamanho:</label>
          <select value={tamanho} onChange={(e) => setTamanho(e.target.value)}>
            <option value="">Selecione</option>
            <option value="P">P</option>
            <option value="M">M</option>
            <option value="G">G</option>
            <option value="GG">GG</option>
          </select>
        </div>
        <div>
          <label>Cor:</label>
          <select value={cor} onChange={(e) => setCor(e.target.value)}>
            <option value="">Selecione</option>
            <option value="VERMELHO">Vermelho</option>
            <option value="AZUL">Azul</option>
            <option value="AMARELO">Aamarelo</option>
            <option value="VERDE">Verde</option>
            <option value="PRETO">Preto</option>
            <option value="BRANCO">Branco</option>
            <option value="ROSA">Rosa</option>
          </select>
        </div>
        <div>
          <label>Imagem:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagem && <img src={imagem} alt="Preview" style={{ width: '100px', marginTop: '10px' }} />}
        </div>
        <button type="submit">Criar Produto</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CadastroProduto;
