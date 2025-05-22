import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// 🔐 Transporteur commun
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Envoi de l'email de vérification
export async function sendVerificationEmail(to, code) {
  const info = await transporter.sendMail({
    from: `"GreenThumb 🌱" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Votre code de vérification',
    text: `Voici votre code de vérification : ${code}`,
    html: `<b>Voici votre code de vérification :</b> <h2>${code}</h2>`,
  });

  console.log('✅ Email envoyé :', info.messageId);
  console.log('🔗 Voir sur Ethereal :', nodemailer.getTestMessageUrl(info));
}

// ✅ Email de bienvenue
export async function sendWelcomeEmail(to, name) {
  const mailOptions = {
    from: `"GreenThumb" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Bienvenue !',
    text: `Bonjour ${name},\n\nVotre adresse e‑mail a bien été vérifiée. Bienvenue sur GreenThumb !`,
  };
  await transporter.sendMail(mailOptions);
}

// ✅ Email de réinitialisation de mot de passe
export async function sendPasswordResetEmail(to, resetURL) {
  const info = await transporter.sendMail({
    from: `"GreenThumb" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔑 Réinitialisation de mot de passe',
    html: `<p>Cliquez ici pour réinitialiser votre mot de passe :</p><a href="${resetURL}">${resetURL}</a>`,
  });

  console.log('✅ Email envoyé :', info.messageId);
  console.log('🔗 Voir sur Ethereal :', nodemailer.getTestMessageUrl(info));
}

// ✅ Email de confirmation après changement
export async function sendResetSuccessEmail(to) {
  const mailOptions = {
    from: `"GreenThumb" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Mot de passe modifié',
    text: 'Votre mot de passe a été modifié avec succès.',
  };
  await transporter.sendMail(mailOptions);
}
