import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Styles from './HomeCliente.module.css';
import api from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const HomeCliente = () => {
    const [produtos, setProdutos] = useState([]);
    const [selectedTamanhos, setSelectedTamanhos] = useState([]);
    const [selectedCategorias, setSelectedCategorias] = useState([]);
    const [selectedOcasioes, setSelectedOcasioes] = useState([]);

    const TAMANHOS = ['P', 'M', 'G', 'GG'];
    const CATEGORIAS = ['SAIA', 'SHORT', 'CALÇA', 'BLUSA', 'CAMISA', 'CONJUNTOS', 'VESTIDO'];
    const OCASIOES = ['CASAMENTO', 'BATIZADO', 'MADRINHAS', 'FORMATURA'];

    useEffect(() => {
        const fetchProdutos = async () => {
            try {
                const response = await api.get('/produtos');
                setProdutos(response.data);
            } catch (error) {
                console.error('Erro ao buscar produtos:', error);
            }
        };
        fetchProdutos();
    }, []);

    const handleFilterChange = (setter) => (value) => {
        setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    };

    const parseImagens = (imagemData) => {
        if (!imagemData) return [];
        try {
            return Array.isArray(imagemData) ? imagemData : JSON.parse(imagemData);
        } catch {
            return [imagemData];
        }
    };

    const filteredProdutos = produtos.filter(produto => {
        const matchTamanho = !selectedTamanhos.length || selectedTamanhos.includes(produto.tamanho);
        const matchCategoria = !selectedCategorias.length || selectedCategorias.includes(produto.categoria);
        const matchOcasiao = !selectedOcasioes.length || selectedOcasioes.includes(produto.ocasiao);
        return matchTamanho && matchCategoria && matchOcasiao;
    });

    if (!produtos.length) {
        return (
            <div>
                <Header />
                <div className={Styles.loading}>
                    <div className={Styles.hourglass}></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={Styles.container}>
            <Header />
            <div className={Styles.contentWrapper}>
                <div className={Styles.produtosGrid}>
                    {filteredProdutos.map((produto) => {
                        const produtoImagens = parseImagens(produto.imagem);
                        return (
                            <Link
                                to={`/produto/${produto.id}`}
                                key={produto.id}
                                className={Styles.produtoCardLink}
                            >
                                <div className={Styles.produtoCard}>
                                    {produtoImagens[0] && (
                                        <img
                                            src={produtoImagens[0]}
                                            alt={produto.nome}
                                            className={Styles.produtoImagem}
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    )}
                                    <div className={Styles.produtoInfo}>
                                        <h3 className={Styles.produtoNome}>{produto.nome}</h3>
                                        <p className={Styles.produtoPreco}>
                                            {produto.precoPromocional != null ? (
                                                <>
                                                    <span className={Styles.originalPrice}>
                                                    R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                                                    </span>
                                                    <span className={Styles.promoPrice}>
                                                       R$ {Number(produto.precoPromocional).toFixed(2).replace('.', ',')}
                                                    </span>
                                                </>
                                            ) : (
                                                <span>
                                                    R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className={Styles.filtersSidebarRight}>
                    <details className={Styles.dropdown}>
                        <summary className={Styles.dropdownTitle}>Tamanhos</summary>
                        {TAMANHOS.map(tamanho => (
                            <label key={tamanho} className={Styles.filterItem}>
                                <input
                                    type="checkbox"
                                    checked={selectedTamanhos.includes(tamanho)}
                                    onChange={() => handleFilterChange(setSelectedTamanhos)(tamanho)}
                                />
                                {tamanho}
                            </label>
                        ))}
                    </details>

                    <details className={Styles.dropdown}>
                        <summary className={Styles.dropdownTitle}>Categorias</summary>
                        {CATEGORIAS.map(categoria => (
                            <label key={categoria} className={Styles.filterItem}>
                                <input
                                    type="checkbox"
                                    checked={selectedCategorias.includes(categoria)}
                                    onChange={() => handleFilterChange(setSelectedCategorias)(categoria)}
                                />
                                {categoria.charAt(0) + categoria.slice(1).toLowerCase()}
                            </label>
                        ))}
                    </details>

                    <details className={Styles.dropdown}>
                        <summary className={Styles.dropdownTitle}>Ocasiões</summary>
                        {OCASIOES.map(ocasiao => (
                            <label key={ocasiao} className={Styles.filterItem}>
                                <input
                                    type="checkbox"
                                    checked={selectedOcasioes.includes(ocasiao)}
                                    onChange={() => handleFilterChange(setSelectedOcasioes)(ocasiao)}
                                />
                                {ocasiao.charAt(0) + ocasiao.slice(1).toLowerCase()}
                            </label>
                        ))}
                    </details>
                </div>

            </div>
            <Footer />
        </div>
    );
};

export default HomeCliente;

