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
  Avatar,
  TextField,     // <-- Adicione estes imports
  IconButton,
  Tooltip,
  Dialog
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  ShoppingBag as ShoppingBagIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { getDetalhePedido } from '../../services/usuarioService';

const DetalhePedido = () => {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [pixModalOpen, setPixModalOpen] = useState(false);

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

  const handleCopy = (textToCopy) => {
        navigator.clipboard.writeText(textToCopy);
        setCopySuccess('Copiado!');
        setTimeout(() => setCopySuccess(''), 2000);
    };

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

  const { itens = [], pagamento = {}, rua, numero, bairro, cidade, estado, cep } = pedido || {};

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
          color='error'
          startIcon={<ArrowBackIcon />} 
          sx={{ mb: 2 }}
          variant="outlined"
        >
          Voltar para Meus Pedidos
        </Button>
        <Typography variant="h4" color="errr.main" gutterBottom>
          Detalhes do Pedido
        </Typography>
        <Typography variant="h5" color="errr.main" gutterBottom>
          Nº {pedido.id}
        </Typography>
      </Box>

      {pedido.status === 'AGUARDANDO_PAGAMENTO' && pagamento?.metodo === 'PIX' && (
        <>
          <Card sx={{ mb: 3, border: '2px solid', borderColor: 'warning.main', bgcolor: '#FFF3CD' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <ContentCopyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="warning.main" gutterBottom>
                      Pagamento PIX Pendente
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Seu pagamento via PIX está aguardando confirmação. Clique para visualizar os dados de pagamento.
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  color="warning" 
                  onClick={() => setPixModalOpen(true)}
                  sx={{ ml: 2 }}
                >
                  Ver PIX
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <Dialog 
            open={pixModalOpen} 
            onClose={() => setPixModalOpen(false)} 
            maxWidth="sm" 
            fullWidth
            scroll="body"
            PaperProps={{
              sx: {
                borderRadius: 2,
                maxHeight: '90vh',
                overflow: 'hidden'
              }
            }}
          >
            <Card sx={{ maxHeight: '90vh', overflow: 'auto' }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'error.main', mr: 2, width: 48, height: 48 }}>
                    <ContentCopyIcon />
                  </Avatar>
                  <Typography variant="h5" color="error.main">
                    Finalize seu Pagamento PIX
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Escaneie o QR Code abaixo com o app do seu banco ou use o código PIX Copia e Cola.
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 3,
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  border: '2px dashed',
                  borderColor: 'grey.300'
                }}>
                  <img
                    src={`data:image/png;base64,${pagamento.pixQrCodeBase64}`}
                    alt="QR Code PIX"
                    style={{ maxWidth: '200px', borderRadius: '8px' }}
                  />
                </Box>
                
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Código PIX Copia e Cola:
                </Typography>
                
                <TextField
                  fullWidth
                  value={pagamento.pixQrCode}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Tooltip title="Copiar código PIX">
                        <IconButton 
                          onClick={() => handleCopy(pagamento.pixQrCode)}
                          edge="end"
                          color="primary"
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    ),
                  }}
                />
                
                {copySuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {copySuccess}
                  </Alert>
                )}
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button 
                    onClick={() => setPixModalOpen(false)} 
                    variant="outlined" 
                    color="primary"
                  >
                    Fechar
                  </Button>
                  <Button 
                    onClick={() => handleCopy(pagamento.pixQrCode)}
                    variant="contained" 
                    color="primary"
                    startIcon={<ContentCopyIcon />}
                  >
                    Copiar Código
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Dialog>
        </>
      )}

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