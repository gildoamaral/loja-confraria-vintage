import React, { useState, useEffect, useMemo } from 'react';
import { useProdutos } from '../../contexts';
import ProdutoCard from '../../components/ProdutoCard';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Container,
  Button,
  Drawer,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Pagination,
  Stack
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

const OCASIOES_PRINCIPAIS = ['CONFRARIA', 'FESTAS', 'OCASIOES_ESPECIAIS', 'CASUAL'];

const MenuProdutos = () => {
  const { produtos, loading, fetchProdutos, paginationInfo } = useProdutos();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [selectedOcasiao, setSelectedOcasiao] = useState(OCASIOES_PRINCIPAIS[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filtros, setFiltros] = useState({
    categoria: [],
    tamanho: [],
    cor: [],
  });

  useEffect(() => {
    const handleNavbarHidden = () => setNavbarVisible(false);
    const handleNavbarVisible = () => setNavbarVisible(true);

    window.addEventListener('navbarHidden', handleNavbarHidden);
    window.addEventListener('navbarVisible', handleNavbarVisible);

    return () => {
      window.removeEventListener('navbarHidden', handleNavbarHidden);
      window.removeEventListener('navbarVisible', handleNavbarVisible);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset página quando mudar ocasião
    fetchProdutos(selectedOcasiao, 1, 25);
  }, [selectedOcasiao, fetchProdutos]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchProdutos(selectedOcasiao, currentPage, 25);
    }
  }, [currentPage, selectedOcasiao, fetchProdutos]);

  const handleFiltroChange = (tipo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [tipo]: prev[tipo].includes(valor)
        ? prev[tipo].filter(v => v !== valor)
        : [...prev[tipo], valor]
    }));
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    // Scroll para o topo da seção de produtos
    const container = document.querySelector('[data-produtos-container]');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOcasiaoChange = (novaOcasiao) => {
    setSelectedOcasiao(novaOcasiao);
    setFiltros({ categoria: [], tamanho: [], cor: [] }); // Reset filtros
  };


  const dadosDaPagina = useMemo(() => {
    // Como os produtos já vêm filtrados do backend, usamos diretamente
    const produtosFiltrados = produtos.filter(produto => {
      const passaCategoria = filtros.categoria.length === 0 || filtros.categoria.includes(produto.categoria);
      const passaTamanho = filtros.tamanho.length === 0 || filtros.tamanho.includes(produto.tamanho);
      const passaCor = filtros.cor.length === 0 || filtros.cor.includes(produto.cor);
      return passaCategoria && passaTamanho && passaCor;
    });

    const categoriasDisponiveis = [...new Set(produtos.map(p => p.categoria))];
    const tamanhosDisponiveis = [...new Set(produtos.map(p => p.tamanho))].filter(Boolean);
    const coresDisponiveis = [...new Set(produtos.map(p => p.cor))].filter(Boolean);

    const contarProdutosPorFiltro = (campo, valor) => {
      return produtos.filter(produto => produto[campo] === valor).length;
    };

    const contadoresCategoria = {};
    const contadoresTamanho = {};
    const contadoresCor = {};
    categoriasDisponiveis.forEach(categoria => {
      contadoresCategoria[categoria] = contarProdutosPorFiltro('categoria', categoria);
    });
    tamanhosDisponiveis.forEach(tamanho => {
      contadoresTamanho[tamanho] = contarProdutosPorFiltro('tamanho', tamanho);
    });
    coresDisponiveis.forEach(cor => {
      contadoresCor[cor] = contarProdutosPorFiltro('cor', cor);
    });

    return {
      produtosFiltrados,
      categoriasDisponiveis,
      tamanhosDisponiveis,
      coresDisponiveis,
      contadoresCategoria,
      contadoresTamanho,
      contadoresCor
    };
  }, [produtos, filtros]);

  const toggleMobileFilters = (open) => () => {
    setMobileFiltersOpen(open);
  };

  if (loading && produtos.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="xl" sx={{ pt: 2, pb: 10, minHeight: '100vh' }}>

      {/* OCASIOES */}
      <Box sx={{
        mb: 3,
        p: '1rem 0',
      }}>
        {isMobile ? (
          <FormControl fullWidth variant="outlined" sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'var(--cor-detalhes)',
              },
              '&:hover fieldset': {
                borderColor: 'var(--cor-detalhes)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--cor-detalhes)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'var(--cor-detalhes)',
            },
            '& .MuiSelect-icon': {
              color: 'var(--cor-detalhes)',
            }
          }}>
            <InputLabel id="ocasiao-select-label">Ocasião</InputLabel>
            <Select
              labelId="ocasiao-select-label"
              id="ocasiao-select"
              value={selectedOcasiao}
              label="Ocasião"
              onChange={(e) => handleOcasiaoChange(e.target.value)}
            >
              {OCASIOES_PRINCIPAIS.map(ocasiao => (
                <MenuItem key={ocasiao} value={ocasiao}>
                  {ocasiao.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1, width: '100%', borderBottom: '1px solid var(--cor-detalhes)' }}>
            {OCASIOES_PRINCIPAIS.map(ocasiao => (
              <Button
                key={ocasiao}
                variant="text"
                onClick={() => handleOcasiaoChange(ocasiao)}
                sx={{
                  color: "var(--cor-detalhes)",
                  fontSize: '1rem',
                  fontWeight: selectedOcasiao === ocasiao ? '800' : 'normal',
                }}
              >
                {ocasiao.replace(/_/g, ' ')}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      {/* FILTROS */}
      <Box sx={{
        mb: 2,
        position: 'sticky',
        top: navbarVisible ? '5rem' : '2rem',
        alignSelf: 'flex-start',
        zIndex: 1,
        transition: 'top 0.3s ease-in-out',
        justifySelf: 'flex-end'
      }}>
        <Button onClick={toggleMobileFilters(true)} startIcon={<FilterListIcon />} variant="contained" sx={{ bgcolor: 'var(--cor-detalhes)', color: 'white' }}>
          Filtrar
        </Button>
        <Drawer anchor="left" open={mobileFiltersOpen} onClose={toggleMobileFilters(false)}>
          <Box sx={{ width: 250, p: 2 }}>
            <Typography variant="h6" gutterBottom>Filtros</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Categorias</Typography>
              <FormGroup>
                {dadosDaPagina.categoriasDisponiveis.map(categoria => (
                  <FormControlLabel
                    key={categoria}
                    control={<Checkbox checked={filtros.categoria.includes(categoria)} onChange={() => handleFiltroChange('categoria', categoria)} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography component="span">
                          {categoria.charAt(0) + categoria.slice(1).toLowerCase()}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                            fontWeight: 400
                          }}
                        >
                          ({dadosDaPagina.contadoresCategoria[categoria] || 0})
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Tamanho</Typography>
              <FormGroup>
                {dadosDaPagina.tamanhosDisponiveis.map(tamanho => (
                  <FormControlLabel
                    key={tamanho}
                    control={<Checkbox checked={filtros.tamanho.includes(tamanho)} onChange={() => handleFiltroChange('tamanho', tamanho)} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography component="span">
                          {tamanho}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                            fontWeight: 400
                          }}
                        >
                          ({dadosDaPagina.contadoresTamanho[tamanho] || 0})
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Cor</Typography>
              <FormGroup>
                {dadosDaPagina.coresDisponiveis.map(cor => (
                  <FormControlLabel
                    key={cor}
                    control={<Checkbox checked={filtros.cor.includes(cor)} onChange={() => handleFiltroChange('cor', cor)} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography component="span">
                          {cor.charAt(0) + cor.slice(1).toLowerCase()}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                            fontWeight: 400
                          }}
                        >
                          ({dadosDaPagina.contadoresCor[cor] || 0})
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
          </Box>
        </Drawer>
      </Box>

      {/* PRODUTOS */}
      <Box
        data-produtos-container
        sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}
      >
        <Box component="main" sx={{ flexGrow: 1 }}>
          {/* Informações da paginação */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {paginationInfo.totalProdutos > 0 && (
                `Página ${paginationInfo.currentPage} de ${paginationInfo.totalPages} 
                   (${paginationInfo.totalProdutos} produtos no total)`
              )}
            </Typography>
          </Box>

          <Grid container columnSpacing={1} rowSpacing={{ sm: 3, xs: 1 }} >
            {loading ? (
              <Grid size={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress color="inherit" />
                </Box>
              </Grid>
            ) : dadosDaPagina.produtosFiltrados.length === 0 ? (
              <Grid size={12}>
                <Typography sx={{ p: 3 }}>Nenhum produto encontrado.</Typography>
              </Grid>
            ) : (
              dadosDaPagina.produtosFiltrados.map(produto => (
                <Grid
                  key={produto.id}
                  size={{
                    xs: 12, // Tela extra pequena: 1 produto por linha
                    sm: 6,  // Tela pequena: 2 produtos por linha  
                    md: 4,  // Tela média: 3 produtos por linha
                    lg: 2.4 // Tela grande: 5 produtos por linha (12/2.4 = 5)
                  }}
                >
                  <ProdutoCard produto={produto} />
                </Grid>
              ))
            )}
          </Grid>

          {/* Paginação */}
          {paginationInfo.totalPages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Stack spacing={2}>
                <Pagination
                  count={paginationInfo.totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                  siblingCount={isMobile ? 0 : 1}
                  boundaryCount={1}
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: 'var(--cor-detalhes)',
                    },
                    '& .Mui-selected': {
                      backgroundColor: 'var(--cor-detalhes) !important',
                      color: 'white',
                    },
                  }}
                />
              </Stack>
            </Box>
          )}
        </Box>
      </Box>



    </Container>
  )
}

export default MenuProdutos