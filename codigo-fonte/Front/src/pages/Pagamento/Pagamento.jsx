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
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import PagamentoCartao from './PagamentoCartao';
import Header from '../../components/Header';

const Pagamento = () => {
  const location = useLocation();
  const valorTotal = location.state?.valorTotal;
  const quantidadeTotal = location.state?.quantidadeTotal;

  const [pedidoId, setPedidoId] = useState(null);
  const [metodo, setMetodo] = useState('');
  const [usuario, setUsuario] = useState(null); // Novo estado
  const [usarEnderecoCadastrado, setUsarEnderecoCadastrado] = useState(true);
  const [enderecoFormatado, setEnderecoFormatado] = useState("");
  const [endereco, setEndereco] = useState({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });
  const [etapa, setEtapa] = useState(1);

  useEffect(() => {
    // Busca dados do usuário logado
    const fetchUsuario = async () => {
      try {
        const res = await api.get('/usuarios/conta');
        setUsuario(res.data);

      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
      }
    };
    fetchUsuario();

    // Busca pedido
    const fetchPedidoCarrinho = async () => {
      try {
        const response = await api.get('/pedidos/carrinho');
        if (response.data && response.data.id) {
          setPedidoId(response.data.id);
          console.log('Endereço do usuário:', response.data.enderecoEntrega);

          setEndereco(parseEndereco(response.data.enderecoEntrega));
          setEnderecoFormatado(response.data.enderecoEntrega);
        }
      } catch (error) {
        console.error('Erro ao buscar o pedido do carrinho:', error);
      }
    };
    fetchPedidoCarrinho();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Função para converter string de endereço em objeto
  function parseEndereco(enderecoStr) {
    // Exemplo simples, adapte conforme seu formato real
    // "Rua X, 123, Bairro, Cidade - UF, CEP: 00000-000"
    const match = enderecoStr.match(/^(.*), (\d+)(?:, (.*))?, (.*), (.*) - (\w{2}), CEP: (.*)$/);
    if (!match) return endereco;
    return {
      rua: match[1] || '',
      numero: match[2] || '',
      complemento: match[3] || '',
      bairro: match[4] || '',
      cidade: match[5] || '',
      estado: match[6] || '',
      cep: match[7] || '',
    };
  }

  // Ao clicar em "Usar endereço cadastrado"
  const handleUsarEnderecoCadastrado = () => {
    if (usuario?.endereco) {
      setEndereco(parseEndereco(usuario.endereco));
      setUsarEnderecoCadastrado(true);
    }
  };

  // Ao clicar em "Preencher novo endereço"
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

  const handleEnderecoChange = (e) => {
    setEndereco({ ...endereco, [e.target.name]: e.target.value });
  };

  const handleContinuar = async () => {
    if (usarEnderecoCadastrado) {
      try {
        // TESTANDO
        // if (!pedidoId) {
        //   alert('Pedido não encontrado!');
        //   return;
        // }

        // TESTANDO
        // await api.put(`/pedidos/endereco/${pedidoId}`, {
        //   enderecoEntrega: enderecoCompleto,
        // });

        setEtapa(2);
      } catch (error) {
        console.error('Erro ao continuar para a próxima etapa:', error);
      }

      return;
    }


    const { cep, rua, numero, complemento, bairro, cidade, estado } = endereco;


    // if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
    //   alert('Por favor, preencha todos os campos obrigatórios.');
    //   return;
    // }

    // const enderecoCompleto =
    //   `${rua}, ${numero}${complemento ? ', ' + complemento : ''}, ${bairro}, ${cidade} - ${estado}, CEP: ${cep}`;

    const enderecoCompletoFormatado = (
      <>
        {rua}, {numero}
        {complemento && `, ${complemento}`}<br />
        {bairro}, {cidade} - {estado}<br />
        CEP: {cep}
      </>
    )

    setEnderecoFormatado(enderecoCompletoFormatado);

    console.log('Endereço completo:', enderecoCompletoFormatado);

    try {
      // TESTANDO
      // if (!pedidoId) {
      //   alert('Pedido não encontrado!');
      //   return;
      // }

      // TESTANDO
      // await api.put(`/pedidos/endereco/${pedidoId}`, {
      //   enderecoEntrega: enderecoCompleto,
      // });

      setEtapa(2);
    } catch (error) {
      console.error('Erro ao continuar para a próxima etapa:', error);
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: '80vh',
        p: { xs: 0, sm: 4 },
        backgroundColor: 'var(--cor-principal)',
      }}
    >
      <Header invisivel />
      <Paper elevation={3} sx={{ mx: 'auto', p: 3, borderRadius: 3, maxWidth: 900 }}>

        <Typography variant="h5" fontWeight={700} sx={{ textAlign: 'center', mb: 2 }}>
          {etapa === 1 ? 'Endereço de Entrega' : 'Pagamento'}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={4} >

          {/* RESUMOS */}
          <Grid xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>


            {/* Resumo do Pedido */}
            <Card sx={{ mb: 3, background: '#FFF7F2', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Resumo do Pedido
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Valor Total:</Typography>
                  <Typography variant="h5" fontWeight={700} color="primary">
                    R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Quantidade de produtos: <b>{quantidadeTotal}</b>
                </Typography>
                <Divider sx={{ mt: 2 }} />
              </CardContent>
            </Card>

            {/* Resumo dos dados */}
            <Card sx={{ mb: 3, background: '#FFF7F2', borderRadius: 2, width: '100%' }}>
              <CardContent >
                {usuario && (
                  <>
                    <Typography variant="subtitle1" fontWeight={700}>Seus dados</Typography>
                    <Typography variant="body2">Nome: <b>{usuario.nome} {usuario.sobrenome}</b></Typography>
                    <Typography variant="body2">E-mail: <b>{usuario.email}</b></Typography>
                    <Divider sx={{ my: 2 }} />
                  </>
                )}
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Endereço de Entrega
                </Typography>
                <Typography variant="body2">
                  {enderecoFormatado}
                </Typography>
              </CardContent>
            </Card>

          </Grid>

          {/* CONTEUDOS */}
          <Grid xs={12} md={8} sx={{ ml: { xs: 0, md: 8 } }}>
            <Box>


              {/* FORMGROUP */}
              {etapa === 1 && (
                <Box sx={{ mb: 2 }}>
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      value={usarEnderecoCadastrado ? "cadastrado" : "novo"}
                      onChange={(e) => {

                        if (e.target.value === "cadastrado") {
                          handleUsarEnderecoCadastrado();
                        } else {
                          handleNovoEndereco();
                        }
                      }}
                    >
                      <FormControlLabel
                        value="cadastrado"
                        control={<Radio color="primary" />}
                        label="Usar endereço cadastrado"
                      />
                      <FormControlLabel
                        value="novo"
                        control={<Radio color="primary" />}
                        label="Preencher novo endereço"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>
              )}

              {/* CAMPOS DE ENDEREÇO */}
              {etapa === 1 && !usarEnderecoCadastrado && (
                <>
                  <Grid sx={{ display: 'grid', gap: 2, mt: 2 }}>
                    <Grid xs={12} sm={6}>
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
                    <Grid xs={12} sm={6}>
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
                    <Grid xs={12} sm={6}>
                      <TextField
                        label="Complemento"
                        name="complemento"
                        value={endereco.complemento}
                        onChange={handleEnderecoChange}
                        fullWidth
                        disabled={usarEnderecoCadastrado}
                      />
                    </Grid>
                    <Grid xs={12} sm={6}>
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
                    <Grid xs={12} sm={6}>
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
                    <Grid xs={6} sm={3}>
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
                    <Grid xs={6} sm={3}>
                      <TextField
                        label="CEP"
                        name="cep"
                        value={endereco.cep}
                        onChange={handleEnderecoChange}
                        fullWidth
                        required
                        disabled={usarEnderecoCadastrado}
                      />
                    </Grid>
                  </Grid>

                  <Grid xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2, fontWeight: 700 }}
                      onClick={handleContinuar}
                    >
                      Continuar para Pagamento
                    </Button>
                  </Grid>
                </>
              )}
              {etapa === 1 && usarEnderecoCadastrado && (

                <Grid xs={12} >
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2, fontWeight: 700 }}
                    fullWidth
                    onClick={handleContinuar}
                  >
                    Continuar para Pagamento
                  </Button>
                </Grid>
              )}


              {/* ETAPA DE PAGAMENTO */}
              {etapa === 2 && (
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
              )}

            </Box>
          </Grid>

        </Grid>
      </Paper>
    </Box>
  );
};

export default Pagamento;