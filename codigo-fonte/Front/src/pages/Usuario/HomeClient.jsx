import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Styles from './HomeCliente.module.css';
import api from '../../services/api';
import Header from '../../components/header';
import Footer from '../../components/Footer';

const HomeCliente = () => {
    const [produtos, setProdutos] = useState([]);
    const [selectedTamanhos, setSelectedTamanhos] = useState([]);
    const [selectedCategorias, setSelectedCategorias] = useState([]);
    const [selectedOcasioes, setSelectedOcasioes] = useState([]);

    const TAMANHOS = ['P', 'M', 'G', 'GG'];
    const CATEGORIAS = ['SAIA', 'SHORT', 'CALÇA', 'BLUSA', 'CAMISA', 'CONJUNTOS', 'VESTIDO'];
    const OCASIOES = ['CASAMENTO', 'BATIZADO', 'MADRINHAS', 'FORMATURA'];

    const imagensOcasioes = {
        CASAMENTO: 'url_da_imagem_casamento.jpg',
        BATIZADO: 'url_da_imagem_batizado.jpg',
        MADRINHAS: 'url_da_imagem_madrinhas.jpg',
        FORMATURA: 'url_da_imagem_formatura.jpg',
    };
    const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

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
            <h2>Ocasiões especias</h2>
            <h4>Confira as melhores opções para cada tipo de evento</h4>
            <div className={Styles.ocasioesContainer}>
                {OCASIOES.map(ocasiao => (
                    <div
                        key={ocasiao}
                        className={`${Styles.ocasioCard} ${selectedOcasioes.includes(ocasiao) ? Styles.active : ''}`}
                        onClick={() => handleFilterChange(setSelectedOcasioes)(ocasiao)}
                    >
                        <span className={Styles.ocasioNome}>
                            {ocasiao.charAt(0) + ocasiao.slice(1).toLowerCase()}
                        </span>
                    </div>
                ))}
            </div>
            <button
                className={Styles.filterToggle}
                onClick={() => setShowFiltersDrawer(v => !v)}
            >
                Filtrar
            </button>
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

                {showFiltersDrawer && (
                    <aside className={Styles.filtersDrawer}>
                        <button
                            className={Styles.closeButton}
                            onClick={() => setShowFiltersDrawer(false)}
                        >&times;</button>
                        <div className={Styles.filterGroup}>
                            <h3>Tamanhos</h3>
                            {TAMANHOS.map(tam => (
                                <label key={tam} className={Styles.filterItem}>
                                    <input
                                        type="checkbox"
                                        checked={selectedTamanhos.includes(tam)}
                                        onChange={() => handleFilterChange(setSelectedTamanhos)(tam)}
                                    />
                                    {tam}
                                </label>
                            ))}
                        </div>
                        <div className={Styles.filterGroup}>
                            <h3>Categorias</h3>
                            {CATEGORIAS.map(cat => (
                                <label key={cat} className={Styles.filterItem}>
                                    <input
                                        type="checkbox"
                                        checked={selectedCategorias.includes(cat)}
                                        onChange={() => handleFilterChange(setSelectedCategorias)(cat)}
                                    />
                                    {cat.charAt(0) + cat.slice(1).toLowerCase()}
                                </label>
                            ))}
                        </div>
                    </aside>
                )}


            </div>
            <Footer />
        </div>
    );
};

export default HomeCliente;
