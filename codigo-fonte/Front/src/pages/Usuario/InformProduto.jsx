import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Styles from './InformProduto.module.css';
import api from '../../services/api';
// import { useCarrinho } from '../../context/useCarrinho';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageContainer from '../../components/PageContainer';

const InformProduto = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [selectedTamanho, setSelectedTamanho] = useState('');
  const [selectedCor, setSelectedCor] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const navigate = useNavigate('/carrinho');

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

  const handleAddToCart = async () => {
    if (!selectedTamanho || !selectedCor) {
      alert('Por favor selecione o tamanho e a cor');
      return;
    }

    // Verifica autenticação antes de adicionar ao carrinho
    try {
      await api.get('/auth/check');
      // Se não der erro, está autenticado
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Faça login para adicionar ao carrinho.');
        navigate('/login');
        return;
      }
      alert('Erro ao verificar autenticação.');
      return;
    }

    const productToAdd = {
      produtoId: producto.id,
      quantidade,
      tamanho: selectedTamanho,
      cor: selectedCor,
    };

    try {
      await api.post('/pedidos/criar', productToAdd);
      console.log('Produto sai da pagina de InformProduto:', productToAdd);

      alert('Produto adicionado ao carrinho com sucesso!');
      navigate('/carrinho');
    } catch (error) {
      alert('Erro ao adicionar produto ao carrinho');
      console.error('Erro ao adicionar produto ao carrinho:', error);
    }
  };

  if (!producto) return (
    <div>
      <div className={Styles.loading}>
        <div className={Styles.hourglass}><span></span></div>
      </div>
    </div>
  );

  const renderOptions = (options, selectedValue, onChange, type) => (
    <div className={Styles.optionGroup}>
      <h4>{type === 'cor' ? 'Cor:' : 'Tamanho:'}</h4>
      <div className={type === 'cor' ? Styles.colorOptions : Styles.sizeOptions}>
        {options.map(option => {
          const cleanedOption = option.trim().toUpperCase();
          return (
            <button
              key={cleanedOption}
              className={`${type === 'cor' ? Styles.colorOption : Styles.sizeOption} 
                ${selectedValue === cleanedOption ? Styles.selected : ''} 
                ${type === 'cor' ? Styles[cleanedOption.toLowerCase()] : ''}`}
              onClick={() => onChange(cleanedOption)}
            >
              {type === 'cor' ? '' : cleanedOption}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
      <Header />
      <PageContainer className={Styles.container}>
        <div className={Styles.breadcrumb}><span>{producto.nome}</span></div>

        <div className={Styles.productWrapper}>
          <div className={Styles.gallery}>
            <div className={Styles.mainImage}>
              <img
                src={parseImagens(producto.imagem)[activeImageIndex]}
                alt={producto.nome}
              />
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
            <p className={Styles.productPrice}>
              R$ {Number(producto.preco).toFixed(2).replace('.', ',')}
            </p>

            <div className={Styles.productDescription}>
              <h3>Descrição</h3>
              <p>{producto.descricao}</p>
            </div>

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

            <button className={Styles.addToCartButton} onClick={handleAddToCart}>Adicionar ao Carrinho</button>
          </div>
        </div>
      </PageContainer>
      <Footer />

    </div>
  );
};

export default InformProduto;
