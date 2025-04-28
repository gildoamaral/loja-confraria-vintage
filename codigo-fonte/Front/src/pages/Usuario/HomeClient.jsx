import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Styles from './HomeCliente.module.css';
import api from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const HomeCliente = () => {
    const [produtos, setProdutos] = useState([]);
    const [selectedTamanhos, setSelectedTamanhos] = useState([]);
    const [selectedCores, setSelectedCores] = useState([]);
    const [sortOption, setSortOption] = useState('');

    const TAMANHOS = ['P', 'M', 'G', 'GG'];
    const CORES = ['VERMELHO', 'AZUL', 'AMARELO', 'VERDE', 'PRETO', 'BRANCO', 'ROSA'];
    const SORT_OPTIONS = [
        { value: 'preco-asc', label: 'Preço: Menor para Maior' },
        { value: 'preco-desc', label: 'Preço: Maior para Menor' },
        { value: 'nome-asc', label: 'Nome: A-Z' },
        { value: 'nome-desc', label: 'Nome: Z-A' }
    ];

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

    const handleFilterChange = (setter, state) => (value) => {
        setter((prev) =>
            prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
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
        const matchCor = !selectedCores.length || selectedCores.includes(produto.cor);
        return matchTamanho && matchCor;
    });

    const sortedProdutos = filteredProdutos.sort((a, b) => {
        switch (sortOption) {
            case 'preco-asc': return a.preco - b.preco;
            case 'preco-desc': return b.preco - a.preco;
            case 'nome-asc': return a.nome.localeCompare(b.nome);
            case 'nome-desc': return b.nome.localeCompare(a.nome);
            default: return 0;
        }
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
                <div className={Styles.filtersSidebar}>
                    {/* Ordenação */}
                    <div className={Styles.filterGroup}>
                        <h3>Ordenar por</h3>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className={Styles.sortSelect}
                        >
                            <option value="">Selecione...</option>
                            {SORT_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro de Tamanho */}
                    <div className={Styles.filterGroup}>
                        <h3>Tamanho</h3>
                        {TAMANHOS.map(tamanho => (
                            <label key={tamanho} className={Styles.filterItem}>
                                <input
                                    type="checkbox"
                                    checked={selectedTamanhos.includes(tamanho)}
                                    onChange={() => handleFilterChange(setSelectedTamanhos, selectedTamanhos)(tamanho)}
                                />
                                {tamanho}
                            </label>
                        ))}
                    </div>

                    {/* Filtro de Cor */}
                    <div className={Styles.filterGroup}>
                        <h3>Cor</h3>
                        {CORES.map(cor => (
                            <label key={cor} className={Styles.filterItem}>
                                <input
                                    type="checkbox"
                                    checked={selectedCores.includes(cor)}
                                    onChange={() => handleFilterChange(setSelectedCores, selectedCores)(cor)}
                                />
                                <span className={`${Styles.colorIndicator} ${Styles[cor.toLowerCase()]}`} />
                                {cor.charAt(0) + cor.slice(1).toLowerCase()}
                            </label>
                        ))}
                    </div>
                </div>

                <div className={Styles.produtosGrid}>
                    {sortedProdutos.map((produto) => {
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
                                            R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default HomeCliente;
