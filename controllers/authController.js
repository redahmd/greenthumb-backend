import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Inscription
 */
export const signup = async (req, res) => {
  const { firstName, lastName, username, email, password, confirmPassword } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Les mots de passe ne correspondent pas' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email ou nom d’utilisateur déjà utilisé' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({
      firstName,
      lastName,
      username,
      email,
      passwordHash,
      verificationCode,
      codeExpires,
      emailVerified: false,
      provider: 'local',
    });

    await user.save();

    // TODO: Envoyer email avec verificationCode

    const userToSend = user.toObject();
    delete userToSend.passwordHash;

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès. Vérifiez votre e-mail pour le code de vérification.',
      user: userToSend,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

/**
 * Connexion
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Email ou mot de passe invalide' });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(400).json({ success: false, message: 'Email ou mot de passe invalide' });

    if (!user.emailVerified) {
      return res.status(403).json({ success: false, message: 'Veuillez vérifier votre adresse e-mail avant de vous connecter.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error('Erreur lors du login :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

/**
 * Vérification du code
 */
export const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });

    if (user.emailVerified) return res.status(400).json({ success: false, message: 'Email déjà vérifié' });

    if (user.verificationCode !== code) return res.status(400).json({ success: false, message: 'Code invalide' });

    if (user.codeExpires < new Date()) return res.status(400).json({ success: false, message: 'Code expiré' });

    user.emailVerified = true;
    user.verificationCode = null;
    user.codeExpires = null;
    await user.save();

    res.json({ success: true, message: 'Email vérifié avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

/**
 * Renvoyer code de vérification
 */
export const resendCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });

    if (user.emailVerified) return res.status(400).json({ success: false, message: 'Email déjà vérifié' });

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newCode;
    user.codeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // TODO: Envoyer email avec newCode

    res.json({ success: true, message: 'Nouveau code de vérification envoyé' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

/**
 * Obtenir l'utilisateur courant
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -verificationCode -codeExpires');
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    res.json({ success: true, user });
  } catch (err) {
    console.error('Erreur getCurrentUser :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Mot de passe oublié / reset (non implémenté)
 */
export const forgotPassword = (req, res) => {
  res.status(501).json({ message: 'forgotPassword non implémenté' });
};

export const resetPassword = (req, res) => {
  res.status(501).json({ message: 'resetPassword non implémenté' });
};
