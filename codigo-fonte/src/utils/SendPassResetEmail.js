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
    from: `"Seu App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Redefinição de senha',
    html: `<p>Clique no link para redefinir sua senha:</p><a href="${link}">${link}</a>`,
  });
}

module.exports = sendResetEmail;