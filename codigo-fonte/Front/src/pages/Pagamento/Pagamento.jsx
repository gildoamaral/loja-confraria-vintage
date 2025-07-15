import React, { useState, useEffect, useCallback } from 'react'; // 1. Importa o useCallback
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  Divider
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
  const [subtotal, setSubtotal] = useState(valorTotal);
  const [metodo, setMetodo] = useState('');

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
        setEnderecoUsuario({
          rua: res.data.rua || '',
          numero: res.data.numero || '',
          complemento: res.data.complemento || '',
          bairro: res.data.bairro || '',
          cidade: res.data.cidade || '',
          estado: res.data.estado || '',
          cep: res.data.cep || '',
          linha: `${res.data.rua || ''}, ${res.data.numero || ''}${res.data.complemento ? `, ${res.data.complemento}` : ''}, ${res.data.bairro || ''}, ${res.data.cidade || ''} - ${res.data.estado || ''}, CEP: ${res.data.cep || ''}`
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
        alert('Selecione um endereço!');
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
      alert('Preencha todos os campos obrigatórios do endereço!');
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
    console.log('Frete selecionado:', frete);
    if (!frete) {
      alert('Selecione uma opção de frete!');
      return;
    }
    const valor = Number(frete.preco || frete.price || 0);
    setValorFrete(valor);
    setSubtotal(valorTotal + valor);
    setEtapa(3);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
      <Box
        sx={{
          flexGrow: 1,
          minHeight: '80vh',
        }}
      >
        <Paper elevation={3} sx={{ 
          mx: 'auto', 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 3, 
          width: { sm: 1000, xs: '100%' },
          maxWidth: '100%'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button
              onClick={() => navigate(-1)}
              sx={{ minWidth: 0, mr: 1, color: 'primary.main' }}
              aria-label="Voltar"
            >
              <ArrowBackIosNewIcon />
            </Button>
            <Typography variant="h5" fontWeight={700} sx={{ textAlign: 'center', flex: 1 }}>
              {etapa === 1 ? 'Endereço de Entrega' : etapa === 2 ? 'Frete' : 'Pagamento'}
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={4}>

            {/* RESUMOS */}
            <Grid size={{ xs: 12, md: 4 }}>
              <ResumoCarrinho
                quantidadeTotal={quantidadeTotal}
                valorTotal={valorTotal}
                valorFrete={valorFrete}
                subtotal={subtotal}
                usuario={usuario}
                enderecoLinha={enderecoLinha}
              />
            </Grid>

            {/* CONTEUDOS */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Box>

                {/* ETAPA 1: ENDEREÇO */}
                {etapa === 1 && (
                  <>
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

                    {!usarEnderecoCadastrado && (
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
                    )}

                    {usarEnderecoCadastrado && (
                      <Grid size={12}>
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ mt: 2, fontWeight: 700 }}
                          fullWidth
                          onClick={handleContinuarParaFrete}
                        >
                          Continuar para Pagamento
                        </Button>
                      </Grid>
                    )}
                  </>
                )}




                {/* ETAPA 2: FRETE */}
                {etapa === 2 && (
                  <SeletorFrete
                    carregandoFrete={carregandoFrete}
                    opcoesFrete={opcoesFrete}
                    freteSelecionado={freteSelecionado}
                    setFreteSelecionado={setFreteSelecionado}
                    handleContinuarParaPagamento={handleContinuarParaPagamento}
                  />
                )}

                {/* ETAPA 3: PAGAMENTO */}
                {etapa === 3 && (
                  <FormularioPagamento
                    metodo={metodo}
                    setMetodo={setMetodo}
                    pedidoId={pedidoId}
                    valorTotal={valorTotal}
                    valorFrete={valorFrete}
                  />
                )}

              </Box>
            </Grid>

          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default Pagamento;