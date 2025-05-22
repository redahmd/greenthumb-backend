// models/ExpertQuestion.js
const mongoose = require('mongoose');

// Définir le schéma ExpertQuestion
const expertQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'La question est requise'],
    trim: true,
    maxlength: [1000, 'La question ne doit pas dépasser 1000 caractères'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'La description ne doit pas dépasser 2000 caractères'],
  },
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est requis'],
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'closed'],
    default: 'pending',
  },
  answer: {
    type: String,
    trim: true,
    maxlength: [2000, 'La réponse ne doit pas dépasser 2000 caractères'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  answeredAt: {
    type: Date,
  },
});

module.exports = mongoose.model('ExpertQuestion', expertQuestionSchema);
