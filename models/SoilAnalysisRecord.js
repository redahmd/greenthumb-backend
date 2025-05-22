// models/SoilAnalysisRecord.js
const mongoose = require('mongoose');

// Définir le schéma SoilAnalysisRecord
const soilAnalysisRecordSchema = new mongoose.Schema({
  ph: {
    type: Number,
    required: [true, 'Le pH du sol est requis'],
    min: [0, 'Le pH ne peut pas être inférieur à 0'],
    max: [14, 'Le pH ne peut pas être supérieur à 14'],
  },
  moisture: {
    type: String,
    required: [true, 'Le niveau d\'humidité est requis'],
    trim: true,
  },
  texture: {
    type: String,
    required: [true, 'La texture du sol est requise'],
    trim: true,
  },
  recommendations: [{
    type: String,
    trim: true,
  }],
  images: [{
    type: String, // URLs des images
    trim: true,
  }],
  locationGPS: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
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

// Index géospatial pour la localisation GPS
soilAnalysisRecordSchema.index({ locationGPS: '2dsphere' });

module.exports = mongoose.model('SoilAnalysisRecord', soilAnalysisRecordSchema);
