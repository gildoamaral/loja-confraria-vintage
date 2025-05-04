import React, { useState } from 'react';
import api from '../../services/api';

function Pagamento() {
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState('');

  const handlePagamento = async (e) => {
    e.preventDefault();
    setStatus('Enviando...');

    const data = {
      transaction_amount: 1,
      description: "Pagamento de Teste",
      paymentMethodId: "pix",
      email: "cliente@email.com",
      identificationType: "CPF",
      number: "68689990704"
    };

    try {
      const res = await api.post("/pagamentos/criar-pix", data);
      const interaction = res.data.point_of_interaction;

      if (!interaction || !interaction.transaction_data) {
        setStatus('Erro: Dados do QR Code não vieram');
        return;
      }

      const qrBase64 = interaction.transaction_data.qr_code_base64;
      setQrCode(qrBase64);
      setStatus('Pagamento gerado com sucesso!');
      // const { point_of_interaction } = res.data;
      // const qrBase64 = point_of_interaction.transaction_data.qr_code_base64;

      // setQrCode(qrBase64);
      // setStatus('Pagamento gerado com sucesso!');
    } catch (err) {
      setStatus('Erro ao gerar pagamento.');
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Pagamento via PIX</h1>
      <form onSubmit={handlePagamento}>
        <button type="submit">Gerar QR Code PIX</button>
      </form>
      <p>{status}</p>
      {qrCode && (
        <img src={`data:image/png;base64,${qrCode}`} alt="QR Code PIX" />
      )}
    </div>
  );
}

export default Pagamento;
