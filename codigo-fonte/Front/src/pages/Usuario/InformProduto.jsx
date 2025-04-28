import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Styles from './InformProduto.module.css';
import api from '../../services/api';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const InformProduto = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [selectedTamanho, setSelectedTamanho] = useState('');
  const [selectedCor, setSelectedCor] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const TAMANHOS = ['P', 'M', 'G', 'GG'];
  const CORES = ['VERMELHO', 'AZUL', 'AMARELO', 'VERDE', 'PRETO', 'BRANCO', 'ROSA'];

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
    if (Array.isArray(imagemData)) return imagemData;
    try {
      return JSON.parse(imagemData);
    } catch {
      return [imagemData];
    }
  };

  const handleAddToCart = () => {
    if (!selectedTamanho || !selectedCor) {
      alert('Por favor selecione o tamanho e a cor');
      return;
    }
    console.log('Produto adicionado:', {
      ...producto,
      quantidade,
      selectedTamanho,
      selectedCor
    });
  };

  if (!producto) return (
    <div>
      <Header />
      <div className={Styles.loading}>
        <div className={Styles.hourglass}>
          <span></span>
        </div>
      </div>
      <Footer />
    </div>
  );
  return (

    <div>
      <Header />
      <div className={Styles.container}>
        <div className={Styles.breadcrumb}>
          <span>{producto.nome}</span>
        </div>

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
                  className={`${Styles.thumbnail} ${index === activeImageIndex ? Styles.activeThumbnail : ''
                    }`}
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

            <div className={Styles.variantSelector}>
              <div className={Styles.optionGroup}>
                <h4>Cor:</h4>
                <div className={Styles.colorOptions}>
                  {producto.cor.split(',').map(cor => {
                    const cleanedColor = cor.trim().toUpperCase();
                    return (
                      <button
                        key={cleanedColor}
                        className={`${Styles.colorOption} 
          ${selectedCor === cleanedColor ? Styles.selected : ''}
          ${Styles[cleanedColor.toLowerCase()]}`}
                        onClick={() => setSelectedCor(cleanedColor)}
                      />
                    );
                  })}
                </div>
              </div>
              <div className={Styles.optionGroup}>
                <h4>Tamanho:</h4>
                <div className={Styles.sizeOptions}>
                  {producto.tamanho.split(',').map(tamanho => {
                    const cleanedSize = tamanho.trim().toUpperCase();
                    return (
                      <button
                        key={cleanedSize}
                        className={`${Styles.sizeOption} ${selectedTamanho === cleanedSize ? Styles.selected : ''}`}
                        onClick={() => setSelectedTamanho(cleanedSize)}
                      >
                        {cleanedSize}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={Styles.quantitySelector}>
              <h4>Quantidade:</h4>
              <div className={Styles.quantityControls}>
                <button
                  onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                  disabled={quantidade === 1}
                >
                  -
                </button>
                <span>{quantidade}</span>
                <button onClick={() => setQuantidade(quantidade + 1)}>+</button>
              </div>
            </div>

            <button
              className={Styles.addToCartButton}
              onClick={handleAddToCart}
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>

  );
};

export default InformProduto;