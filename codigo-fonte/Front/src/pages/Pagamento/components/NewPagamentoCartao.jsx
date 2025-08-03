import React, { useEffect, useState } from "react";
import styles from './PagamentoCartao.module.css'
import imagem from './image.png'
import { Box, Typography, FormLabel, FormControl, Snackbar, Alert } from '@mui/material'
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

// A chave pública do Mercado Pago
const mp = new window.MercadoPago(import.meta.env.VITE_MERCADO_PAGO_KEY);

const PagamentoCartao = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Estados para controlar as mensagens
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const showMessage = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    let cardFormInstance; // Usa uma variável local para a instância

    const renderCardForm = async () => {
      const valorSeguro = Number(props.valor);
      const amount = (!isNaN(valorSeguro) && valorSeguro > 0)
        ? valorSeguro.toFixed(2)
        : "0.01";
      const amountPlusFrete = props.valorFrete ? (Number(props.valorFrete) + Number(amount)).toFixed(2) : amount;

      // Inicializa o formulário de cartão
      cardFormInstance = mp.cardForm({
        amount: amountPlusFrete,
        iframe: true,
        form: {
          id: "form-checkout",
          cardNumber: { id: "form-checkout__cardNumber", placeholder: "0000 0000 0000 0000" },
          expirationDate: { id: "form-checkout__expirationDate", placeholder: "MM/AA" },
          securityCode: { id: "form-checkout__securityCode", placeholder: "123" },
          cardholderName: { id: "form-checkout__cardholderName", placeholder: "Titular do cartão" },
          issuer: { id: "form-checkout__issuer", placeholder: "Banco emissor" },
          installments: { id: "form-checkout__installments", placeholder: "Parcelas" },
          identificationType: { id: "form-checkout__identificationType", placeholder: "Tipo de documento" },
          identificationNumber: { id: "form-checkout__identificationNumber", placeholder: "Número do documento" },
          cardholderEmail: { id: "form-checkout__cardholderEmail", placeholder: "E-mail" },
        },
        callbacks: {
          onFormMounted: error => {
            if (error) return console.warn("Form Mounted handling error: ", error);
            console.log("Formulário de cartão montado.");
          },
          onSubmit: event => {
            event.preventDefault();
            setIsSubmitting(true);

            const cardFormData = cardFormInstance.getCardFormData();

            api.post('/pagamentos/criar-cartao', {
              transaction_amount: Number(cardFormData.amount),
              token: cardFormData.token,
              description: "Descrição do produto",
              installments: Number(cardFormData.installments),
              payment_method_id: cardFormData.paymentMethodId,
              issuer_id: cardFormData.issuerId,
              payer: {
                email: cardFormData.cardholderEmail,
                identification: {
                  type: cardFormData.identificationType,
                  number: cardFormData.identificationNumber,
                },
              },
              pedidoId: props.pedidoId,
              valorFrete: props.valorFrete ?? 0,
              nomeFrete: props.nomeFrete ?? "Não informado",
            })
            .then(response => {
              if (response.data.status === 'pending') {
                showMessage("Pagamento em processamento. Aguardando confirmação.", 'info');
                setTimeout(() => navigate('/minha-conta'), 2000);
              }
              if (response.data.status === 'success') {
                showMessage("Pagamento realizado com sucesso!", 'success');
                setTimeout(() => navigate('/minha-conta'), 2000);
              }
            })
            .catch(error => {
              setIsSubmitting(false);
              if (error.response && error.response.status === 402) {
                showMessage("Pagamento negado pelo cartão. Tente novamente ou use outro cartão.", 'error');
              } else {
                showMessage("Erro ao processar pagamento.", 'error');
                setTimeout(() => navigate('/carrinho'), 2000);
              }
            })
            .finally(() => {
              // Não desativa o isSubmitting aqui para evitar duplo clique
            });
          },
          onFetching: (resource) => {
            console.log("Buscando recurso: ", resource);
            const progressBar = document.querySelector(".progress-bar");
            if(progressBar) progressBar.removeAttribute("value");
            return () => {
              if(progressBar) progressBar.setAttribute("value", "0");
            };
          }
        },
      });
    };

    renderCardForm();

    // --- A CORREÇÃO ESTÁ AQUI ---
    // Função de limpeza que será executada quando o componente for desmontado
    return () => {
      if (cardFormInstance) {
        console.log("Desmontando a instância do CardForm.");
        // Chama o método .unmount() para destruir o formulário corretamente
        cardFormInstance.unmount();
      }
    };
  }, [props.valor, props.valorFrete, props.pedidoId, props.nomeFrete, navigate]); // Adiciona dependências para recriar o form se o valor mudar

  return (
    <Box sx={{
      justifySelf: 'center',
    }}>
      <form id="form-checkout" className={styles.formCheckout}>
        {/* ... seu JSX do formulário continua exatamente igual ... */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            marginBottom: 4,
            alignSelf: 'center',
          }}
          maxWidth='400px'
        >
          <Box
            className={styles.translucentEffect}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 3,
              width: 'auto',
              borderRadius: "20px",
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 4,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: {xs: "1rem", sm: 0} }}>
              <Typography sx={{ color: 'black' }} variant="subtitle2"> Cartão de Crédito </Typography>
              <CreditCardRoundedIcon sx={{ color: 'text.secondary' }} />
            </Box>

            <Box
              component="img"
              src={imagem}
              alt="Imagem do cartão"
              sx={{
                opacity: 0.6,
                width: '13%',
                height: 'auto',
                marginTop: "2em",
                display: { xs: 'none', sm: 'block' }
              }}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                gap: 2,
              }}
            >
              <FormControl sx={{ flexGrow: 1 }} >
                <FormLabel sx={{ color: 'black' }} htmlFor="card-number">
                  Número do cartão
                </FormLabel>
                <div id="form-checkout__cardNumber" className={styles.container}></div>
              </FormControl>
              <FormControl sx={{ maxWidth: "20%" }} >
                <FormLabel sx={{ color: 'black' }} htmlFor="cvv">
                  CVV
                </FormLabel>
                <div id="form-checkout__securityCode" className={styles.container}></div>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flexGrow: 1 }} >
                <FormLabel sx={{ color: 'black' }} htmlFor="card-name">
                  Nome
                </FormLabel>
                <input type="text" id="form-checkout__cardholderName" className={styles.inputName} required />
              </FormControl>
              <FormControl sx={{ maxWidth: "30%" }} >
                <FormLabel sx={{ color: 'black' }} htmlFor="expiration-date">
                  Validade
                </FormLabel>
                <div id="form-checkout__expirationDate" className={styles.container}></div>
              </FormControl>
            </Box>
          </Box >
        </Box >

        <select id="form-checkout__issuer" className={styles.select}></select>
        <select id="form-checkout__installments" className={styles.select} ></select>
        <select id="form-checkout__identificationType" className={styles.select} ></select>
        <input type="text" id="form-checkout__identificationNumber" className={styles.input} required />
        <input type="email" id="form-checkout__cardholderEmail" className={styles.input} required />

        <button type="submit" id="form-checkout__submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Processando..." : "Pagar"}
        </button>
        {/* <progress value="0" className="progress-bar" style={{ width: "100%" }}>Carregando...</progress> */}
        <Box 
          sx={{ 
            width: '100%',
            display: isSubmitting ? 'block' : 'none',
            mt: 2,
            mb: 1
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center', 
              mb: 1, 
              color: 'var(--cor-marca)',
              fontWeight: 600 
            }}
          >
            Processando pagamento...
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: 8,
              backgroundColor: '#f0f0f0',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--cor-marca) 0%, #ff9a6b 100%)',
                borderRadius: 4,
                position: 'relative',
                animation: 'progress-animation 2s ease-in-out infinite',
                '@keyframes progress-animation': {
                  '0%': { width: '0%' },
                  '50%': { width: '70%' },
                  '100%': { width: '0%' }
                }
              }}
            />
          </Box>
        </Box>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PagamentoCartao;
