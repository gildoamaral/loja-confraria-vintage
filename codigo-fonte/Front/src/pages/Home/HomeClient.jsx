import React, { useEffect, useState } from 'react';
import Styles from './HomeCliente.module.css';
import api from '../../services/api';
import PageContainer from '../../components/PageContainer';
import Footer from '../../components/Footer';
import Carrossel from '../../components/Carrossel/Carrossel';
import Loading from '../../components/Loading';
import ProductCard from './components/ProductCard';
import arabesc from './arabesc.png';

const TAMANHOS = ['P', 'M', 'G', 'GG'];
const CATEGORIAS = ['SAIA', 'SHORT', 'CALÇA', 'BLUSA', 'CAMISA', 'CONJUNTOS', 'VESTIDO'];
const OCASIOES = [
  // 'CASAMENTO',
  // 'BATIZADO',
  // 'MADRINHAS',
  // 'FORMATURA',
  'FESTAS',
  'OCASIOES_ESPECIAIS',
  'CASUAL'
];

// Função para exibir nome amigável
const getOcasiaoLabel = (ocasiao) => {
  switch (ocasiao) {
    case 'OCASIOES_ESPECIAIS':
      return 'Ocasiões Especiais';
    case 'FESTAS':
      return 'Festas';
    case 'CASUAL':
      return 'Casual';
    default:
      // Torna amigável qualquer outro valor
      return ocasiao.charAt(0) + ocasiao.slice(1).toLowerCase().replace(/_/g, ' ');
  }
};

const HomeCliente = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true); // Novo estado
  const [selectedTamanhos, setSelectedTamanhos] = useState([]);
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [selectedOcasiao, setSelectedOcasiao] = useState(null);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true); // Inicia carregamento
      try {
        const response = await api.get('/produtos');
        setProdutos(response.data);
        console.log('Produtos carregados:', response.data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false); // Finaliza carregamento
      }
    };
    fetchProdutos();
  }, []);

  const handleFilterChange = (setter) => (value) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const handleOcasiaoClick = (ocasiao) => {
    setSelectedOcasiao(prev => prev === ocasiao ? null : ocasiao);
  };

  // const parseImagens = (imagemData) => {
  //   if (!imagemData) return [];
  //   try {
  //     return Array.isArray(imagemData) ? imagemData : JSON.parse(imagemData);
  //   } catch {
  //     return [imagemData];
  //   }
  // };

  const filteredProdutos = produtos.filter(produto => {
    const matchTamanho = !selectedTamanhos.length || selectedTamanhos.includes(produto.tamanho);
    const matchCategoria = !selectedCategorias.length || selectedCategorias.includes(produto.categoria);

    // Filtro de ocasião:
    if (selectedOcasiao) {
      // Só mostra produtos da ocasião selecionada
      if (produto.ocasiao !== selectedOcasiao) return false;
    } else {
      // Nenhuma ocasião selecionada: só mostra produtos sem ocasião
      if (produto.ocasiao && produto.ocasiao.trim() !== '') return false;
    }

    return matchTamanho && matchCategoria;
  });

  if (loading) { // Troque !produtos.length por loading
    return (
      <>
        <Loading />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Carrossel />
      <PageContainer className={Styles.container}>

        <div className={Styles.ocasioesContainer1}>
          {OCASIOES.map((ocasiao, index) => (
            <React.Fragment key={ocasiao}>
              <div
                className={`${Styles.ocasioCard1} ${selectedOcasiao === ocasiao ? Styles.active : ''}`}
                onClick={() => handleOcasiaoClick(ocasiao)}
              >
                <span className={`${Styles.ocasioNome}`}>
                  {getOcasiaoLabel(ocasiao)}
                </span>
              </div>

              {index < OCASIOES.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', height: "2rem" }}>
                  <img src={arabesc} alt=" Divider" className={Styles.arabesc} />
                </div>
              )}
              {/* {index < OCASIOES.length - 1 && <span className={Styles.divider}>|</span>} */}
            </React.Fragment>
          ))}
        </div>


        {/* FILTRO BUTTON */}
        <button
          className={Styles.filterToggle}
          onClick={() => setShowFiltersDrawer(v => !v)}
        >
          Filtrar
        </button>


        <div className={Styles.contentWrapper}>

          {/* FILTRO MENU */}
          {showFiltersDrawer && (
            <aside className={Styles.filtersSidebarRight}>
              <details className={Styles.dropdown} open>
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
              <details className={Styles.dropdown} open>
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
            </aside>
          )}

          {/* ROUPAS */}
          <div className={Styles.produtosGrid}>
            {filteredProdutos.map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))}
          </div>

        </div>

      </PageContainer>
      <Footer />
    </>
  );
};

export default HomeCliente;