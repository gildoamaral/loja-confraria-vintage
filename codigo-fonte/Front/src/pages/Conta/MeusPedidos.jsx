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
    <Box sx={{ p: { xs: 1, sm: 2, md: 0 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.8rem', sm: '2.1rem', md: '2.5rem' } }}>
          Meus Pedidos
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          Acompanhe o histórico dos seus pedidos
        </Typography>
      </Box>

      {pedidos.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: { xs: 4, sm: 8 }, px: { xs: 2, sm: 3 } }}>
            <Avatar sx={{ 
              bgcolor: 'grey.100', 
              width: { xs: 60, sm: 80 }, 
              height: { xs: 60, sm: 80 }, 
              mx: 'auto', 
              mb: 2 
            }}>
              <ShoppingBagIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: 'grey.400' }} />
            </Avatar>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Nenhum pedido encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Você ainda não tem nenhum pedido finalizado.
            </Typography>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/produtos"
              sx={{ 
                backgroundColor: 'var(--cor-marca-escuro)', 
                '&:hover': { backgroundColor: 'brown' },
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 2, sm: 3 }
              }}
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
                    gap: 2,
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}>
                    {/* Informações do Pedido */}
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
                      <Avatar sx={{ bgcolor: 'var(--cor-marca-escuro)', mr: 2, width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
                        <ReceiptIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          Pedido Nº {pedido.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          Realizado em: {new Date(pedido.dataFinalizado).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Status e Valor */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'row', sm: 'column' },
                      alignItems: { xs: 'center', sm: 'flex-end' },
                      justifyContent: { xs: 'space-between', sm: 'flex-start' },
                      gap: 1,
                      width: { xs: '100%', sm: 'auto' }
                    }}>
                      <Chip 
                        label={pedido.status.replace('_', ' ')} 
                        color={getStatusColor(pedido.status)}
                        size="small"
                      />
                      <Typography variant="h6" color="success.main" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        {pedido.pagamento?.valorTotal.toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </Typography>
                    </Box>

                    {/* Botão Ver Detalhes */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      width: { xs: '100%', sm: 'auto' },
                      mt: { xs: 2, sm: 0 }
                    }}>
                      <Button
                        variant="contained"
                        component={RouterLink}
                        to={`/minha-conta/pedidos/${pedido.id}`}
                        startIcon={<VisibilityIcon />}
                        sx={{ 
                          minWidth: { xs: '100%', sm: 140 },
                          backgroundColor: 'var(--cor-marca-escuro)', 
                          '&:hover': { backgroundColor: 'brown' },
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
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