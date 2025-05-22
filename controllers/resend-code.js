import User from '../models/User.js';
import sendVerificationEmail from '../utils/sendEmail.js';

export const resendCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    if (user.emailVerified) return res.status(400).json({ message: 'Adresse déjà vérifiée' });

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newCode;
    user.codeExpires = Date.now() + 10 * 60 * 1000; // Code valide 10 minutes
    await user.save();

    await sendVerificationEmail(email, newCode);
    res.json({ message: '📧 Nouveau code envoyé avec succès' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
