import React, { useState, useEffect, useCallback } from 'react'; // 1. Importa o useCallback
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loading from '../../components/Loading';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useCep } from '../../hooks/useCep'; // Importa o hook useCep
import {
  ResumoCarrinho,
  SeletorEndereco,
  FormularioEndereco,
  SeletorFrete,
  FormularioPagamento
} from './components';

// Função auxiliar fora do componente para ser estável
function formatarCep(valor) {
  if (!valor) return '';
  valor = valor.replace(/\D/g, '');
  if (valor.length > 5) {
    valor = valor.replace(/^(\d{2})(\d{3})(\d{3})/, '$1.$2-$3');
  } else if (valor.length > 2) {
    valor = valor.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
  }
  return valor.slice(0, 10);
}

const Pagamento = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const valorTotal = location.state?.valorTotal;
  const quantidadeTotal = location.state?.quantidadeTotal;
  const [pedidoId, setPedidoId] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [enderecoUsuario, setEnderecoUsuario] = useState(null);
  const [usarEnderecoCadastrado, setUsarEnderecoCadastrado] = useState(true);
  const [enderecoLinha, setEnderecoLinha] = useState("");
  const [endereco, setEndereco] = useState({});
  const [etapa, setEtapa] = useState(1);
  const [opcoesFrete, setOpcoesFrete] = useState([]);
  const [freteSelecionado, setFreteSelecionado] = useState(null);
  const [carregandoFrete, setCarregandoFrete] = useState(false);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
  const [valorFrete, setValorFrete] = useState(0);
  const [nomeFrete, setNomeFrete] = useState('');
  const [subtotal, setSubtotal] = useState(valorTotal);
  const [metodo, setMetodo] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para controlar as mensagens
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'warning'
  });

  const showMessage = (message, severity = 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  

  // Estados e lógica do CEP movidos do FormularioEndereco
  const { addressData, loading: cepLoading, error: cepError, fetchAddress, clearData } = useCep();
  const [mostrarCamposEndereco, setMostrarCamposEndereco] = useState(false);

  const handleEnderecoChange = useCallback((e) => {
    let { name, value } = e.target;
    if (name === 'cep') {
      value = formatarCep(value);
    }
    setEndereco(prev => ({ ...prev, [name]: value }));
  }, []);

  // useEffect para quando o addressData do CEP chegar
  useEffect(() => {
    if (addressData) {
      const updates = {
        rua: addressData.rua || '',
        bairro: addressData.bairro || '',
        cidade: addressData.cidade || '',
        estado: addressData.estado || '',
      };
      Object.entries(updates).forEach(([name, value]) => {
        handleEnderecoChange({ target: { name, value } });
      });
      setMostrarCamposEndereco(true);
    }
  }, [addressData, handleEnderecoChange]);

  // Reset campos quando CEP for limpo
  useEffect(() => {
    const cepLimpo = endereco.cep?.replace(/\D/g, '') || '';
    if (cepLimpo.length === 0) {
      setMostrarCamposEndereco(false);
    }
  }, [endereco.cep]);

  // Funções para gerenciar CEP - otimizadas com useCallback
  const handleBuscarCep = useCallback(() => {
    const cepLimpo = endereco.cep?.replace(/\D/g, '') || '';
    
    if (cepLimpo.length !== 8) {
      // Não mostra alert aqui pois o useCep já trata o erro
      return;
    }
    
    fetchAddress(endereco.cep);
  }, [endereco.cep, fetchAddress]);

  const validarCepCompleto = useCallback(() => {
    const cepLimpo = endereco.cep?.replace(/\D/g, '') || '';
    return cepLimpo.length === 8;
  }, [endereco.cep]);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const res = await api.get('/usuarios/conta');
        setUsuario(res.data);
        
        // Função auxiliar para validar se um campo tem conteúdo válido
        const temConteudoValido = (valor) => {
          return valor != null && valor !== undefined && String(valor).trim() !== '';
        };
        
        setEnderecoUsuario({
          rua: res.data.rua || '',
          numero: res.data.numero || '',
          complemento: res.data.complemento || '',
          bairro: res.data.bairro || '',
          cidade: res.data.cidade || '',
          estado: res.data.estado || '',
          cep: res.data.cep || '',

          linha: temConteudoValido(res.data.rua) && 
          temConteudoValido(res.data.numero) && 
          temConteudoValido(res.data.bairro) && 
          temConteudoValido(res.data.cidade) && 
          temConteudoValido(res.data.estado) && 
          temConteudoValido(res.data.cep)  
          ? 
          `${res.data.rua}, ${res.data.numero}${res.data.complemento ? `, ${res.data.complemento}` : ''}, ${res.data.bairro}, ${res.data.cidade} - ${res.data.estado}, CEP: ${res.data.cep}` 
          : null
        });


      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
      }
    };
    fetchUsuario();

    const fetchPedidoCarrinho = async () => {
      try {
        const response = await api.get('/pedidos/carrinho');
        if (response.data && response.data.id) {
          console.log('Pedido do carrinho encontrado:', response.data);
          setPedidoId(response.data.id);
          setEndereco({
            rua: response.data.rua || '',
            numero: response.data.numero || '',
            complemento: response.data.complemento || '',
            bairro: response.data.bairro || '',
            cidade: response.data.cidade || '',
            estado: response.data.estado || '',
            cep: response.data.cep || '',
          });
          setEnderecoLinha(response.data.enderecoEntrega);

          console.log('cepPlaced vindo do carrinho: ', response.data.cep);
        }
      } catch (error) {
        console.error('Erro ao buscar o pedido do carrinho:', error);
      }
    };
    fetchPedidoCarrinho();

  }, []);
  
  useEffect(() => {
    if (valorTotal === undefined || quantidadeTotal === undefined) {
      navigate('/carrinho', { replace: true });
    }
  }, [valorTotal, quantidadeTotal, navigate]);

  if (valorTotal === undefined || quantidadeTotal === undefined) {
    return null; // ou um spinner
  }

  if (!pedidoId || !usuario) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Loading />
      </Box>
    );
  }


  async function renderFreteOptions(cep) {
    setCarregandoFrete(true);
    try {
      const res = await api.post('/frete', {
        cepDestino: cep,
        altura: 4,
        largura: 12,
        comprimento: 17,
        peso: 0.3,
      });

      console.log('cheguei aqui 3');
      console.log('Opções de frete:', res.data);
      setOpcoesFrete(res.data);
      setCarregandoFrete(false);

    } catch (error) {
      setCarregandoFrete(false);
      console.error('Erro ao continuar para a próxima etapa:', error);
    }
  }

   const handleFinalizarComPix = async () => {
    setLoading(true);
    try {
      const response = await api.post('/pagamentos/criar-pix', {
        pedidoId,
        valorFrete,
        nomeFrete,
      });

      // 3. Redireciona para a nova página de confirmação, passando os dados
      navigate('/confirmacao-pedido', { 
        state: { 
          pixData: response.data.pixData,
          pedidoId: pedidoId,
          subtotal: subtotal // Passa o valor total para exibir na tela de sucesso
        } 
      });

    } catch (err) {
      console.error(err);
      showMessage('Não foi possível gerar o PIX. Tente novamente.', 'error');
      setLoading(false);
    }
    // Não precisa de finally, pois o usuário será redirecionado
  };

  const handleNovoEndereco = () => {
    setEndereco({
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    });
    setMostrarCamposEndereco(false); // Reset também o estado de mostrar campos
    clearData(); // Limpa dados do CEP anterior
    setUsarEnderecoCadastrado(false);
  };

  const handleContinuarParaFrete = async () => {
    if (usarEnderecoCadastrado) {
      if (!enderecoSelecionado) {
        showMessage('Selecione um endereço!');
        return;
      }
      setEnderecoLinha(enderecoSelecionado.linha);
      setEndereco(enderecoSelecionado.dados);
      const { cep, rua, numero, complemento, bairro, cidade, estado } = enderecoSelecionado.dados;
      const enderecoCompleto = `${rua}, ${numero}${complemento ? `, ${complemento}` : ''}, ${bairro}, ${cidade} - ${estado}, CEP: ${cep}`;


      try {
        await api.put(`/pedidos/endereco/${pedidoId}`, {
          enderecoEntrega: enderecoCompleto,
          rua,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          cep,
        });

        renderFreteOptions(enderecoSelecionado.dados.cep);

        console.log('cheguei aqui HE HE');
      } catch (error) {
        console.error('Erro ao atualizar o endereço do pedido:', error);
        return;
      }


      setEtapa(2);
      return;
    }


    const {
      cep = '', rua = '', numero = '', complemento = '', bairro = '', cidade = '', estado = ''
    } = Object.fromEntries(
      Object.entries(endereco).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
    );

    if (
      !cep || !rua || !numero || !bairro || !cidade || !estado ||
      [cep, rua, numero, bairro, cidade, estado].some(val => !val)
    ) {
      showMessage('Preencha todos os campos obrigatórios do endereço!');
      return;
    }


    const enderecoCompleto = ` ${rua}, ${numero}${complemento ? `, ${complemento}` : ''}, ${bairro}, ${cidade} - ${estado}, CEP: ${cep}`;

    try {
      await api.put(`/pedidos/endereco/${pedidoId}`, {
        enderecoEntrega: enderecoCompleto,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
      });

      renderFreteOptions(cep)
      setEnderecoLinha(enderecoCompleto);

      console.log('cheguei aqui 2');
    } catch (error) {
      console.error('Erro ao atualizar o endereço do pedido:', error);
      return;
    }
    setEtapa(2);
  };

  const handleContinuarParaPagamento = () => {
    const frete = opcoesFrete.find(
      (opcao) => String(opcao.id || opcao.nome) === String(freteSelecionado.id || freteSelecionado.nome)
    );
    console.log('Frete selecionado:', frete.company.name);
    if (!frete) {
      showMessage('Selecione uma opção de frete!');
      return;
    }
    const nome = frete.company.name;
    setNomeFrete(nome);
    const valor = Number(frete.preco || frete.price || 0);
    setValorFrete(valor);
    setSubtotal(valorTotal + valor);
    setEtapa(3);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        py: { xs: 2, md: 4 }
      }}>
      <Box
        sx={{
          maxWidth: 1400,
          mx: 'auto',
          px: { xs: 0, sm: 2, md: 3 }
        }}
      >
        <Paper elevation={0} sx={{ 
          borderRadius: 4,
          overflow: 'hidden',
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          
          {/* Header da página */}
          <Box sx={{ 
            background: 'linear-gradient(135deg, var(--cor-marca) 50%, #764ba2 150%)',
            color: 'white',
            p: { xs: 3, md: 4 },
            position: 'relative'
          }}>
            <Button
              onClick={() => navigate(-1)}
              sx={{ 
                position: 'absolute',
                left: { xs: 16, md: 24 },
                top: '50%',
                transform: 'translateY(-50%)',
                minWidth: 40,
                minHeight: 40,
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                },
                '& .MuiSvgIcon-root': {
                  pointerEvents: 'none',
                }
              }}
              aria-label="Voltar"
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                {etapa === 1 ? 'Endereço de Entrega' : etapa === 2 ? 'Opções de Frete' : 'Finalizar Pagamento'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {etapa === 1 ? 'Confirme ou cadastre seu endereço' : 
                 etapa === 2 ? 'Escolha a melhor opção de entrega' : 
                 'Complete sua compra'}
              </Typography>
            </Box>

            {/* Indicador de progresso */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 3,
              gap: 1
            }}>
              {[1, 2, 3].map((step) => (
                <Box
                  key={step}
                  sx={{
                    width: { xs: 8, md: 12 },
                    height: { xs: 8, md: 12 },
                    borderRadius: '50%',
                    backgroundColor: step <= etapa ? 'white' : 'rgba(255,255,255,0.3)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Box>
          </Box>

          <Grid container spacing={0}>

            {/* RESUMO - Sidebar fixo */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ 
                backgroundColor: '#f8f9fa',
                minHeight: { md: '600px' },
                p: { xs: 3, md: 4 },
                borderRight: { md: '1px solid #e9ecef', xs: 'none' },
                position: { md: 'sticky' },
                top: 0,
                zIndex: 1
              }}>
                <ResumoCarrinho
                  quantidadeTotal={quantidadeTotal}
                  valorTotal={valorTotal}
                  valorFrete={valorFrete}
                  subtotal={subtotal}
                  usuario={usuario}
                  enderecoLinha={enderecoLinha}
                />
              </Box>
            </Grid>

            {/* CONTEÚDO PRINCIPAL */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ 
                p: { xs: 0, md: 6 },
                minHeight: { md: '600px' }
              }}>

                {/* ETAPA 1: ENDEREÇO */}
                {etapa === 1 && (
                  <Box>
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: '#2c3e50', px: 3}}>
                      Confirme seu endereço de entrega
                    </Typography>
                    
                    <Paper elevation={0} sx={{ 
                      border: '1px solid #e9ecef', 
                      borderRadius: 3, 
                      p: 4, 
                      mb: 3,
                      backgroundColor: 'white'
                    }}>
                      <SeletorEndereco
                        usarEnderecoCadastrado={usarEnderecoCadastrado}
                        setUsarEnderecoCadastrado={setUsarEnderecoCadastrado}
                        handleNovoEndereco={handleNovoEndereco}
                        usuario={usuario}
                        enderecoLinha={enderecoLinha}
                        enderecoSelecionado={enderecoSelecionado}
                        setEnderecoSelecionado={setEnderecoSelecionado}
                        endereco={endereco}
                        enderecoUsuario={enderecoUsuario}
                      />
                    </Paper>

                    {!usarEnderecoCadastrado && (
                      <Paper elevation={0} sx={{ 
                        border: '1px solid #e9ecef', 
                        borderRadius: 3, 
                        p: 4,
                        backgroundColor: 'white'
                      }}>
                        <FormularioEndereco
                          endereco={endereco}
                          handleEnderecoChange={handleEnderecoChange}
                          usarEnderecoCadastrado={usarEnderecoCadastrado}
                          handleContinuarParaFrete={handleContinuarParaFrete}
                          mostrarCamposEndereco={mostrarCamposEndereco}
                          cepLoading={cepLoading}
                          cepError={cepError}
                          handleBuscarCep={handleBuscarCep}
                          validarCepCompleto={validarCepCompleto}
                        />
                      </Paper>
                    )}

                    {usarEnderecoCadastrado && (
                      <Box sx={{ mt: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          size="large"
                          sx={{ 
                            py: 2,
                            px: 6,
                            width: '95%',
                            fontWeight: 700,
                            borderRadius: 3,
                            background: 'var(--cor-marca)',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            '&:hover': {
                              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                            }
                          }}
                          
                          onClick={handleContinuarParaFrete}
                        >
                          Continuar para Frete
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}




                {/* ETAPA 2: FRETE */}
                {etapa === 2 && (
                  <Box>
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: '#2c3e50', pl: 3 }}>
                      Escolha a opção de frete
                    </Typography>
                    
                    <Paper elevation={0} sx={{ 
                      border: '1px solid #e9ecef', 
                      borderRadius: 3, 
                      p: 4,
                      backgroundColor: 'white'
                    }}>
                      <SeletorFrete
                        carregandoFrete={carregandoFrete}
                        opcoesFrete={opcoesFrete}
                        freteSelecionado={freteSelecionado}
                        setFreteSelecionado={setFreteSelecionado}
                        handleContinuarParaPagamento={handleContinuarParaPagamento}
                      />
                    </Paper>
                  </Box>
                )}

                {/* ETAPA 3: PAGAMENTO */}
                {etapa === 3 && (
                  <Box>
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: '#2c3e50', pl: 3 }}>
                      Finalizar pagamento
                    </Typography>
                    
                    <Paper elevation={0} sx={{ 
                      border: '1px solid #e9ecef', 
                      borderRadius: 3, 
                      p: 4,
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                      <FormularioPagamento
                        metodo={metodo}
                        setMetodo={setMetodo}
                        pedidoId={pedidoId}
                        valorTotal={valorTotal}
                        valorFrete={valorFrete}
                        nomeFrete={nomeFrete}
                        onFinalizarPix={handleFinalizarComPix}
                        loadingPix={loading}
                    />
                    </Paper>
                  </Box>
                )}

              </Box>
            </Grid>

          </Grid>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Pagamento;