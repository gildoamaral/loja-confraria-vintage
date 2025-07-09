import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import ProdutoCard from './components/ProdutoCard';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Container,
  Button,
  ButtonGroup
} from '@mui/material';
import Carrossel from '../../components/Carrossel';

// Define as ocasiões principais que funcionarão como abas
const OCASIOES_PRINCIPAIS = ['FESTAS', 'OCASIOES_ESPECIAIS', 'CASUAL'];

// Pega os valores dos seus Enums do Prisma para os filtros
const TAMANHOS = ['P', 'M', 'G', 'GG'];
const CORES = ['VERMELHO', 'AZUL', 'AMARELO', 'VERDE', 'PRETO', 'BRANCO', 'ROSA', 'CINZA', 'BEGE', 'ROXO', 'LARANJA', 'MARROM', 'PRATA', 'DOURADO'];


const HomePage = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOcasiao, setSelectedOcasiao] = useState(OCASIOES_PRINCIPAIS[0]); // Começa com a primeira ocasião selecionada
  const [filtros, setFiltros] = useState({
    categoria: [],
    tamanho: [],
    cor: [],
  });

  // Busca todos os produtos da API apenas uma vez
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await api.get('/produtos');
        setProdutos(response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProdutos();
  }, []);

  // Limpa os filtros de categoria sempre que uma nova ocasião é selecionada
  useEffect(() => {
    setFiltros(prev => ({ ...prev, categoria: [] }));
  }, [selectedOcasiao]);

  const handleFiltroChange = (tipo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [tipo]: prev[tipo].includes(valor)
        ? prev[tipo].filter(v => v !== valor)
        : [...prev[tipo], valor],
    }));
  };

  // --- LÓGICA DE FILTRAGEM E AGRUPAMENTO ---
  const dadosDaPagina = useMemo(() => {
    // 1. Filtra os produtos pela OCASIÃO selecionada
    const produtosDaOcasiao = produtos.filter(p => p.ocasiao === selectedOcasiao);

    // 2. A partir dessa lista, descobre quais CATEGORIAS estão disponíveis
    const categoriasDisponiveis = [...new Set(produtosDaOcasiao.map(p => p.categoria))];

    // 3. Aplica os filtros da barra lateral (categoria, tamanho, cor)
    const produtosFiltrados = produtosDaOcasiao.filter(produto => {
      const passaCategoria = filtros.categoria.length === 0 || filtros.categoria.includes(produto.categoria);
      const passaTamanho = filtros.tamanho.length === 0 || filtros.tamanho.includes(produto.tamanho);
      const passaCor = filtros.cor.length === 0 || filtros.cor.includes(produto.cor);
      return passaCategoria && passaTamanho && passaCor;
    });

    return { produtosFiltrados, categoriasDisponiveis };
  }, [produtos, selectedOcasiao, filtros]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <>
      <Carrossel />
      <Container maxWidth="xl" sx={{ pt: 5, pb: 10 }}>
        {/* Abas de Navegação por Ocasião */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <ButtonGroup variant="outlined" aria-label="outlined primary button group" size="large">
            {OCASIOES_PRINCIPAIS.map(ocasiao => (
              <Button
                key={ocasiao}
                variant={selectedOcasiao === ocasiao ? 'contained' : 'outlined'}
                onClick={() => setSelectedOcasiao(ocasiao)}
              >
                {ocasiao.replace(/_/g, ' ')}
              </Button>
            ))}
          </ButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* Barra Lateral de Filtros Contextual */}
          <Paper elevation={2} sx={{ width: 240, p: 2, position: 'sticky', top: '2rem', alignSelf: 'flex-start', flexShrink: 0 }}>
            <Typography variant="h6" gutterBottom>Filtros</Typography>
            <Divider sx={{ mb: 2 }} />

            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Categorias</Typography>
              <FormGroup>
                {dadosDaPagina.categoriasDisponiveis.map(categoria => (
                  <FormControlLabel key={categoria} control={<Checkbox checked={filtros.categoria.includes(categoria)} onChange={() => handleFiltroChange('categoria', categoria)} />} label={categoria.charAt(0) + categoria.slice(1).toLowerCase()} />
                ))}
              </FormGroup>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Tamanho</Typography>
              <FormGroup>
                {TAMANHOS.map(tamanho => (
                  <FormControlLabel key={tamanho} control={<Checkbox checked={filtros.tamanho.includes(tamanho)} onChange={() => handleFiltroChange('tamanho', tamanho)} />} label={tamanho} />
                ))}
              </FormGroup>
            </Box>

          </Paper>

          {/* Conteúdo Principal com os Produtos */}
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Grid container spacing={1}>
              {dadosDaPagina.produtosFiltrados.length === 0 ? (
                <Typography sx={{ p: 3 }}>Nenhum produto encontrado para a ocasião e filtros selecionados.</Typography>
              ) : (
                dadosDaPagina.produtosFiltrados.map(produto => (
                  <Grid key={produto.id} >
                    <ProdutoCard produto={produto} />
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;