const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuração do transportador de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Aceita certificados auto-assinados (resolve problema SSL)
  }
});

/**
 * Envia email de confirmação de pagamento aprovado
 * @param {Object} dadosEmail - Dados necessários para o email
 * @param {Object} dadosEmail.cliente - Dados do cliente
 * @param {Object} dadosEmail.pedido - Dados do pedido
 * @param {Object} dadosEmail.pagamento - Dados do pagamento
 */
const enviarEmailPagamentoAprovado = async (dadosEmail) => {
  const { cliente, pedido, pagamento } = dadosEmail;

  // Template para o CLIENTE
  const htmlCliente = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #28a745; margin: 0;">🎉 Pagamento Aprovado!</h1>
        <h2 style="color: #333; margin: 10px 0;">Confraria Vintage</h2>
      </div>
      
      <p style="font-size: 16px;">Olá <strong>${cliente.nome}</strong>,</p>
      
      <p style="font-size: 16px;">Seu pagamento foi aprovado com sucesso! Seu pedido já está sendo preparado.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
        <h3 style="color: #28a745; margin-top: 0;">📋 Detalhes do Pedido</h3>
        <p><strong>Número do Pedido:</strong> #${pedido.id}</p>
        <p><strong>Valor Total:</strong> R$ ${pagamento.valorTotal.toFixed(2)}</p>
        <p><strong>Método de Pagamento:</strong> ${pagamento.metodo}</p>
        <p><strong>Status:</strong> Em Preparação</p>
      </div>
      
      <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #0066cc;">
          <strong>📦 Próximo passo:</strong> Você receberá o código de rastreamento assim que o pedido for enviado.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; margin: 0;">
          Atenciosamente,<br>
          <strong style="color: #333;">Equipe Confraria Vintage</strong>
        </p>
      </div>
    </div>
  `;

  // Template para o ADMINISTRADOR
  const htmlAdmin = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #28a745; margin: 0;">💰 Novo Pagamento Aprovado</h1>
        <h2 style="color: #333; margin: 10px 0;">Sistema Confraria Vintage</h2>
      </div>
      
      <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
        <h3 style="color: #155724; margin-top: 0;">📋 Informações do Pedido</h3>
        <p><strong>Pedido:</strong> #${pedido.id}</p>
        <p><strong>Cliente:</strong> ${cliente.nome} ${cliente.sobrenome}</p>
        <p><strong>Email:</strong> ${cliente.email}</p>
        <p><strong>Valor:</strong> R$ ${pagamento.valorTotal.toFixed(2)}</p>
        <p><strong>Método:</strong> ${pagamento.metodo}</p>
        <p><strong>ID Gateway:</strong> ${pagamento.gatewayTransactionId}</p>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
        <p style="margin: 0; color: #856404;">
          <strong>⚡ Ação necessária:</strong> Preparar o pedido para envio.
        </p>
      </div>
    </div>
  `;

  try {
    // Envia email para o CLIENTE
    await transporter.sendMail({
      from: `"Confraria Vintage" <${process.env.EMAIL_USER}>`,
      to: cliente.email,
      subject: `✅ Pagamento Aprovado - Pedido #${pedido.id}`,
      html: htmlCliente,
    });

    // Envia email para o ADMINISTRADOR
    await transporter.sendMail({
      from: `"Sistema Confraria Vintage" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_ADMIN,
      subject: `💰 Novo Pagamento Aprovado - Pedido #${pedido.id}`,
      html: htmlAdmin,
    });

    console.log(`✅ Emails de pagamento aprovado enviados - Pedido #${pedido.id}`);
  } catch (error) {
    console.error('❌ Erro ao enviar emails de pagamento aprovado:', error);
  }
};

/**
 * Envia email de cancelamento de pagamento
 */
