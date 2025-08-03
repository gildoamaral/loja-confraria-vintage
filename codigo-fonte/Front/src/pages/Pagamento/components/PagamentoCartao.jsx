import React, { useEffect } from "react";
import styles from './PagamentoCartao.module.css'
import imagem from './image.png'
import { Box, Typography, FormLabel, FormControl, Snackbar, Alert } from '@mui/material'
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const mp = new window.MercadoPago(import.meta.env.VITE_MERCADO_PAGO_KEY);

const PagamentoCartao = (props) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const navigate = useNavigate();

  // Estados para controlar as mensagens
  const [snackbar, setSnackbar] = React.useState({
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

    if (mp.cardFormInstance) {
      console.warn("CardForm já instanciado. Usando a instância existente.");
      return;
    }

    const valorSeguro = Number(props.valor);
    const amount = (!isNaN(valorSeguro) && valorSeguro > 0)
      ? valorSeguro.toFixed(2)
      : "0.01";
    const amountPlusFrete = props.valorFrete ? (Number(props.valorFrete) + Number(amount)).toFixed(2) : amount;

    const cardForm = mp.cardForm({
      amount: amountPlusFrete,
      iframe: true,
      form: {
        id: "form-checkout",
        cardNumber: {
          id: "form-checkout__cardNumber",
          placeholder: "0000 0000 0000 0000",
        },
        expirationDate: {
          id: "form-checkout__expirationDate",
          placeholder: "MM/AA",
        },
        securityCode: {
          id: "form-checkout__securityCode",
          placeholder: "123",
        },
        cardholderName: {
          id: "form-checkout__cardholderName",
          placeholder: "Titular do cartão",
        },
        issuer: {
          id: "form-checkout__issuer",
          placeholder: "Banco emissor",
        },
        installments: {
          id: "form-checkout__installments",
          placeholder: "Parcelas",
        },
        identificationType: {
          id: "form-checkout__identificationType",
          placeholder: "Tipo de documento",
        },
        identificationNumber: {
          id: "form-checkout__identificationNumber",
          placeholder: "Número do documento",
        },
        cardholderEmail: {
          id: "form-checkout__cardholderEmail",
          placeholder: "E-mail",
        },
      },
      callbacks: {
        onFormMounted: error => {
          if (error) return console.warn("Form Mounted handling error: ", error);
          console.log("Form mounted");
        },
        onSubmit: event => {
          event.preventDefault();
          setIsSubmitting(true);

          const {
            paymentMethodId: payment_method_id,
            issuerId: issuer_id,
            cardholderEmail: email,
            amount,
            token,
            installments,
            identificationNumber,
            identificationType,
          } = cardForm.getCardFormData();

          console.log(cardForm.getCardFormData());

          api.post('/pagamentos/criar-cartao', {
            transaction_amount: Number(amount),
            token,
            description: "Descrição do produto",
            installments: Number(installments),
            payment_method_id,
            issuer_id,
            payer: {
              email,
              identification: {
                type: identificationType,
                number: identificationNumber,
              },
            },
            pedidoId: props.pedidoId,
            valorFrete: props.valorFrete ?? 0,
          })
            .then(async response => {
              console.log("log da response data: ", response.data)
              if (response.data.status === 'pending') {
                showMessage("Pagamento em processamento. Aguardando confirmação.", 'info');
                setTimeout(() => navigate('/conta'), 2000);
              }
              if (response.data.status === 'success') {
                console.log("response: ", response.data);
                showMessage("Pagamento realizado com sucesso!", 'success');
                setTimeout(() => navigate('/conta'), 2000);
              }
            })
            .catch(error => {
              // TESTANDO se o usuario consegue realizar o pagamento logo que dá erro
              setIsSubmitting(false);
              console.log("log do erro.data :", error.response.data);
              console.log("log do erro: ", error)
              if (error.response && error.response.status === 402) {
                showMessage("Pagamento negado pelo cartão. Tente novamente ou use outro cartão.", 'error');

              } else {
                showMessage("Erro ao processar pagamento.", 'error');
                navigate('/carrinho')
              }
            })

            .finally(() => {
              setIsSubmitting(false);

            });
        },
        onFetching: (resource) => {
          console.log("Fetching resource: ", resource);

          // Animate progress bar
          const progressBar = document.querySelector(".progress-bar");
          progressBar.removeAttribute("value");

          return () => {
            progressBar.setAttribute("value", "0");
          };
        }
      },
    })

    // Salva a instância do cardForm para evitar recriações
    mp.cardFormInstance = cardForm;

    // Limpa a instância ao desmontar o componente
    return () => {
      console.log("Desmontando o cardForm.");
      if (mp.cardFormInstance) {
        mp.cardFormInstance = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>

      <form id="form-checkout" className={styles.formCheckout}>

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
          // maxWidth='460px'
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

            <Box
              sx={{ display: 'flex', gap: 2 }}>
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

        <button
          type="submit"
          id="form-checkout__submit"
          className={styles.button}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processando..." : "Pagar"}
        </button>
        <progress value="0" className="progress-bar"
        // style={{
        //   width: '100%',
        //   height: "8px",
        //   borderRadius: "5px",
        //   backgroundColor: "#e0e0e0",
        //   overflow: "hidden"
        // }}
        >
          Carregando...
        </progress>

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
    </>
  );
};

export default PagamentoCartao;
