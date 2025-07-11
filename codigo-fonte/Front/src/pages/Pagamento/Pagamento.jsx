import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PagamentoCartao from './PagamentoCartao';
// import Header from '../../components/Header1';
import Loading from '../../components/Loading';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const Pagamento = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const valorTotal = location.state?.valorTotal;
  const quantidadeTotal = location.state?.quantidadeTotal;
  const [pedidoId, setPedidoId] = useState(null);
  const [metodo, setMetodo] = useState('');
  const [usuario, setUsuario] = useState(null); // Novo estado
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

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const res = await api.get('/usuarios/conta');
        setUsuario(res.data);


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

  const handleUsarEnderecoCadastrado = () => {
    if (usuario?.endereco) {
      // setEndereco(parseEndereco(usuario.endereco));
      setUsarEnderecoCadastrado(true);
    }
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
    setUsarEnderecoCadastrado(false);
  };

  function formatarCep(valor) {
    // Remove tudo que não for número
    valor = valor.replace(/\D/g, '');
    // Aplica a máscara
    if (valor.length > 5) {
      valor = valor.replace(/^(\d{2})(\d{3})(\d{3})/, '$1.$2-$3');
    } else if (valor.length > 2) {
      valor = valor.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
    }
    return valor.slice(0, 10); // Limita ao tamanho máximo
  }

  const handleEnderecoChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cep') {
      value = formatarCep(value);
    }
    setEndereco({ ...endereco, [name]: value });
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

    //   setCarregandoFrete(true);
    //   const res = await api.post('/frete', {
    //     cepDestino: cep,
    //     altura: 4,
    //     largura: 12,
    //     comprimento: 17,
    //     peso: 0.3,
    //   });
    //   console.log('cheguei aqui 3');
    //   console.log('Opções de frete:', res.data);
    //   setOpcoesFrete(res.data);
    //   setCarregandoFrete(false);
    //   setEtapa(2);
    // } catch (error) {
    //   setCarregandoFrete(false);
    //   console.error('Erro ao continuar para a próxima etapa:', error);
    // }
    // } else if (etapa === 2) {

    // if (!freteSelecionado) {
    //   alert('Selecione uma opção de frete!');
    //   return;
    // }

    // Aqui você pode salvar o frete selecionado no pedido, se desejar
    // setEtapa(3);
    // }
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
        backgroundColor: 'var(--cor-principal)',
        // pt: { xs: 2, sm: 4 },
        // minHeight: '100vh',
      }}>
      <Box
        sx={{
          flexGrow: 1,
          minHeight: '80vh',
          // p: { xs: 0, sm: 4 },
        }}
      >
        {/* <Header invisivel /> */}
        <Paper elevation={3} sx={{ mx: 'auto', p: 3, borderRadius: 3, maxWidth: 1000 }}>
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

          <Grid container spacing={4} >

            {/* RESUMOS */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: { xs: "100%", sm: 270 } }}>


              {/* Resumo do Pedido */}
              <Card sx={{ mb: 3, background: '#FFF7F2', borderRadius: 2, width: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Resumo do Pedido
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    Quantidade de produtos: <strong>{quantidadeTotal}</strong>
                  </Typography>
                  <Typography variant="body1">
                    Frete: <strong>R$ {valorFrete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </Typography>
                  <Typography variant="body1">
                    Produto(s): <strong> R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </strong>
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Subtotal:</Typography>
                    <Typography variant="h5" fontWeight={700} color="primary">
                      R$ {(subtotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Divider sx={{ mt: 2 }} />
                </CardContent>
              </Card>

              {/* Resumo dos dados */}
              <Card sx={{ mb: 3, background: '#FFF7F2', borderRadius: 2, width: '100%' }}>
                <CardContent >
                  {usuario && (
                    <>
                      <Typography variant="h6" gutterBottom fontWeight={700}>Dados do Usuário</Typography>
                      <Typography variant="body2">Nome: <b>{usuario.nome} {usuario.sobrenome}</b></Typography>
                      <Typography variant="body2">E-mail: <b>{usuario.email}</b></Typography>
                      <Divider sx={{ my: 2 }} />
                    </>
                  )}
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Endereço de Entrega
                  </Typography>
                  <Typography variant="body2">
                    {enderecoLinha}
                  </Typography>
                </CardContent>
              </Card>

            </Grid>

            {/* CONTEUDOS */}
            <Grid size={{ xs: 12, md: 8 }} sx={{ ml: { xs: 0, md: 8 } }}>
              <Box>


                {/* FORMGROUP */}
                {etapa === 1 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <Button
                        variant={usarEnderecoCadastrado ? 'contained' : 'outlined'}
                        onClick={handleUsarEnderecoCadastrado}
                        disabled={!usuario?.endereco && !enderecoLinha}
                      >
                        Usar endereço cadastrado
                      </Button>
                      <Button
                        variant={!usarEnderecoCadastrado ? 'contained' : 'outlined'}
                        onClick={handleNovoEndereco}
                      >
                        Preencher novo endereço
                      </Button>
                    </Box>

                    {/* Opções de endereço só aparecem se usarEnderecoCadastrado for true */}
                    {usarEnderecoCadastrado && (usuario?.endereco || enderecoLinha) && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 2, flexWrap: 'wrap' }}>
                        {/* Endereço do Usuário */}
                        {usuario?.endereco && (
                          <Paper
                            elevation={enderecoSelecionado?.linha === usuario.endereco ? 6 : 1}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              // minWidth: 260,
                              // width: {sm: 260},
                              border: enderecoSelecionado?.linha === usuario.endereco ? '2px solid #1976d2' : '1px solid #ccc',
                              background: enderecoSelecionado?.linha === usuario.endereco ? '#e3f2fd' : '#fff',
                              '&:hover': {
                                background: '#e3f2fd',
                              },
                            }}
                            onClick={() => {
                              setEnderecoSelecionado({
                                linha: usuario.endereco,
                                dados: {
                                  rua: usuario.rua || '',
                                  numero: usuario.numero || '',
                                  complemento: usuario.complemento || '',
                                  bairro: usuario.bairro || '',
                                  cidade: usuario.cidade || '',
                                  estado: usuario.estado || '',
                                  cep: usuario.cep || '',
                                }
                              });
                            }}
                          >
                            <Typography variant="body2" fontWeight={700}>Endereço do Cadastro</Typography>
                            <Typography variant="body2">{usuario.endereco}</Typography>
                          </Paper>
                        )}

                        {/* Endereço do Pedido */}
                        {enderecoLinha && (!usuario?.endereco || enderecoLinha !== usuario.endereco) && (
                          <Paper
                            elevation={enderecoSelecionado?.linha !== usuario.endereco ? 6 : 1}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              // minWidth: 260,
                              // width: {sm: 260},
                              border: enderecoSelecionado?.linha === enderecoLinha ? '2px solid #1976d2' : '1px solid #ccc',
                              background: enderecoSelecionado?.linha === enderecoLinha ? '#e3f2fd' : '#fff',
                              '&:hover': {
                                background: '#e3f2fd',
                              },
                            }}
                            onClick={() => {
                              setEnderecoSelecionado({
                                linha: enderecoLinha,
                                dados: { ...endereco }
                              });
                            }}
                          >
                            <Typography variant="body2" fontWeight={700}>Endereço do Pedido</Typography>
                            <Typography variant="body2">{enderecoLinha}</Typography>
                          </Paper>
                        )}
                      </Box>
                    )}

                    {/* Mensagem se nenhum endereço */}
                    {usarEnderecoCadastrado && !usuario?.endereco && !enderecoLinha && (
                      <Typography variant="caption" color="error">
                        Nenhum endereço cadastrado.
                      </Typography>
                    )}

                  </Box>
                )}

                {/* CAMPOS DE ENDEREÇO */}
                {etapa === 1 && !usarEnderecoCadastrado && (
                  <>
                    <Grid sx={{ display: 'grid', gap: 2, mt: 2 }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Rua"
                          name="rua"
                          value={endereco.rua}
                          onChange={handleEnderecoChange}
                          fullWidth
                          required
                          disabled={usarEnderecoCadastrado}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Número"
                          name="numero"
                          value={endereco.numero}
                          onChange={handleEnderecoChange}
                          fullWidth
                          required
                          disabled={usarEnderecoCadastrado}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Complemento"
                          name="complemento"
                          value={endereco.complemento}
                          onChange={handleEnderecoChange}
                          fullWidth
                          disabled={usarEnderecoCadastrado}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Bairro"
                          name="bairro"
                          value={endereco.bairro}
                          onChange={handleEnderecoChange}
                          fullWidth
                          required
                          disabled={usarEnderecoCadastrado}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Cidade"
                          name="cidade"
                          value={endereco.cidade}
                          onChange={handleEnderecoChange}
                          fullWidth
                          required
                          disabled={usarEnderecoCadastrado}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                          label="UF"
                          name="estado"
                          value={endereco.estado}
                          onChange={handleEnderecoChange}
                          fullWidth
                          required
                          inputProps={{ maxLength: 2 }}
                          disabled={usarEnderecoCadastrado}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                          label="CEP"
                          name="cep"
                          value={endereco.cep}
                          onChange={handleEnderecoChange}
                          fullWidth
                          required
                          disabled={usarEnderecoCadastrado}
                          slotProps={{ htmlInput: { maxLength: 10 } }}
                        />
                      </Grid>
                    </Grid>

                    <Grid size={12} sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2, fontWeight: 700 }}
                        onClick={handleContinuarParaFrete}
                      >
                        Continuar para Pagamento
                      </Button>
                    </Grid>
                  </>
                )}
                {etapa === 1 && usarEnderecoCadastrado && (

                  <Grid size={12} >
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


                {/* ETAPA DE PAGAMENTO */}
                {/*               
              {etapa === 2 && (
                <Box>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend" >
                      Método de Pagamento
                    </FormLabel>
                    <RadioGroup
                      row
                      value={metodo}
                      onChange={(e) => setMetodo(e.target.value)}
                    >
                      <FormControlLabel
                        value="cartao"
                        control={<Radio color="primary" />}
                        label="Cartão de Crédito"
                      />
                    </RadioGroup>
                  </FormControl>
                  <Divider sx={{ my: 3 }} />
                  {metodo === 'cartao' ? (
                    <>
                      <PagamentoCartao
                        pedidoId={pedidoId}
                        valor={valorTotal}
                      />
                    </>
                  ) : (
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 8 }}>
                      Selecione um método de pagamento para continuar.
                    </Typography>
                  )}
                </Box>
              )} */}

                {/* FRETE */}
                {etapa === 2 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Selecione o frete
                    </Typography>
                    {carregandoFrete ? (
                      <Loading />
                    ) : (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" >
                          Opções de Entrega:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {Array.isArray(opcoesFrete) && opcoesFrete.length > 0 ? (
                            opcoesFrete.map((opcao, idx) => (
                              // <FormControlLabel
                              //   key={idx}
                              //   value={opcao.id || opcao.nome}
                              //   control={<Radio />}
                              //   label={`${opcao.nome || opcao.company?.name} - R$ ${Number(opcao.preco || opcao.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - ${opcao.prazo_entrega || opcao.delivery_time} dias`}
                              // />
                              <Paper
                                key={idx}
                                sx={{
                                  p: 1,
                                  cursor: 'pointer',
                                  border: freteSelecionado === opcao ? '2px solid' : '1px solid',
                                  borderColor: freteSelecionado === opcao ? 'primary.main' : 'divider',
                                  '&:hover': { borderColor: 'primary.light' }
                                }}
                                onClick={() => {
                                  setFreteSelecionado(opcao)
                                  console.log('Frete selecionado:', opcao);
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {opcao.company?.picture && (
                                      <img
                                        src={opcao.company.picture}
                                        alt={opcao.company.name}
                                        style={{ width: 30, height: 30, objectFit: 'contain' }}
                                      />
                                    )}
                                    <Typography variant="body2" fontWeight="medium">
                                      {opcao.name || opcao.codigo}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body1" fontWeight="bold" color="primary">
                                      R$ {parseFloat(opcao.price || opcao.valor).toFixed(2).replace('.', ',')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {opcao.delivery_time || opcao.prazoEntrega} dias úteis
                                    </Typography>
                                  </Box>
                                </Box>
                              </Paper>

                            ))
                          ) : (
                            <Typography variant="body2" color="error">
                              Nenhuma opção de frete disponível.
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2, fontWeight: 700 }}
                      onClick={handleContinuarParaPagamento}
                      disabled={carregandoFrete}
                    >
                      Continuar para Pagamento
                    </Button>
                  </Box>
                )}

                {/* PAGAMENTO */}
                {etapa === 3 && (
                  <Box>
                    {/* Método de Pagamento */}
                    <FormControl component="fieldset" fullWidth>
                      <FormLabel component="legend" >
                        Método de Pagamento
                      </FormLabel>
                      <RadioGroup
                        row
                        value={metodo}
                        onChange={(e) => setMetodo(e.target.value)}
                      >
                        <FormControlLabel
                          value="cartao"
                          control={<Radio color="primary" />}
                          label="Cartão de Crédito"
                        />
                      </RadioGroup>
                    </FormControl>
                    <Divider sx={{ my: 3 }} />
                    {metodo === 'cartao' ? (
                      <PagamentoCartao
                        pedidoId={pedidoId}
                        valor={valorTotal}
                        valorFrete={valorFrete}
                      />
                    ) : (
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 8 }}>
                        Selecione um método de pagamento para continuar.
                      </Typography>
                    )}
                  </Box>
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