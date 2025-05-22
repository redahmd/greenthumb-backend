// models/Comment.js
const mongoose = require('mongoose');

// Définir le schéma Comment
const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Le contenu du commentaire est requis'],
    trim: true,
    maxlength: [1000, 'Le contenu du commentaire ne doit pas dépasser 1000 caractères'], // Ajout de la limite de longueur
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Référence au modèle User
    required: [true, 'Le créateur du commentaire est requis'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Optionnel : Référencer le ForumTopic auquel ce commentaire appartient
  forumTopic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumTopic',
    required: [true, 'Le sujet de forum associé est requis'],
  },
});

module.exports = mongoose.model('Comment', commentSchema);
