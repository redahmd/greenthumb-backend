// models/StockItem.js
const mongoose = require('mongoose');

// Définir le schéma StockItem
const stockItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'article est requis'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['Plantes', 'Outils', 'Engrais', 'Autres'],
    required: [true, 'La catégorie est requise'],
  },
  quantity: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [0, 'La quantité doit être au moins de 0'],
  },
  price: {
    type: Number,
    min: [0, 'Le prix doit être au moins de 0'],
  },
  description: {
    type: String,
    trim: true,
  },
  supplier: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StockItem', stockItemSchema);