const enviarEmailPagamentoCancelado = async (dadosEmail) => {
  const { cliente, pedido, pagamento } = dadosEmail;

  const htmlCliente = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #dc3545; margin: 0;">❌ Pagamento Cancelado</h1>
        <h2 style="color: #333; margin: 10px 0;">Confraria Vintage</h2>
      </div>
      
      <p style="font-size: 16px;">Olá <strong>${cliente.nome}</strong>,</p>
      
      <p style="font-size: 16px;">Infelizmente seu pagamento não foi aprovado.</p>
      
      <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
        <h3 style="color: #721c24; margin-top: 0;">📋 Detalhes</h3>
        <p><strong>Número do Pedido:</strong> #${pedido.id}</p>
        <p><strong>Valor:</strong> R$ ${pagamento.valorTotal.toFixed(2)}</p>
        <p><strong>Status:</strong> Cancelado</p>
      </div>
      
      <div style="background-color: #e2e3e5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #495057;">
          <strong>🛒 Não desista!</strong> Você pode tentar realizar uma nova compra quando desejar.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; margin: 0;">
          Atenciosamente,<br>
          <strong style="color: #333;">Equipe Confraria Vintage</strong>
        </p>
      </div>
    </div>
  `;

  const htmlAdmin = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #dc3545; margin: 0;">❌ Pagamento Cancelado</h1>
        <h2 style="color: #333; margin: 10px 0;">Sistema Confraria Vintage</h2>
      </div>
      
      <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; border: 1px solid #f5c6cb;">
        <p><strong>Pedido:</strong> #${pedido.id}</p>
        <p><strong>Cliente:</strong> ${cliente.nome} ${cliente.sobrenome}</p>
        <p><strong>Email:</strong> ${cliente.email}</p>
        <p><strong>Valor:</strong> R$ ${pagamento.valorTotal.toFixed(2)}</p>
        <p><strong>Método:</strong> ${pagamento.metodo}</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Confraria Vintage" <${process.env.EMAIL_USER}>`,
      to: cliente.email,
      subject: `❌ Pagamento Cancelado - Pedido #${pedido.id}`,
      html: htmlCliente,
    });

    await transporter.sendMail({
      from: `"Sistema Confraria Vintage" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_ADMIN,
      subject: `❌ Pagamento Cancelado - Pedido #${pedido.id}`,
      html: htmlAdmin,
    });

    console.log(`✅ Emails de cancelamento enviados - Pedido #${pedido.id}`);
  } catch (error) {
    console.error('❌ Erro ao enviar emails de cancelamento:', error);
  }
};

/**
 * Envia email de reembolso
 */
const enviarEmailReembolso = async (dadosEmail) => {
  const { cliente, pedido, pagamento } = dadosEmail;

  const htmlCliente = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #17a2b8; margin: 0;">🔄 Reembolso Processado</h1>
        <h2 style="color: #333; margin: 10px 0;">Confraria Vintage</h2>
      </div>
      
      <p style="font-size: 16px;">Olá <strong>${cliente.nome}</strong>,</p>
      
      <p style="font-size: 16px;">Seu reembolso foi processado com sucesso.</p>
      
      <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
        <h3 style="color: #0c5460; margin-top: 0;">📋 Detalhes do Reembolso</h3>
        <p><strong>Número do Pedido:</strong> #${pedido.id}</p>
        <p><strong>Valor Reembolsado:</strong> R$ ${pagamento.valorTotal.toFixed(2)}</p>
        <p><strong>Método Original:</strong> ${pagamento.metodo}</p>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #856404;">
          <strong>⏰ Prazo:</strong> O valor será creditado em sua conta conforme as políticas do meio de pagamento utilizado.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; margin: 0;">
          Atenciosamente,<br>
          <strong style="color: #333;">Equipe Confraria Vintage</strong>
        </p>
      </div>
    </div>
  `;

  const htmlAdmin = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #17a2b8; margin: 0;">🔄 Reembolso Processado</h1>
        <h2 style="color: #333; margin: 10px 0;">Sistema Confraria Vintage</h2>
      </div>
      
      <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; border: 1px solid #bee5eb;">
        <p><strong>Pedido:</strong> #${pedido.id}</p>
        <p><strong>Cliente:</strong> ${cliente.nome} ${cliente.sobrenome}</p>
        <p><strong>Email:</strong> ${cliente.email}</p>
        <p><strong>Valor:</strong> R$ ${pagamento.valorTotal.toFixed(2)}</p>
        <p><strong>Método:</strong> ${pagamento.metodo}</p>
      </div>
      
      <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #155724;">
          <strong>✅ Ação automática:</strong> O estoque foi restaurado automaticamente.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Confraria Vintage" <${process.env.EMAIL_USER}>`,
      to: cliente.email,
      subject: `🔄 Reembolso Processado - Pedido #${pedido.id}`,
      html: htmlCliente,
    });

    await transporter.sendMail({
      from: `"Sistema Confraria Vintage" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_ADMIN,
      subject: `🔄 Reembolso Processado - Pedido #${pedido.id}`,
      html: htmlAdmin,
    });

    console.log(`✅ Emails de reembolso enviados - Pedido #${pedido.id}`);
  } catch (error) {
    console.error('❌ Erro ao enviar emails de reembolso:', error);
  }
};

module.exports = {
  enviarEmailPagamentoAprovado,
  enviarEmailPagamentoCancelado,
  enviarEmailReembolso,
};