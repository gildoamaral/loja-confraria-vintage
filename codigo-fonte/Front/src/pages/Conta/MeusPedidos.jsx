import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  Button, 
  Divider,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  IconButton
} from '@mui/material';
import { 
  Link as RouterLink 
} from 'react-router-dom';
import {
  Receipt as ReceiptIcon,
  Visibility as VisibilityIcon,
  ShoppingBag as ShoppingBagIcon
} from '@mui/icons-material';
import { getPedidos } from '../../services/usuarioService';

const MeusPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const data = await getPedidos();
        setPedidos(data);
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
        <Typography variant="h4" gutterBottom>
          Meus Pedidos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Acompanhe o histórico dos seus pedidos
        </Typography>
      </Box>

      {pedidos.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Avatar sx={{ 
              bgcolor: 'grey.100', 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2 
            }}>
              <ShoppingBagIcon sx={{ fontSize: 40, color: 'grey.400' }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Nenhum pedido encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Você ainda não tem nenhum pedido finalizado.
            </Typography>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/produtos"
            >
              Começar a Comprar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {pedidos.map((pedido) => (
            <Grid size={{ xs: 12 }} key={pedido.id}>
              <Card sx={{ 
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                    {/* Informações do Pedido */}
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <ReceiptIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Pedido Nº {pedido.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Realizado em: {new Date(pedido.dataFinalizado).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Status e Valor */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-end',
                      gap: 1
                    }}>
                      <Chip 
                        label={pedido.status.replace('_', ' ')} 
                        color={getStatusColor(pedido.status)}
                        size="small"
                      />
                      <Typography variant="h6" color="success.main">
                        {pedido.pagamento?.valor.toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </Typography>
                    </Box>

                    {/* Botão Ver Detalhes */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        component={RouterLink}
                        to={`/minha-conta/pedidos/${pedido.id}`}
                        startIcon={<VisibilityIcon />}
                        sx={{ minWidth: 140 }}
                      >
                        Ver Detalhes
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MeusPedidos;