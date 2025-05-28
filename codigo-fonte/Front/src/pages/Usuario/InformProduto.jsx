import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Styles from './InformProduto.module.css';
import api from '../../services/api';
import Footer from '../../components/Footer';
import Header from '../../components/header';
import { useCarrinho } from '../../context/useCarrinho';
import { useNavigate } from 'react-router-dom';

const InformProduto = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [selectedTamanho, setSelectedTamanho] = useState('');
  const [selectedCor, setSelectedCor] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [cepDestino, setCepDestino] = useState('');
  const [freteOptions, setFreteOptions] = useState([]);
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [selectedFrete, setSelectedFrete] = useState(null);
  const { adicionarAoCarrinho } = useCarrinho();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await api.get(`/produtos/${id}`);
        setProducto(response.data);
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
      }
    };
    fetchProducto();
  }, [id]);

  const parseImagens = (imagemData) => {
    if (!imagemData) return [];
    try {
      return Array.isArray(imagemData) ? imagemData : JSON.parse(imagemData);
    } catch {
      return [imagemData];
    }
  };

  const handleAddToCart = () => {
    if (!selectedTamanho || !selectedCor) {
      alert('Por favor selecione o tamanho e a cor');
      return;
    }

    if (!selectedFrete) {
      alert('Por favor selecione uma opção de frete');
      return;
    }

    // Calcula preço total do produto e frete
    const precoProduto = parseFloat(producto.preco);
    const precoFrete = parseFloat(selectedFrete.price || selectedFrete.valor);
    const totalProduto = precoProduto * quantidade;
    const precoTotalComFrete = totalProduto + precoFrete;

    const productToAdd = {
      ...producto,
      quantidade,
      tamanho: selectedTamanho,
      cor: selectedCor,
      frete: {
        id: selectedFrete.id || selectedFrete.codigo,
        name: selectedFrete.name || selectedFrete.codigo,
        price: precoFrete,
        prazo: selectedFrete.delivery_time || selectedFrete.prazoEntrega,
      },
      subtotal: totalProduto,
      totalComFrete: precoTotalComFrete,
    };

    try {
      adicionarAoCarrinho(productToAdd);
      alert(`Produto (R$ ${totalProduto.toFixed(2).replace('.', ',')}) + frete (R$ ${precoFrete.toFixed(2).replace('.', ',')}) adicionados ao carrinho! Total: R$ ${precoTotalComFrete.toFixed(2).replace('.', ',')}`);
      navigate('/carrinho');
    } catch (error) {
      alert('Erro ao adicionar produto ao carrinho');
      console.error('Erro ao adicionar produto ao carrinho:', error);
    }
  };

  const calcularFrete = async () => {
    if (!cepDestino.match(/^\d{5}-?\d{3}$/)) {
      alert('Informe um CEP válido (8 dígitos).');
      return;
    }
    if (!producto) return;
    setLoadingFrete(true);
    try {
      const body = {
        cepDestino,
        altura: 4,
        largura: 12,
        comprimento: 17,
        peso: 0.3
      };
      const response = await api.post('/frete', body);
      // ordenar e filtrar os 5 fretes mais baratos
      const sorted = response.data
        .sort((a, b) => parseFloat(a.price || a.valor) - parseFloat(b.price || b.valor))
        .slice(0, 5);
      setFreteOptions(sorted);
      setSelectedFrete(null);
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      alert('Não foi possível calcular o frete.');
    } finally {
      setLoadingFrete(false);
    }
  };

  const renderOptions = (options, selectedValue, onChange, type) => (
    <div className={Styles.optionGroup}>
      <h4>{type === 'cor' ? 'Cor:' : 'Tamanho:'}</h4>
      <div className={type === 'cor' ? Styles.colorOptions : Styles.sizeOptions}>
        {options.map(option => {
          const cleanedOption = option.trim().toUpperCase();
          return (
            <button
              key={cleanedOption}
              className={`${type === 'cor' ? Styles.colorOption : Styles.sizeOption} ${selectedValue === cleanedOption ? Styles.selected : ''} ${type === 'cor' ? Styles[cleanedOption.toLowerCase()] : ''}`}
              onClick={() => onChange(cleanedOption)}
            >
              {type === 'cor' ? '' : cleanedOption}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (!producto) return (
    <div>
      <Header />
      <div className={Styles.loading}><div className={Styles.hourglass}><span></span></div></div>
      <Footer />
    </div>
  );

  return (
    <div>
      <Header />
      <div className={Styles.container}>
        <div className={Styles.breadcrumb}><span>{producto.nome}</span></div>
        <div className={Styles.productWrapper}>
          <div className={Styles.gallery}>
            <div className={Styles.mainImage}>
              <img src={parseImagens(producto.imagem)[activeImageIndex]} alt={producto.nome} />
            </div>
            <div className={Styles.thumbnails}>
              {parseImagens(producto.imagem).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Vista ${index + 1}`}
                  className={`${Styles.thumbnail} ${index === activeImageIndex ? Styles.activeThumbnail : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                />
              ))}
            </div>
          </div>

          <div className={Styles.productInfo}>
            <h1 className={Styles.productTitle}>{producto.nome}</h1>
            <p className={Styles.productPrice}>R$ {Number(producto.preco).toFixed(2).replace('.', ',')}</p>
            <div className={Styles.productDescription}><p>{producto.descricao}</p></div>

            {renderOptions(producto.cor.split(','), selectedCor, setSelectedCor, 'cor')}
            {renderOptions(producto.tamanho.split(','), selectedTamanho, setSelectedTamanho, 'tamanho')}

            <div className={Styles.quantitySelector}>
              <h4>Quantidade:</h4>
              <div className={Styles.quantityControls}>
                <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} disabled={quantidade === 1}>-</button>
                <span>{quantidade}</span>
                <button onClick={() => setQuantidade(quantidade + 1)}>+</button>
              </div>
            </div>

            <div className={Styles.freteSection}>
              <h4>Calcular</h4>
              <div className={Styles.freteCalcRow}>
                <input
                  type="text"
                  placeholder="Digite seu CEP"
                  value={cepDestino}
                  onChange={e => setCepDestino(e.target.value)}
                  className={Styles.cepInput}
                />
                <button onClick={calcularFrete} disabled={loadingFrete} className={Styles.calcFreteButton}>
                  {loadingFrete ? 'Calculando...' : 'Calcular Frete'}
                </button>
              </div>

              {freteOptions.length > 0 && (
                <ul className={Styles.freteList}>
                  {freteOptions.map(opt => (
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

            <button className={Styles.addToCartButton} onClick={handleAddToCart}>Adicionar ao Carrinho</button>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InformProduto;
