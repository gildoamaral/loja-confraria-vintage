import React, { useEffect, useState } from 'react';
import Styles from './Home.module.css';

const HomeProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    quantidade: '',
    imagem: ''
  });

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await fetch('http://localhost:3000/produtos');
        const data = await response.json();
        setProdutos(data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };
    fetchProdutos();
  }, []);

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
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco.toString(),
      quantidade: produto.quantidade.toString(),
      imagem: produto.imagem
    });
  };

  const handleAtualizar = async (id) => {
    try {
      const dadosAtualizados = {
        ...formData,
        preco: parseFloat(formData.preco),
        quantidade: parseInt(formData.quantidade, 10)
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
        setProdutos(produtos.map(produto =>
          produto.id === id ? produtoAtualizado : produto
        ));
        setEditando(null);
      } else {
        console.error('Erro na resposta:', await response.json());
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
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
        <div key={produto.id}>
          {editando === produto.id ? (
            <div>
              <input
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome"
              />
              <input
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descrição"
              />
              <input
                type="number"
                name="preco"
                value={formData.preco}
                onChange={handleChange}
                placeholder="Preço"
                step="0.01"
              />
              <input
                type="number"
                name="quantidade"
                value={formData.quantidade}
                onChange={handleChange}
                placeholder="Quantidade"
              />
              <input
                name="imagem"
                value={formData.imagem}
                onChange={handleChange}
                placeholder="URL da Imagem"
              />
              <div>
                <button onClick={() => handleAtualizar(produto.id)}>
                  Salvar
                </button>
                <button onClick={() => setEditando(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2><strong>Nome:</strong> {produto.nome}</h2>
              <p><strong>Descrição:</strong> {produto.descricao}</p>
              <p><strong>Preço:</strong> R$ {produto.preco}</p>
              <p><strong>Quantidade:</strong> {produto.quantidade}</p>
              <div>
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                />
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
