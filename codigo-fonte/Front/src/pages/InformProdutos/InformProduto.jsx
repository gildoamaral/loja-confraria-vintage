import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Styles from './InformProduto.module.css';
import api from '../../services/api';
import PageContainer from '../../components/PageContainer';
import CircularProgress from '@mui/material/CircularProgress';
import { MdLocalShipping } from 'react-icons/md';
import Loading from '../../components/Loading';

const InformProduto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [produto, setProduto] = useState(null);
  const [selectedTamanho, setSelectedTamanho] = useState('');
  const [selectedCor, setSelectedCor] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [cepDestino, setCepDestino] = useState('');
  const [freteOptions, setFreteOptions] = useState([]);
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [selectedFrete, setSelectedFrete] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/produtos/${id}`)
      .then(({ data }) => {
        setProduto(data)
        console.log('Produto carregado:', data);
      })
      .catch(err => console.error('Erro ao buscar produto:', err));

  }, [id]);

  useEffect(() => {
    if (produto) {
      if (produto.cor) {
        const primeiraCor = produto.cor.split(',')[0].trim().toUpperCase();
        setSelectedCor(primeiraCor);
      }
      if (produto.tamanho) {
        const primeiroTamanho = produto.tamanho.split(',')[0].trim().toUpperCase();
        setSelectedTamanho(primeiroTamanho);
      }
    }
  }, [produto]);

  if (!produto) {
    return (
      <>
        <PageContainer>
          <Loading />
        </PageContainer>
      </>
    );
  }

  const calcularFrete = async () => {
    if (!cepDestino.match(/^\d{5}-?\d{3}$/)) {
      alert('Informe um CEP válido (8 dígitos).');
      return;
    }
    setLoadingFrete(true);
    try {
      const body = { cepDestino, altura: 4, largura: 12, comprimento: 17, peso: 0.3 };
      const response = await api.post('/frete', body);
      const sorted = response.data
        .sort((a, b) => parseFloat(a.price || a.valor) - parseFloat(b.price || b.valor))
        .slice(0, 5);
      setFreteOptions(sorted);
      setSelectedFrete(null);
    } catch (err) {
      console.error('Erro ao calcular frete:', err);
      alert('Não foi possível calcular o frete.');
    } finally {
      setLoadingFrete(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedTamanho || !selectedCor) {
      alert('Por favor selecione o tamanho e a cor');
      return;
    }

    const item = {
      produtoId: produto.id,
      quantidade,
      tamanho: selectedTamanho,
      cor: selectedCor,

    };

    setLoading(true);
    try {
      await api.post('/pedidos/criar', item);

      window.dispatchEvent(new Event('cartUpdated'));
      
      alert('Produto adicionado ao carrinho com sucesso!');

    } catch (error) {
      if (error.response && error.response.status === 401) {

        alert('Faça login para adicionar ao carrinho.');
        navigate('/login');
        return;
      }

      alert('Erro ao adicionar produto ao carrinho');
      console.error('Erro ao adicionar produto ao carrinho:', error);
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  const renderOptions = (options, selectedValue, onChange, type) => (
    <div className={Styles.optionGroup}>
      <h4>{type === 'cor' ? 'Cor:' : 'Tamanho:'}</h4>
      <div className={type === 'cor' ? Styles.colorOptions : Styles.sizeOptions}>
        {options.map(opt => {
          const key = opt.trim().toUpperCase();
          return (
            <button
              key={key}
              className={`${type === 'cor' ? Styles.colorOption : Styles.sizeOption} ${selectedValue === key ? Styles.selected : ''} ${type === 'cor' ? Styles[key.toLowerCase()] : ''}`}
              onClick={() => onChange(key)}
            >
              {type === 'tamanho' ? key : ''}
            </button>
          );
        })}
      </div>
    </div>
  );

  const imagensDoProduto = produto.imagens?.sort((a, b) => a.posicao - b.posicao) || [];

  return (
    <div>
      <PageContainer className={Styles.container}>

        <div className={Styles.productWrapper}>

          {/* ESQUERDA */}
          <div className={Styles.gallery}>
            <div className={Styles.mainImage}>
              {imagensDoProduto.length > 0 && (
                <img src={imagensDoProduto[activeImageIndex].urls.large} alt={produto.nome} />
              )}
            </div>

            <div className={Styles.thumbnails}>
              {imagensDoProduto.map((imagem, idx) => (
                <img
                  key={imagem.id}
                  src={imagem.urls.thumbnail}
                  alt={`Vista ${idx + 1}`}
                  className={`${Styles.thumbnail} ${idx === activeImageIndex ? Styles.activeThumbnail : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                />
              ))}
            </div>
          </div>

          {/* DIREITA */}
          <div className={Styles.productInfo}>
            <div className={Styles.quad1}>
              <p style={{ marginBottom: "0.7rem", fontSize: "0.8rem" }}>{produto.categoria} {produto.ocasiao ? `| ${produto.ocasiao}` : ""} </p>
              <h1 className={Styles.productTitle}>{produto.nome}</h1>
              <p className={Styles.productPrice}>R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}</p>
              <div className={Styles.productDescription}><p>{produto.descricao}</p></div>
            </div>

            <div className={Styles.quad2}>
              {renderOptions(produto.cor.split(','), selectedCor, setSelectedCor, 'cor')}
              {renderOptions(produto.tamanho.split(','), selectedTamanho, setSelectedTamanho, 'tamanho')}

              <div className={Styles.quantitySelector}>
                <h4>Quantidade:</h4>
                <div className={Styles.quantityControls}>
                  <button onClick={() => setQuantidade(q => Math.max(1, q - 1))} disabled={quantidade === 1}>-</button>
                  <span>{quantidade}</span>
                  <button onClick={() => setQuantidade(q => q + 1)}>+</button>
                </div>
              </div>

              <div className={Styles.addPayButtons}>
                <button className={Styles.addToCartButton} onClick={handleAddToCart} disabled={loading}>
                  Adicionar ao Carrinho
                </button>
              </div>

            </div>


            {loading && <CircularProgress style={{ marginTop: 16 }} />}

            <div className={Styles.freteSection}>
              <h4>
                <MdLocalShipping style={{ fontSize: 22, verticalAlign: 'middle', marginRight: 10 }} />
                Calcular Frete
              </h4>
              <div className={Styles.freteCalcRow}>
                <input
                  type="text"
                  placeholder="Digite seu CEP"
                  value={cepDestino}
                  onChange={e => setCepDestino(e.target.value)}
                  className={Styles.cepInput}
                />
                <button onClick={calcularFrete} disabled={loadingFrete} className={Styles.calcFreteButton}>
                  {loadingFrete ? 'Calculando...' : 'Calcular'}
                </button>
              </div>
              {freteOptions.length > 0 && (
                <ul className={Styles.freteList}> {freteOptions.map(opt => (
                  <li
                    key={opt.id || opt.codigo}
                    className={`${Styles.freteItem} ${selectedFrete === opt ? Styles.selectedFreteItem : ''}`}
                    onClick={() => setSelectedFrete(opt)}
                  >
                    <img src={opt.company.picture} alt={opt.company.name} className={Styles.freteLogo} />
                    <strong>{opt.name || opt.codigo}</strong>
                    <span className={Styles.price}>R$ {parseFloat(opt.price || opt.valor).toFixed(2).replace('.', ',')}</span>
                    <span className={Styles.deliveryTime}>{opt.delivery_time || opt.prazoEntrega} dias</span>
                  </li>
                ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default InformProduto;
