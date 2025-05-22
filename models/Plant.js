// models/Plant.js
const mongoose = require('mongoose');

// Définir le schéma Plante
const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la plante est requis'],
    trim: true,
    maxlength: [100, 'Le nom de la plante ne doit pas dépasser 100 caractères'],
  },
  species: {
    type: String,
    trim: true,
    maxlength: [100, 'Le nom de l\'espèce ne doit pas dépasser 100 caractères'],
  },
  wateringFrequency: {
    type: Number, // en jours
    required: [true, 'La fréquence d\'arrosage est requise'],
    min: [1, 'La fréquence d\'arrosage doit être au moins de 1 jour'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Référence au modèle User
    required: [true, 'Le propriétaire est requis'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'La localisation ne doit pas dépasser 200 caractères'],
  },
  image: {
    type: String, // URL de l'image
    trim: true,
    maxlength: [500, 'L\'URL de l\'image ne doit pas dépasser 500 caractères'],
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/, 'L\'URL de l\'image doit être valide'],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Les notes ne doivent pas dépasser 1000 caractères'],
  },
});

module.exports = mongoose.model('Plant', plantSchema);
