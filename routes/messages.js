// routes/messages.js
import express from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Helper pour valider un ObjectId MongoDB
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/messages — Récupérer les 100 derniers messages triés par date croissante
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: 1 })
      .limit(100)
      .populate('author', 'username firstName lastName');
    res.json(messages);
  } catch (error) {
    console.error('Erreur récupération messages :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/messages/:id — Récupérer un message par ID
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  try {
    const message = await Message.findById(id).populate('author', 'username firstName lastName');
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    res.json(message);
  } catch (error) {
    console.error('Erreur récupération message par ID :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/messages — Créer un nouveau message
router.post('/', auth, async (req, res) => {
  try {
    const { text, time, imageUrl } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Le texte du message est requis' });
    }

    const messageTime = time && !isNaN(new Date(time)) ? new Date(time) : new Date();

    const newMessage = new Message({
      author: req.user._id,
      text: text.trim(),
      time: messageTime,
      imageUrl: imageUrl || null,
    });

    await newMessage.save();

    const populatedMessage = await newMessage.populate('author', 'username firstName lastName');

    // Émission de l'événement socket.io
    req.app.get('io').emit('new_message', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Erreur création message :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/messages/:id — Supprimer un message si c'est le sien
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    if (message.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce message' });
    }

    await message.deleteOne();

    req.app.get('io').emit('delete_message', id);

    res.json({ message: 'Message supprimé' });
  } catch (error) {
    console.error('Erreur suppression message :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
