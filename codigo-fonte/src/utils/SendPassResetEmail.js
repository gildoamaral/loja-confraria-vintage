const nodemailer = require('nodemailer');
require('dotenv').config();


async function sendResetEmail(to, link) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // seu Gmail
      pass: process.env.EMAIL_PASS, // senha de app do Gmail
    },
    tls: {
      rejectUnauthorized: false, // <- isso resolve o erro
    },
  });

  await transporter.sendMail({
    from: `"Confraria Vintage" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Redefinição de senha - Confraria Vintage',
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinir Senha</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #f38b66, #ff6b35); padding: 30px 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Confraria Vintage</h1>
                  <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Redefinição de Senha</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                  <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Olá!</h2>
                  
                  <p style="color: #666666; line-height: 1.6; font-size: 16px; margin: 0 0 20px 0;">
                      Você solicitou a redefinição de sua senha na <strong>Confraria Vintage</strong>.
                  </p>
                  
                  <p style="color: #666666; line-height: 1.6; font-size: 16px; margin: 0 0 30px 0;">
                      Para continuar, clique no botão abaixo e defina sua nova senha:
                  </p>
                  
                  <!-- Button -->
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${link}" 
                         style="display: inline-block; 
                                background: linear-gradient(135deg, #f38b66, #ff6b35); 
                                color: white; 
                                padding: 15px 40px; 
                                text-decoration: none; 
                                border-radius: 50px; 
                                font-size: 16px; 
                                font-weight: 600;
                                box-shadow: 0 4px 15px rgba(243, 139, 102, 0.3);
                                transition: all 0.3s ease;">
                          Redefinir Minha Senha
                      </a>
                  </div>
                  
                  <div style="background-color: #f9f9f9; border-left: 4px solid #f38b66; padding: 15px; margin: 30px 0; border-radius: 0 5px 5px 0;">
                      <p style="color: #666666; font-size: 14px; margin: 0; line-height: 1.5;">
                          <strong>⚠️ Importante:</strong><br>
                          • Este link é válido por apenas <strong>1 hora</strong><br>
                          • Se você não solicitou esta redefinição, pode ignorar este email com segurança<br>
                          • Por motivos de segurança, não compartilhe este link com ninguém
                      </p>
                  </div>
                  
                  <p style="color: #999999; font-size: 14px; line-height: 1.5; margin: 30px 0 0 0;">
                      Se o botão não funcionar, você pode copiar e colar o link abaixo no seu navegador:<br>
                      <span style="background-color: #f5f5f5; padding: 8px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 12px; color: #666666; display: inline-block; margin-top: 8px;">${link}</span>
                  </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                  <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.4;">
                      Este email foi enviado automaticamente pela <strong>Confraria Vintage</strong><br>
                      © ${new Date().getFullYear()} Confraria Vintage. Todos os direitos reservados.
                  </p>
              </div>
              
          </div>
      </body>
      </html>
    `,
  });
}

module.exports = sendResetEmail;