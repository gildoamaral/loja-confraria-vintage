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
          address: pedido.usuario.rua,
          complement: pedido.usuario.complemento || 'S/N',
          number: pedido.usuario.numero || 'S/N',
          district: pedido.usuario.bairro,
          city: pedido.usuario.cidade,
          country_id: "BR",
          state_abbr: pedido.usuario.estado,
          postal_code: pedido.usuario.cep,
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
          invoice: { key: pedido.chaveNotaFiscal }
        }
      };

      const response = await axios.post(
        'https://sandbox.melhorenvio.com.br/api/v2/me/cart',
        bodyMelhorEnvio,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NTYiLCJqdGkiOiIxYTEzMzJiZDg4MDM5ZDMxNzM3YjQ2NWRiODVhZWE2NjQ2MzhmZThhOWM0ZjZmZjVjYWUwMzQ3YTUwNzkwNzdlMGEyZTE3OTI4NDRhMzc3NyIsImlhdCI6MTc1NTgyMTU0OC4wOTQ2NjMsIm5iZiI6MTc1NTgyMTU0OC4wOTQ2NjYsImV4cCI6MTc4NzM1NzU0OC4wODA2NjcsInN1YiI6IjlmODkxZDJiLTgyYTAtNGRjMi04YjRjLTRjYTIxMGIzNDFmNyIsInNjb3BlcyI6WyJjYXJ0LXJlYWQiLCJjYXJ0LXdyaXRlIiwiY29tcGFuaWVzLXJlYWQiLCJjb21wYW5pZXMtd3JpdGUiLCJjb3Vwb25zLXJlYWQiLCJjb3Vwb25zLXdyaXRlIiwibm90aWZpY2F0aW9ucy1yZWFkIiwib3JkZXJzLXJlYWQiLCJwcm9kdWN0cy1yZWFkIiwicHJvZHVjdHMtZGVzdHJveSIsInByb2R1Y3RzLXdyaXRlIiwicHVyY2hhc2VzLXJlYWQiLCJzaGlwcGluZy1jYWxjdWxhdGUiLCJzaGlwcGluZy1jYW5jZWwiLCJzaGlwcGluZy1jaGVja291dCIsInNoaXBwaW5nLWNvbXBhbmllcyIsInNoaXBwaW5nLWdlbmVyYXRlIiwic2hpcHBpbmctcHJldmlldyIsInNoaXBwaW5nLXByaW50Iiwic2hpcHBpbmctc2hhcmUiLCJzaGlwcGluZy10cmFja2luZyIsImVjb21tZXJjZS1zaGlwcGluZyIsInRyYW5zYWN0aW9ucy1yZWFkIiwidXNlcnMtcmVhZCIsInVzZXJzLXdyaXRlIiwid2ViaG9va3MtcmVhZCIsIndlYmhvb2tzLXdyaXRlIiwid2ViaG9va3MtZGVsZXRlIiwidGRlYWxlci13ZWJob29rIl19.dHbl3c7zYdpbgyKMAH-KXGs8T1C4LIRMMvC12sgk_pm0IBu2r02CdCpUcX-bBhmsLjw5x2UImcqzg9V04ZqZoPOXRSWy2YcgEhg68v4S5oQtk8sjyHLS4a-U-EWDrWkTilQdIGdwbib-wdfy5kR3Of8BtkaYGC-AjkU7EggHQfcLVEw8N7M51OwYRdGOG7376B42SCQfj5lB-AKXG85LpqfpGF-Y4fWm-XcMnOErlFpyF5GhM6xMmKJTeHkuuCxpr-HC-ERsqCYaD82GeOyKZXjc7jkK4HEjCLLhO9xDdi-FGoYQG3Y3DXYo4EHTwpRUPOVtvs1VZQagfIRbLGq0_arIjuJiMP4nSITGtZRGywbjy31gMqmyHxZazPywF_KZUK7apelPpxHCwjx8cFnGET2cRg9o9HTCIvo4L_FOhhv1m3xHArWLoTp-GKGtV2v8Tgn26RmrMxRhIqehkwS9TERm4Y-ziM9PwdTFNxsRucnq4YGw7BKUr6OLKmdDMnTjVzAULSbGj6EuaLDdU1Rk0NhacT8T3KdJiYoFYf_Asu_nT0V2T0e4HCKpa7mdEom1KO6iXh3NDljDKcqESrW1jucQN2gvrLZWXDPiAKM1dT7Rd2Q7ob0sMdhH9E-2jNKS7fd3h5h4_lgQ2uLTG_fIlMtqh1ILThAXD36jTAvXwFs`,
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