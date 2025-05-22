// models/ActivityHistory.js
const mongoose = require('mongoose');

// Définir le schéma ActivityHistory
const activityHistorySchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Le type d\'activité est requis'],
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    required: [true, 'La description de l\'activité est requise'],
    trim: true,
  },
  duration: {
    type: String, // Par exemple, "5 minutes", "1 heure"
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Référence au modèle User
    required: [true, 'L\'utilisateur est requis'],
  },
});

module.exports = mongoose.model('ActivityHistory', activityHistorySchema);
