import User from '../models/User.js';

export const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    if (user.emailVerified) return res.status(400).json({ message: 'Email déjà vérifié' });

    if (!user.verificationCode || user.verificationCode !== code) {
      return res.status(400).json({ message: 'Code invalide' });
    }

    if (user.codeExpires < Date.now()) {
      return res.status(400).json({ message: 'Code expiré' });
    }

    user.emailVerified = true;
    user.verificationCode = undefined;
    user.codeExpires = undefined;
    await user.save();

    res.json({ message: '✅ Email vérifié avec succès' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
