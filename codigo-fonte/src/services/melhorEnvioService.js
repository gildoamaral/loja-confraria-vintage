// services/melhorEnvioService.js
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TENTATIVAS_MAXIMAS = 3;
const DELAY_ENTRE_TENTATIVAS_MS = 5000;

async function gerarEtiquetaComRetentativas(pedidoId) {
  for (let tentativa = 1; tentativa <= TENTATIVAS_MAXIMAS; tentativa++) {
    try {
      console.log(`[Etiqueta] Tentativa ${tentativa} para o pedido ${pedidoId}`);

      const pedido = await prisma.pedidos.findUnique({
        where: { id: pedidoId },
        include: { usuario: true, itens: { include: { produto: true } } },
      });

      const bodyMelhorEnvio = {
        service: 2, // ATENÇÃO: O ID do serviço precisa ser dinâmico ou definido
        from: {
          // Dados do seu e-commerce (remetente) - idealmente viriam de uma config
          name: "Confraria Vintage",
          phone: "73981071533",
          email: "contato@confrariavintage.com",
          document: "12345678000123",
          address: "Endereço da Sua Loja",
          number: "100",
          district: "Bairro",
          city: "São Paulo",
          state_abbr: "SP",
          postal_code: "01000000",
        },
        to: {
          // Dados do cliente (destinatário)
          name: `${pedido.usuario.nome} ${pedido.usuario.sobrenome}`,
          phone: pedido.usuario.telefone, // Supondo que você tenha esse campo
          email: pedido.usuario.email,
          document: pedido.usuario.cpf, // Supondo que você tenha esse campo
          address: pedido.usuario.rua,
          complement: pedido.usuario.complemento || 'S/N',
          number: pedido.usuario.numero || 'S/N',
          district: pedido.usuario.bairro,
          city: pedido.usuario.cidade,
          state_abbr: pedido.usuario.estado,
          postal_code: pedido.usuario.cep,
        },
        products: pedido.itens.map(item => ({
          name: item.produto.nome,
          quantity: item.quantidade,
          unitary_value: Number((item.produto.precoPromocional ?? item.produto.preco).toFixed(2)),
        })),
        volumes: [
          // ATENÇÃO: Lógica para calcular dimensões e peso do pacote total
          {
            height: 20,
            width: 20,
            length: 20,
            weight: 1, // Em kg
          }
        ],
        options: {
          insurance_value: pedido.itens.reduce((total, item) => total + (item.produto.precoPromocional ?? item.produto.preco) * item.quantidade, 0),
          receipt: false,
          own_hand: false,
          reverse: false,
          non_commercial: false, // Se for e-commerce, geralmente é false
          invoice: { key: "SUA_CHAVE_NF" } // Se tiver nota fiscal
        }
      };

      const response = await axios.post(
        'https://sandbox.melhorenvio.com.br/api/v2/me/cart',
        bodyMelhorEnvio,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer SEU_TOKEN_MELHOR_ENVIO`,
            'User-Agent': 'Nome do Seu App (seu@email.com)'
          }
        }
      );

      // SUCESSO!
      const etiquetaId = response.data.id;
      await prisma.pedidos.update({
        where: { id: pedidoId },
        data: {
          melhorEnvioId: etiquetaId,
          statusEtiqueta: 'AGUARDANDO_PAGAMENTO' // ou o status que preferir
        },
      });

      console.log(`✅ [Etiqueta] Sucesso na tentativa ${tentativa} para o pedido ${pedidoId}. ID da Etiqueta: ${etiquetaId}`);
      return; // Sai da função com sucesso

    } catch (error) {
      console.error(`🚨 [Etiqueta] Falha na tentativa ${tentativa} para o pedido ${pedidoId}:`, error.message);

      if (tentativa === TENTATIVAS_MAXIMAS) {
        // Se esta foi a última tentativa, executa o Plano B
        console.error(`🚨 [Etiqueta] Todas as ${TENTATIVAS_MAXIMAS} tentativas falharam para o pedido ${pedidoId}. Acionando Plano B.`);

        // PLANO B: Marcar o pedido no banco de dados
        await prisma.pedidos.update({
          where: { id: pedidoId },
          data: {
            statusEtiqueta: 'FALHA_NA_GERACAO' // Novo status para seu controle
          },
        });

        // Opcional: Enviar um e-mail para o administrador
        // await enviarEmailAdmin(`Falha ao gerar etiqueta para o pedido ${pedidoId}`);

        throw new Error('Falha final ao gerar etiqueta no Melhor Envio.');
      }

      // Espera um pouco antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, DELAY_ENTRE_TENTATIVAS_MS));
    }
  }
}

module.exports = { gerarEtiquetaComRetentativas };