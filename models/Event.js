// models/Event.js
const mongoose = require('mongoose');

// Définir le schéma Événement
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre de l\'événement est requis'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'La date de l\'événement est requise'],
  },
  location: {
    type: String,
    trim: true,
    required: [true, 'Le lieu de l\'événement est requis'],
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Référence au modèle User
    required: [true, 'L\'organisateur est requis'],
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Référence aux utilisateurs participants
  }],
  images: [{
    type: String, // URLs des images
    trim: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Optionnel : autres champs comme les tags, etc.
  tags: [{
    type: String,
    trim: true,
  }],
});

module.exports = mongoose.model('Event', eventSchema);
