// routes/users.js
import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js'; // Utilise "auth" comme middleware
import Message from '../models/Message.js'; // requis pour delete message
import io from '../socket.js'; // si tu as un fichier d'initialisation de socket.io

const router = express.Router();

// GET /api/users/me — Obtenir son propre profil (auth requis)
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id — Obtenir un utilisateur spécifique
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id — Mettre à jour un utilisateur (auth requis)
router.put('/:id', auth, async (req, res, next) => {
  try {
    const updates = req.body;

    if ('password' in updates) {
      return res.status(400).json({ message: 'Utilisez l\'endpoint dédié pour modifier le mot de passe.' });
    }

    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/messages/:id — Supprimer un message (auth requis)
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Autoriser uniquement l’auteur à supprimer
    if (message.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    await Message.findByIdAndDelete(req.params.id);
    io.emit("delete_message", req.params.id); // broadcast suppression
    res.status(200).json({ message: 'Message supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
