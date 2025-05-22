// models/WateringTask.js
const mongoose = require('mongoose');

// Définir le schéma Tâche d'Arrosage
const wateringTaskSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant', // Référence au modèle Plant
    required: [true, 'La plante est requise'],
  },
  wateringDate: {
    type: Date,
    required: [true, 'La date d\'arrosage est requise'],
  },
  status: {
    type: String,
    enum: ['Planifié', 'À arroser', 'Arrosé', 'Complété'],
    default: 'Planifié',
  },
  quantity: {
    type: Number, // Quantité d'eau (en litres, par exemple)
    min: [0, 'La quantité d\'eau doit être positive'],
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('WateringTask', wateringTaskSchema);
