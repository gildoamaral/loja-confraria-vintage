import React from 'react';
import { Link } from 'react-router-dom';
import Styles from './ProductCard.module.css';

const ProductCard = ({ produto }) => {
  // Função para obter a URL da imagem principal
  const getImagemPrincipal = () => {
    if (!produto.imagens || produto.imagens.length === 0) {
      return null;
    }
    return produto.imagens[0].urls?.large || null;
  };

  // Função para formatar preço
  const formatarPreco = (preco) => {
    return `R$ ${preco.toFixed(2).replace('.', ',')}`;
  };

  const imagemPrincipalUrl = getImagemPrincipal();

  return (
    <Link
      to={`/produto/${produto.id}`}
      className={Styles.produtoCardLink}
    >
      <div className={Styles.produtoCard}>
        {imagemPrincipalUrl && (
          <img
            src={imagemPrincipalUrl}
            alt={produto.nome}
            className={Styles.produtoImagem}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div className={Styles.produtoInfo}>
          <h3 className={Styles.produtoNome}>{produto.nome}</h3>
          <div className={Styles.precoContainer}>
            {produto.precoPromocional ? (
              <>
                <p className={Styles.originalPrice}>
                  {formatarPreco(produto.preco)}
                </p>
                <p className={Styles.promoPrice}>
                  {formatarPreco(produto.precoPromocional)}
                </p>
              </>
            ) : (
              <p className={Styles.produtoPreco}>
                {formatarPreco(produto.preco)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;