import React, { useEffect } from "react";
import styles from './PagamentoCartao.module.css'
import imagem from './image.png'
import { Box, Typography, FormLabel, FormControl } from '@mui/material'
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const mp = new window.MercadoPago(import.meta.env.VITE_MERCADO_PAGO_KEY);

const PagamentoCartao = (props) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const navigate = useNavigate();

  useEffect(() => {

    if (mp.cardFormInstance) {
      console.warn("CardForm já instanciado. Usando a instância existente.");
      return;
    }

    const cardForm = mp.cardForm({
      amount: "1.5",
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
          })
            .then(async response => {
              console.log("Pagamento realizado com: ", response.data);

              alert("Pagamento realizado com sucesso!");
              navigate('/conta');
            })

            .catch(error => {
              console.error(error);

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
          maxWidth='460px'
        >
          <Box
            className={styles.translucentEffect}
            sx={{
              // marginBottom: 4,
              // gap: 2,
              bgcolor: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 3,
              width: '100%',
              borderRadius: "20px",
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 4,
            }}
          // maxWidth='460px'
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: 'black' }} variant="subtitle2"> Cartão de Crédito </Typography>
              <CreditCardRoundedIcon sx={{ color: 'text.secondary' }} />
            </Box>

            <img src={imagem} alt="Imagem do cartão"
              style={{
                opacity: 0.6,
                width: '13%',
                height: 'auto',
                marginTop: "2em"
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
          style={{
            width: '100%',
            height: "8px",
            borderRadius: "5px",
            backgroundColor: "#e0e0e0",
            overflow: "hidden"
          }}
        >
          Carregando...
        </progress>

      </form>
    </>
  );
};

export default PagamentoCartao;
