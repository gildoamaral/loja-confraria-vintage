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
} from '@mui/material';
import api from '../../services/api';
import PagamentoCartao from './PagamentoCartao';

const Pagamento = () => {
  const [pedidoId, setPedidoId] = useState(null); // Adicione isso ao seu state
  const [metodo, setMetodo] = useState('');
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
  // const [valorTotal, setValorTotal] = useState(0); // Adicione isso ao seu state

  useEffect(() => {
    const fetchPedidoCarrinho = async () => {
      try {
        const response = await api.get('/pedidos/carrinho');
        if (response.data && response.data.id) {
          setPedidoId(response.data.id);
          // setValorTotal(response.data.valorTotal); // Obtenha o valor total da resposta da API
          console.log('Pedido em andamento encontrado:', pedidoId);
          console.log('Dados do pedido:', response.data);

        } else {
          console.error('Nenhum pedido em andamento encontrado.');
        }
      } catch (error) {
        console.error('Erro ao buscar o pedido do carrinho:', error);
      }
    };
    fetchPedidoCarrinho();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleEnderecoChange = (e) => {
    setEndereco({ ...endereco, [e.target.name]: e.target.value });
  };


  const handleContinuar = async () => {
    const { cep, rua, numero, complemento, bairro, cidade, estado } = endereco;

    
    // if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
    //   alert('Por favor, preencha todos os campos obrigatórios.');
    //   return;
    // }

    const enderecoCompleto =
      `${rua}, ${numero}${complemento ? ', ' + complemento : ''}, ${bairro}, ${cidade} - ${estado}, CEP: ${cep}`;

    console.log('Endereço completo:', enderecoCompleto);

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
    <Box sx={{ flexGrow: 1, minHeight: '80vh', p: 4, background: '#f8f8f8' }}>
      <Paper elevation={3} sx={{ 
        // maxWidth: 800, 
        mx: 'auto', p: 3, borderRadius: 3 }} >

        <Grid container spacing={4} >
          <Grid item xs={12} md={6} sx={{maxWidth: 800, }}>

            <Typography variant="h5" fontWeight={700} gutterBottom>
              Endereço de Entrega
            </Typography>

            <Grid container spacing={2}>
                <TextField
                  label="CEP"
                  name="cep"
                  value={endereco.cep}
                  onChange={handleEnderecoChange}
                  fullWidth
                  required
                  disabled={etapa !== 1}
                />
                <TextField
                  label="Rua"
                  name="rua"
                  value={endereco.rua}
                  onChange={handleEnderecoChange}
                  fullWidth
                  required
                  disabled={etapa !== 1}
                />
                <TextField
                  label="Número"
                  name="numero"
                  value={endereco.numero}
                  onChange={handleEnderecoChange}
                  fullWidth
                  required
                  disabled={etapa !== 1}
                />
                <TextField
                  label="Complemento"
                  name="complemento"
                  value={endereco.complemento}
                  onChange={handleEnderecoChange}
                  fullWidth
                  disabled={etapa !== 1}
                />
                <TextField
                  label="Bairro"
                  name="bairro"
                  value={endereco.bairro}
                  onChange={handleEnderecoChange}
                  fullWidth
                  required
                  disabled={etapa !== 1}
                />
                <TextField
                  label="Cidade"
                  name="cidade"
                  value={endereco.cidade}
                  onChange={handleEnderecoChange}
                  fullWidth
                  required
                  disabled={etapa !== 1}
                />
                <TextField
                  label="UF"
                  name="estado"
                  value={endereco.estado}
                  onChange={handleEnderecoChange}
                  fullWidth
                  required
                  inputProps={{ maxLength: 2 }}
                  disabled={etapa !== 1}
                />

            </Grid>

            {etapa === 1 && (
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3, fontWeight: 700 }}
                fullWidth
                onClick={handleContinuar}
              >
                Continuar
              </Button>
            )}
          </Grid>

          {/* SEGUNDA SEÇÃO: PAGAMENTO */}
          
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              width: '100%',
              maxWidth: 800
            }}
          >
            {etapa === 2 ? (
              <Box sx={{ width: '100%'}}>
                <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                  <FormLabel component="legend" sx={{ mb: 1 }}>
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
                <Divider sx={{ mb: 3 }} />
                {metodo === 'cartao' ? (
                  <>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Dados do Cartão
                    </Typography>
                    <PagamentoCartao
                      pedidoId={pedidoId}
                    // valor={valorTotal}
                    />
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 8 }}>
                    Selecione um método de pagamento para continuar.
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 8 }}>
                Preencha o endereço e clique em "Continuar".
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Pagamento;