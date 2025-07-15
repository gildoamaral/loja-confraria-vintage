import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  Button, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Skeleton,
  Chip
} from '@mui/material';
import { 
  ShoppingBag as OrdersIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  TrendingUp as StatsIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getDashboardData } from '../../services/usuarioService';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Painel
      </Typography>
      <Typography variant="h6" sx={{ mb: 4 }}>
        Olá, {data?.nomeUsuario}! Bem-vindo(a) de volta.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <OrdersIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Último Pedido</Typography>
              </Box>
              {data?.ultimoPedido ? (
                <>
                  <Typography variant="body1" gutterBottom>
                    Pedido Nº: <strong>{data.ultimoPedido.id}</strong>
                  </Typography>
                  <Chip 
                    label={data.ultimoPedido.status} 
                    color="primary" 
                    variant="outlined"
                    size="small"
                  />
                </>
              ) : (
                <Typography color="text.secondary">
                  Você ainda não fez nenhum pedido.
                </Typography>
              )}
            </CardContent>
            {data?.ultimoPedido && (
              <CardActions>
                <Button 
                  component={RouterLink} 
                  to={`/minha-conta/pedidos/${data.ultimoPedido.id}`}
                  variant="outlined"
                  size="small"
                  startIcon={<ViewIcon />}
                >
                  Ver Detalhes
                </Button>
              </CardActions>
            )}
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Atalhos</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  component={RouterLink} 
                  to="/minha-conta/pedidos" 
                  variant="text"
                  startIcon={<OrdersIcon />}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Ver todos os pedidos
                </Button>
                <Button 
                  component={RouterLink} 
                  to="/minha-conta/configuracoes" 
                  variant="text"
                  startIcon={<SettingsIcon />}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Editar minhas informações
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;