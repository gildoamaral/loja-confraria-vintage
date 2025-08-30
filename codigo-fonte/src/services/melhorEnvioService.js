// services/melhorEnvioService.js
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { getValidAccessToken } = require('./melhorEnvioAuthService.js');

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
        service: pedido.empresaFreteId,
        from: {
          // Dados do seu e-commerce (remetente) - idealmente viriam de uma config
          name: "Confraria Vintage",
          phone: "73981071533",
          email: "contato@confrariavintage.com",
          document: "",
          company_document: "52464105000103",
          address: "Av Paulino Mendes Lima",
          district: "Centro",
          city: "Eunápolis",
          country_id: "BR",
          number: "214",
          postal_code: "45820440",
          state_abbr: "BA",
          state_register: "211555119"
        },
        to: {
          // Dados do cliente (destinatário)
          name: `${pedido.usuario.nome} ${pedido.usuario.sobrenome}`,
          phone: pedido.usuario.ddd && pedido.usuario.telefone ? `${pedido.usuario.ddd}${pedido.usuario.telefone}` : pedido.usuario.telefone,
          email: pedido.usuario.email,
          document: pedido.usuario.cpf,       // Supondo que você tenha esse campo
          address: pedido.rua,
          complement: pedido.complemento || 'S/N',
          number: pedido.numero || 'S/N',
          district: pedido.bairro,
          city: pedido.cidade,
          country_id: "BR",
          state_abbr: pedido.estado,
          postal_code: pedido.cep,
        },
        products: pedido.itens.map(item => ({
          name: item.produto.nome,
          quantity: item.quantidade,
          unitary_value: Number((item.produto.precoPromocional ?? item.produto.preco).toFixed(2)),
        })),
        volumes: [
          {
            height: pedido.alturaFrete,
            width: pedido.larguraFrete,
            length: pedido.comprimentoFrete,
            weight: pedido.pesoFrete,
          }
        ],
        options: {
          insurance_value: pedido.itens.reduce((total, item) => total + (item.produto.precoPromocional ?? item.produto.preco) * item.quantidade, 0),
          receipt: false,
          own_hand: false,
          reverse: false,
          non_commercial: false,
          invoice: { key: pedido.chaveNotaFiscal } || ""
        }
      };

      const accessToken = await getValidAccessToken();

      const response = await axios.post(
        `${process.env.MELHOR_ENVIO_ORIGIN}/api/v2/me/cart`,
        bodyMelhorEnvio,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': `${process.env.MELHOR_ENVIO_USER_AGENT}`
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