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
  TextField,     
  IconButton,
  Tooltip,
  Dialog,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  Badge
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  ShoppingBag as ShoppingBagIcon,
  ContentCopy as ContentCopyIcon,
  CalendarToday as CalendarIcon,
  CreditCard as PaymentIcon,
  Inventory as InventoryIcon,
  AccountBalance as BankIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocalOffer as DiscountIcon,
  Receipt as InvoiceIcon,
  QrCode as QrCodeIcon,
  Pix as PixIcon,
  CreditCard,
  LocalShipping
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

  // Função para formatar data e hora
  const formatarDataHora = (data) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Função para obter cor do status com mais estados
  const getStatusColor = (status) => {
    switch (status) {
      case 'FINALIZADO':
      case 'ENTREGUE':
        return 'success';
      case 'PAGO':
      case 'EM_PREPARACAO':
      case 'EM_TRANSPORTE':
        return 'info';
      case 'ENVIADO':
        return 'primary';
      case 'AGUARDANDO_PAGAMENTO':
        return 'warning';
      case 'CANCELADO':
      case 'DEVOLVIDO':
        return 'error';
      case 'REEMBOLSADO':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Função para traduzir status para português
  const traduzirStatus = (status) => {
    const traducoes = {
      'AGUARDANDO_PAGAMENTO': 'Aguardando Pagamento',
      'PAGO': 'Pago',
      'ENVIADO': 'Enviado',
      'ENTREGUE': 'Entregue',
      'CANCELADO': 'Cancelado',
      'EM_PREPARACAO': 'Em Preparação',
      'EM_TRANSPORTE': 'Em Transporte',
      'FINALIZADO': 'Finalizado',
      'EM_DEVOLUCAO': 'Em Devolução',
      'DEVOLVIDO': 'Devolvido',
      'REEMBOLSADO': 'Reembolsado'
    };
    return traducoes[status] || status;
  };

  // Função para obter steps do processo
  const getOrderSteps = () => {
    const allSteps = [
      { label: 'Pedido Criado', status: 'AGUARDANDO_PAGAMENTO' },
      { label: 'Pagamento Aprovado', status: 'PAGO' },
      { label: 'Em Preparação', status: 'EM_PREPARACAO' },
      { label: 'Enviado', status: 'ENVIADO' },
      { label: 'Entregue', status: 'ENTREGUE' }
    ];

    const currentIndex = allSteps.findIndex(step => step.status === pedido.status);
    return { steps: allSteps, activeStep: Math.max(0, currentIndex) };
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

  // Dados para cálculo do processo de pedido
  const orderStepsData = getOrderSteps();

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', p: 2 }}>
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
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: { xs: 1, sm: 2 }, 
          mb: 2 
        }}>
          <Typography 
            variant="h4" 
            color="error.main"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem' },
              wordBreak: 'break-all'
            }}
          >
            Pedido #{pedido.id.toUpperCase()}
          </Typography>
          <Chip 
            label={traduzirStatus(pedido.status)}
            color={getStatusColor(pedido.status)}
            size={window.innerWidth < 600 ? "small" : "medium"}
            variant="filled"
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.9rem' }, 
              fontWeight: 600,
              alignSelf: { xs: 'flex-start', sm: 'center' }
            }}
          />
        </Box>
        
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {pedido.dataFinalizado && `Criado em ${formatarDataHora(pedido.dataFinalizado)}`}
        </Typography>
      </Box>

      {/* Alerta PIX se aplicável */}
      {pedido.status === 'AGUARDANDO_PAGAMENTO' && pagamento?.metodo === 'PIX' && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, textAlign: 'justify' }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => setPixModalOpen(true)}
              startIcon={<QrCodeIcon />}
            >
              Ver PIX
            </Button>
          }
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Pagamento PIX Pendente
          </Typography>
          Seu pagamento via PIX está aguardando confirmação. Clique em "Ver PIX" para acessar os dados de pagamento.
        </Alert>
      )}

      {/* Cronologia do Pedido */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <ScheduleIcon />
            </Avatar>
          }
          title="Cronologia do Pedido"
          subheader="Acompanhe o status do seu pedido"
        />
        <CardContent>
          <Stepper activeStep={orderStepsData.activeStep} orientation="horizontal" alternativeLabel>
            {orderStepsData.steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel 
                  icon={
                    index <= orderStepsData.activeStep ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <ScheduleIcon color="disabled" />
                    )
                  }
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Datas importantes */}
          <Box sx={{ mt: 3, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {pedido.dataFinalizado && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Criação</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatarDataHora(pedido.dataFinalizado)}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Coluna Esquerda */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Resumo Financeiro */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: 'success.main' }}><PaymentIcon /></Avatar>}
              title="Resumo Financeiro"
              subheader="Detalhamento dos valores"
            />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ border: 0, fontWeight: 500 }}>Produtos:</TableCell>
                      <TableCell align="right" sx={{ border: 0 }}>
                        {pagamento?.valorProdutos?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ border: 0, fontWeight: 500 }}>Frete:</TableCell>
                      <TableCell align="right" sx={{ border: 0 }}>
                        {pagamento?.valorFrete?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'N/A'}
                      </TableCell>
                    </TableRow>
                    {pagamento?.valorTaxaCartao > 0 && (
                      <TableRow>
                        <TableCell sx={{ border: 0, fontWeight: 500 }}>Taxa Cartão:</TableCell>
                        <TableCell align="right" sx={{ border: 0 }}>
                          {pagamento.valorTaxaCartao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                      </TableRow>
                    )}
                    {pagamento?.valorTaxaParcelamento > 0 && (
                      <TableRow>
                        <TableCell sx={{ border: 0, fontWeight: 500 }}>Taxa Parcelamento:</TableCell>
                        <TableCell align="right" sx={{ border: 0 }}>
                          {pagamento.valorTaxaParcelamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                      </TableRow>
                    )}
                    {pagamento?.descontos > 0 && (
                      <TableRow>
                        <TableCell sx={{ border: 0, fontWeight: 500, color: 'success.main' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DiscountIcon fontSize="small" sx={{ mr: 0.5 }} />
                            Descontos:
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ border: 0, color: 'success.main' }}>
                          -{pagamento.descontos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow sx={{ bgcolor: 'primary.50' }}>
                      <TableCell sx={{ border: 0, fontWeight: 700, fontSize: '1.1rem' }}>Total:</TableCell>
                      <TableCell align="right" sx={{ border: 0, fontWeight: 700, fontSize: '1.1rem', color: 'primary.main' }}>
                        {pagamento?.valorTotal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'N/A'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Informações de pagamento */}
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Detalhes do Pagamento:
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PaymentIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Método" 
                      secondary={pagamento?.metodo || 'N/A'} 
                    />
                  </ListItem>
                  {pagamento?.parcelas && pagamento.parcelas > 1 && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CreditCard fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Parcelas" 
                        secondary={`${pagamento.parcelas}x de ${(pagamento.valorTotal / pagamento.parcelas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                      />
                    </ListItem>
                  )}
                  {pagamento?.gatewayTransactionId && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <ReceiptIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="ID Transação" 
                        secondary={pagamento.gatewayTransactionId} 
                      />
                    </ListItem>
                  )}
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Badge 
                        color={getStatusColor(pagamento?.status)} 
                        variant="dot"
                      >
                        <InfoIcon fontSize="small" />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Status" 
                      secondary={pagamento?.status || 'N/A'} 
                    />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>

          {/* Dados Fiscais */}
          {pedido.chaveNotaFiscal && (
            <Card sx={{ mb: 3 }}>
              <CardHeader
                avatar={<Avatar sx={{ bgcolor: 'info.main' }}><InvoiceIcon /></Avatar>}
                title="Dados Fiscais"
                subheader="Informações da Nota Fiscal"
              />
              <CardContent>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <InvoiceIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Chave NF-e" 
                      secondary={pedido.chaveNotaFiscal} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Coluna Central */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Endereço de Entrega */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}><ShippingIcon /></Avatar>}
              title="Endereço de Entrega"
              subheader="Local de entrega do pedido"
            />
            <CardContent>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                {rua}, {numero}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {bairro}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {cidade} - {estado}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                CEP: {cep}
              </Typography>

            </CardContent>
          </Card>

          {/* Informações Logísticas */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: 'warning.main' }}><LocalShipping /></Avatar>}
              title="Informações Logísticas"
              subheader="Detalhes de envio e entrega"
            />
            <CardContent>
              <List dense>
                {pedido.empresaFrete && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ShippingIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Transportadora" 
                      secondary={pedido.empresaFrete} 
                    />
                  </ListItem>
                )}
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <InfoIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Status de Envio"
                    secondary={
                      pedido.codigoRastreio ? (
                        <Chip 
                          label="Enviado"
                          variant="outlined"
                          size="small"
                          color="success"
                          sx={{ 
                            fontSize: '0.75rem',
                            mt: 0.5
                          }}
                        />
                      ) : (
                        <Chip 
                          label="Aguardando postagem"
                          variant="outlined"
                          size="small"
                          color="warning"
                          sx={{ 
                            fontSize: '0.75rem',
                            mt: 0.5
                          }}
                        />
                      )
                    } 
                  />
                </ListItem>

                {/* Código de Rastreio - só aparece se existir */}
                {pedido.codigoRastreio && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ReceiptIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Código de Rastreio"
                      secondary={pedido.codigoRastreio}
                    />
                  </ListItem>
                )}

                
                {pedido.melhorEnvioId && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ReceiptIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="ID Melhor Envio" 
                      secondary={pedido.melhorEnvioId} 
                    />
                  </ListItem>
                )}

                {pedido.statusEtiqueta && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Status da Etiqueta" 
                      secondary={pedido.statusEtiqueta.replace(/_/g, ' ')} 
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Coluna Direita - Itens */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader
              avatar={
                <Badge badgeContent={itens.length} color="primary">
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <ShoppingBagIcon />
                  </Avatar>
                </Badge>
              }
              title="Itens Comprados"
              subheader={`${itens.length} ${itens.length === 1 ? 'produto' : 'produtos'}`}
            />
            <CardContent sx={{ maxHeight: 600, overflowY: 'auto' }}>
              {itens.map((item, index) => (
                <Paper 
                  key={item.id} 
                  elevation={1}
                  sx={{ 
                    p: 2,
                    mb: index === itens.length - 1 ? 0 : 2,
                    border: 1,
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: 1,
                      borderColor: 'divider'
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
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          mb: 1,
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {item.produto.nome}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Qtd: <strong>{item.quantidade}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Unitário: <strong>
                            {(item.produto.precoPromocional ?? item.produto.preco)
                              .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </strong>
                        </Typography>
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                          Total: {((item.produto.precoPromocional ?? item.produto.preco) * item.quantidade)
                            .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Typography>
                      </Box>
                      
                      {/* Informações adicionais do produto */}
                      {(item.produto.cor || item.produto.tamanho) && (
                        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {item.produto.cor && (
                            <Chip 
                              label={item.produto.cor} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.6rem', height: 20 }}
                            />
                          )}
                          {item.produto.tamanho && (
                            <Chip 
                              label={item.produto.tamanho} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.6rem', height: 20 }}
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal PIX */}
      <Dialog 
        open={pixModalOpen} 
        onClose={() => setPixModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <Card>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: 'warning.main' }}><PixIcon /></Avatar>}
            title="Pagamento PIX"
            subheader="Finalize seu pagamento"
            action={
              <IconButton onClick={() => setPixModalOpen(false)}>
                <ArrowBackIcon />
              </IconButton>
            }
          />
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Escaneie o QR Code ou use o código PIX Copia e Cola abaixo:
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
            
            <TextField
              fullWidth
              label="Código PIX Copia e Cola"
              value={pagamento.pixQrCode || ''}
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
              >
                Fechar
              </Button>
              <Button 
                onClick={() => handleCopy(pagamento.pixQrCode)}
                variant="contained"
                startIcon={<ContentCopyIcon />}
              >
                Copiar Código
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Dialog>
    </Box>
  );
};

export default DetalhePedido;