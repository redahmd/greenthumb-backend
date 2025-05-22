// models/PlantProtectionAlert.js
const mongoose = require('mongoose');

// Définir le schéma PlantProtectionAlert
const plantProtectionAlertSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: [true, 'La plante associée est requise'],
  },
  alertType: {
    type: String,
    enum: ['pest', 'disease', 'environmental'],
    required: [true, 'Le type d\'alerte est requis'],
  },
  description: {
    type: String,
    required: [true, 'La description de l\'alerte est requise'],
    trim: true,
    maxlength: [1000, 'La description ne doit pas dépasser 1000 caractères'],
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  images: [{
    type: String, // URLs des images
    trim: true,
    validate: {
      validator: function(v) {
        return /^(ftp|http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} n'est pas une URL valide!`
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est requis'],
  },
});

module.exports = mongoose.model('PlantProtectionAlert', plantProtectionAlertSchema);
