const nodemailer = require("nodemailer");
require("dotenv").config();


async function sendVerificationEmail(to, link) {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // ou Mailtrap, Outlook, etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
    rejectUnauthorized: false, // <- isso resolve o erro
  },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Verifique seu e-mail",
    html: `<p>Confirme seu e-mail clicando no link:</p><a href="${link}">${link}</a>`,
  });
}

module.exports = sendVerificationEmail;
