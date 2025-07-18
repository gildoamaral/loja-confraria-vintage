import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  Grid, 
  Divider, 
  Button,
  Card,
  CardContent,
  Chip,
  Avatar
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  ShoppingBag as ShoppingBagIcon
} from '@mui/icons-material';
import { getDetalhePedido } from '../../services/usuarioService';

const DetalhePedido = () => {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetalhes = async () => {
      try {
        setLoading(true);
        const data = await getDetalhePedido(id);
        setPedido(data);
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };
    fetchDetalhes();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button component={RouterLink} to="/minha-conta/pedidos" variant="outlined">
          Voltar para Meus Pedidos
        </Button>
      </Box>
    );
  }
  
  if (!pedido) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Pedido não encontrado
        </Typography>
        <Button component={RouterLink} to="/minha-conta/pedidos" variant="contained">
          Voltar para Meus Pedidos
        </Button>
      </Box>
    );
  }

  const { itens, pagamento, rua, numero, bairro, cidade, estado, cep } = pedido;

  const getStatusColor = (status) => {
    switch (status) {
      case 'FINALIZADO':
        return 'success';
      case 'PENDENTE':
        return 'warning';
      case 'CANCELADO':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button 
          component={RouterLink} 
          to="/minha-conta/pedidos" 
          startIcon={<ArrowBackIcon />} 
          sx={{ mb: 2 }}
          variant="outlined"
        >
          Voltar para Meus Pedidos
        </Button>
        <Typography variant="h4" gutterBottom>
          Detalhes do Pedido
        </Typography>
        <Typography variant="h5" color="primary" gutterBottom>
          Nº {pedido.id}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Resumo do Pedido */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <ReceiptIcon />
                </Avatar>
                <Typography variant="h6">Resumo do Pedido</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Data do Pedido:</Typography>
                  <Typography>{new Date(pedido.dataFinalizado).toLocaleString('pt-BR')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography color="text.secondary">Status:</Typography>
                  <Chip 
                    label={pedido.status.replace('_', ' ')} 
                    color={getStatusColor(pedido.status)}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Total Pago:</Typography>
                  <Typography variant="h6" color="success.main">
                    {pagamento?.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Método:</Typography>
                  <Typography>{pagamento?.metodo}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Endereço de Entrega */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <ShippingIcon />
                </Avatar>
                <Typography variant="h6">Endereço de Entrega</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography>{rua}, {numero}</Typography>
                <Typography>{bairro}</Typography>
                <Typography>{cidade} - {estado}</Typography>
                <Typography>CEP: {cep}</Typography>
                
                {/* Informações de Frete */}
                {(pedido.empresaFrete || pedido.codigoRastreio || pedido.status === 'PAGO' || pedido.status === 'ENVIADO') && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Informações de Entrega:
                    </Typography>
                    {pedido.empresaFrete && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Transportadora:</Typography>
                        <Typography fontWeight={600}>{pedido.empresaFrete}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography color="text.secondary">Status de Envio:</Typography>
                      {pedido.codigoRastreio ? (
                        <Chip 
                          label={pedido.codigoRastreio}
                          variant="outlined"
                          size="small"
                          color="success"
                          sx={{ 
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            letterSpacing: 1
                          }}
                        />
                      ) : (
                        <Chip 
                          label="Aguardando postagem"
                          variant="outlined"
                          size="small"
                          color="warning"
                          sx={{ 
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                    </Box>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Itens Comprados */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <ShoppingBagIcon />
                </Avatar>
                <Typography variant="h6">Itens Comprados</Typography>
                <Chip 
                  label={`${itens.length} ${itens.length === 1 ? 'item' : 'itens'}`} 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              {itens.map((item, index) => (
                <Box key={item.id}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    mb: index === itens.length - 1 ? 0 : 2
                  }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      mr: 2,
                      flexShrink: 0
                    }}>
                      <img 
                        src={item.produto.imagens[0]?.urls.thumbnail} 
                        alt={item.produto.nome} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover'
                        }} 
                      />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {item.produto.nome}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">
                          Quantidade: <strong>{item.quantidade}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Preço Unitário: <strong>
                            {(item.produto.precoPromocional ?? item.produto.preco)
                              .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </strong>
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          Subtotal: <strong>
                            {((item.produto.precoPromocional ?? item.produto.preco) * item.quantidade)
                              .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </strong>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DetalhePedido;