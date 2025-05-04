import React, { useEffect } from "react";
// import api from '../../services/api';
// import { loadMercadoPago } from "@mercadopago/sdk-js";

// await loadMercadoPago();
const mp = new window.MercadoPago("TEST-f6f15bb4-f876-4445-8247-a638700a2324");


const Pagamento = () => {

  // useEffect(() => {
  //   const mp = new window.MercadoPago("TEST-f6f15bb4-f876-4445-8247-a638700a2324", {
  //     locale: "pt-BR",
  //   });

  //   const cardForm = mp.cardForm({
  //     amount: "100",
  //     autoMount: true,
  //     form: {
  //       id: "form-pagamento",
  //       cardholderName: {
  //         id: "form-cardholderName",
  //         placeholder: "Nome no cartão",
  //       },
  //       cardholderEmail: {
  //         id: "form-cardholderEmail",
  //         placeholder: "Email",
  //       },
  //       cardNumber: {
  //         id: "form-cardNumber",
  //         placeholder: "Número do cartão",
  //       },
  //       expirationDate: {
  //         id: "form-expirationDate",
  //         placeholder: "MM/AA",
  //       },
  //       securityCode: {
  //         id: "form-securityCode",
  //         placeholder: "CVV",
  //       },
  //       installments: {
  //         id: "form-installments",
  //         placeholder: "Parcelas",
  //       },
  //       identificationType: {
  //         id: "form-identificationType",
  //       },
  //       identificationNumber: {
  //         id: "form-identificationNumber",
  //         placeholder: "CPF",
  //       },
  //       issuer: {
  //         id: "form-issuer",
  //         placeholder: "Banco emissor",
  //       },
  //     },
  //     callbacks: {
  //       onFormMounted: (error) => {
  //         if (error) return console.warn("Erro ao montar formulário:", error);
  //       },
  //       onSubmit: async (event) => {
  //         event.preventDefault();

  //         const {
  //           token,
  //           paymentMethodId,
  //           issuerId,
  //           installments,
  //           email,
  //         } = cardForm.getCardFormData();

  //         const amount = 100.00;

  //         try {
  //           console.log("Dados enviados:", {
  //             token,
  //             amount,
  //             description: "Compra no meu app",
  //             installments,
  //             paymentMethodId,
  //             issuerId,
  //             email,
  //           });

  //           const response = await api.post("/pagamentos/criar-cartao", {
  //             token,
  //             transactionAmount: amount,
  //             description: "Compra no meu app",
  //             installments,
  //             paymentMethodId,
  //             issuerId,
  //             email,
  //           });

  //           console.log("Pagamento efetuado com sucesso:", response.data);
  //         } catch (error) {
  //           console.error("Erro no pagamento:", error.response?.data || error.message);
  //         }
  //       },
  //     },
  //   });
  // }, []);



  useEffect(() => {

    if (mp.cardFormInstance) {
      console.warn("CardForm já instanciado. Usando a instância existente.");
      return;
    }

    const cardForm = mp.cardForm({
      amount: "100.5",
      iframe: true,
      form: {
        id: "form-checkout",
        cardNumber: {
          id: "form-checkout__cardNumber",
          placeholder: "Número do cartão",
        },
        expirationDate: {
          id: "form-checkout__expirationDate",
          placeholder: "MM/YY",
        },
        securityCode: {
          id: "form-checkout__securityCode",
          placeholder: "Código de segurança",
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

            //           const response = await api.post("/pagamentos/criar-cartao", {
          fetch("http://localhost:3000/pagamentos/criar-cartao", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token,
              issuer_id,
              payment_method_id,
              transaction_amount: Number(amount),
              installments: Number(installments),
              description: "Descrição do produto",
              payer: {
                email,
                identification: {
                  type: identificationType,
                  number: identificationNumber,
                },
              },
            }),
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
  }, []);

  return (
    <>
      <style>
        {`
        #form-checkout {
          display: flex;
        flex-direction: column;
        max-width: 600px;
    }

        .container {
          height: 18px;
        display: inline-block;
        border: 1px solid rgb(118, 118, 118);
        border-radius: 2px;
        padding: 1px 2px;
        }
        `
        }
      </style>

      <div>
      5031 4332 1540 6351 123 11/30 12345678909 teste@teste.com
      </div>
      <form id="form-checkout">
        <div id="form-checkout__cardNumber" className="container"></div>
        <div id="form-checkout__expirationDate" className="container"></div>
        <div id="form-checkout__securityCode" className="container"></div>
        <input type="text" id="form-checkout__cardholderName" />
        <select id="form-checkout__issuer"></select>
        <select id="form-checkout__installments"></select>
        <select id="form-checkout__identificationType"></select>
        <input type="text" id="form-checkout__identificationNumber" />
        <input type="email" id="form-checkout__cardholderEmail" />

        <button type="submit" id="form-checkout__submit">Pagar</button>
        <progress value="0" className="progress-bar">Carregando...</progress>
      </form>
    </>
  );
};

export default Pagamento;
