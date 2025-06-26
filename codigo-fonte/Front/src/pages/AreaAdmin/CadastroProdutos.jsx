import { useState } from 'react';
import api from '../../services/api';
import stylesCadastro from '../Produtos/CadastroProduto.module.css';

// Definição de enums como arrays
const categorias = [
  'SAIA', 'SHORT', 'CALÇA', 'BLUSA', 'CAMISA', 'CONJUNTOS', 'VESTIDO',
  'CALCADO', 'ACESSORIOS', 'OUTROS'
];
const coresValidas = [
  'VERMELHO', 'AZUL', 'AMARELO', 'VERDE', 'PRETO', 'BRANCO', 'ROSA',
  'CINZA', 'BEGE', 'ROXO', 'LARANJA', 'MARROM', 'PRATA', 'DOURADO'
];
const ocasioes = ['FESTAS', 'OCASIOES_ESPECIAIS', 'CASUAL'];
const tamanhosValidos = ['P', 'M', 'G', 'GG'];

const CadastroProdutos = () => {
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
      console.log('Imagens JSON:', imagensJSON);
      console.log(imagens)
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

  const getOcasiaoLabel = (ocasiao) => {
    switch (ocasiao) {
      case 'OCASIOES_ESPECIAIS':
        return 'Ocasiões Especiais';
      case 'FESTAS':
        return 'Festas';
      case 'CASUAL':
        return 'Casual';
      default:
        return ocasiao;
    }
  };

  const handleImageChangeCadastro = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagens.length > 5) {
      alert('Máximo de 5 imagens permitidas');
      return;
    }
    const readers = files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(results => {
      setImagens(prev => [...prev, ...results]);
    });
  };

  const handleRemoveImage = (idx) => {
    setImagens(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className={stylesCadastro.formContainer}>
      <h2>Cadastro de Produtos</h2>
      <form onSubmit={handleSubmit} className={stylesCadastro.form}>
        <div className={stylesCadastro.formGroup}>
          <label className={stylesCadastro.label}>Nome<span className={stylesCadastro.required}>*</span>:</label>
          <input
            className={stylesCadastro.input}
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
          />
        </div>

        <div className={stylesCadastro.formGroup}>
          <label className={stylesCadastro.label}>Descrição:</label>
          <textarea
            className={stylesCadastro.inputDescricao}
            type="text"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
          />
        </div>

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

        <div className={stylesCadastro.formGroup}>
          <label className={stylesCadastro.label}>Quantidade<span className={stylesCadastro.required}>*</span>:</label>
          <input
            className={stylesCadastro.input}
            type="number"
            value={quantidade}
            onChange={e => setQuantidade(e.target.value)}
          />
        </div>

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

        <div className={stylesCadastro.formGroup}>
          <label className={stylesCadastro.label}>Cor<span className={stylesCadastro.required}>*</span>:</label>
          <select
            className={stylesCadastro.select}
            value={cor}
            onChange={e => setCor(e.target.value)}
          >
            <option value="">Selecione</option>
            {coresValidas.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
          </select>
        </div>

        <div className={stylesCadastro.formGroup}>
          <label className={stylesCadastro.label}>Categoria<span className={stylesCadastro.required}>*</span>:</label>
          <select
            className={stylesCadastro.select}
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
          >
            <option value="">Selecione</option>
            {categorias.map(cat => <option key={cat} value={cat}>{cat.charAt(0) + cat.slice(1).toLowerCase()}</option>)}
          </select>
        </div>

        <div className={stylesCadastro.formGroup}>
          <label className={stylesCadastro.label}>Ocasião</label>
          <select
            className={stylesCadastro.select}
            value={ocasiao}
            onChange={e => setOcasiao(e.target.value)}
          >
            <option value="">Selecione</option>
            {ocasioes.map(o => (
              <option key={o} value={o}>{getOcasiaoLabel(o)}</option>
            ))}
          </select>
        </div>

        <div className={stylesCadastro.formGroup}>
          <label className={stylesCadastro.label}>Imagens (máx. 5)<span className={stylesCadastro.required}>*</span>:</label>
          <input
            className={stylesCadastro.fileInput}
            type="file"
            accept="image/*"
            multiple
            disabled={imagens.length >= 5}
            onChange={handleImageChangeCadastro}
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

        <button type="submit" className={stylesCadastro.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Criar Produto'}
        </button>
        {message && <p className={stylesCadastro.message}>{message}</p>}
      </form>
    </div>
  );
};

export default CadastroProdutos;
