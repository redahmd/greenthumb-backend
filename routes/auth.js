import express from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import passport from 'passport';
import auth from '../middleware/auth.js'; // ✅ Utilisé en bas correctement
import {
  signup,
  login,
  verifyCode,
  resendCode,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} from '../controllers/authController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentification
 */

// ✅ Inscription
router.post(
  '/register',
  [
    body('firstName').notEmpty().withMessage('Prénom requis').isLength({ min: 2 }),
    body('lastName').notEmpty().withMessage('Nom requis').isLength({ min: 2 }),
    body('username').notEmpty().withMessage('Nom d’utilisateur requis'),
    body('email').notEmpty().withMessage('Email requis').isEmail(),
    body('password').notEmpty().isLength({ min: 6 }).withMessage('Mot de passe min 6 caractères'),
    body('confirmPassword')
      .notEmpty()
      .custom((val, { req }) => val === req.body.password)
      .withMessage('Les mots de passe doivent correspondre'),
  ],
  validate,
  signup
);

// ✅ Connexion
router.post(
  '/login',
  [
    body('email').notEmpty().withMessage('Email requis').isEmail(),
    body('password').notEmpty().withMessage('Mot de passe requis'),
  ],
  validate,
  login
);

// ✅ Vérification du code
router.post('/verify-code', verifyCode);

// ✅ Renvoi du code
router.post('/resend-code', resendCode);

// ✅ Mot de passe oublié / réinitialisation
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ✅ Auth Google
router.get('/social/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/social/google/callback',
  passport.authenticate('google', {
    session: false,
    successRedirect: `${process.env.CLIENT_URL}/social-login-success`, // ✅ Corrigé avec backticks
    failureRedirect: `${process.env.CLIENT_URL}/login`, // ✅ Corrigé avec backticks
  })
);

// ✅ Auth Facebook
router.get('/social/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get(
  '/social/facebook/callback',
  passport.authenticate('facebook', {
    session: false,
    successRedirect: `${process.env.CLIENT_URL}/social-login-success`, // ✅ Corrigé avec backticks
    failureRedirect: `${process.env.CLIENT_URL}/login`, // ✅ Corrigé avec backticks
  })
);

// ✅ Récupération du profil de l'utilisateur connecté
router.get('/users/me', auth, getCurrentUser); // ✅ auth utilisé correctement ici

export default router;
