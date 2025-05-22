// routes/soilAnalysisRecords.js
const express = require('express');
const router = express.Router();
const SoilAnalysisRecord = require('../models/SoilAnalysisRecord');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

// Créer un nouvel enregistrement d'analyse de sol
router.post(
  '/',
  auth,
  [
    body('ph')
      .notEmpty()
      .withMessage('Le pH du sol est requis')
      .isFloat({ min: 0, max: 14 })
      .withMessage('Le pH doit être un nombre entre 0 et 14'),
    body('moisture')
      .notEmpty()
      .withMessage('Le niveau d\'humidité est requis')
      .isString()
      .withMessage('Le niveau d\'humidité doit être une chaîne de caractères')
      .isLength({ max: 100 })
      .withMessage('Le niveau d\'humidité ne doit pas dépasser 100 caractères'),
    body('texture')
      .notEmpty()
      .withMessage('La texture du sol est requise')
      .isString()
      .withMessage('La texture du sol doit être une chaîne de caractères')
      .isLength({ max: 100 })
      .withMessage('La texture du sol ne doit pas dépasser 100 caractères'),
    body('recommendations')
      .optional()
      .isArray()
      .withMessage('Les recommandations doivent être un tableau de chaînes de caractères'),
    body('recommendations.*')
      .optional()
      .isString()
      .withMessage('Chaque recommandation doit être une chaîne de caractères')
      .isLength({ max: 500 })
      .withMessage('Chaque recommandation ne doit pas dépasser 500 caractères'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Les images doivent être un tableau d\'URLs'),
    body('images.*')
      .optional()
      .isURL()
      .withMessage('Chaque image doit être une URL valide')
      .isLength({ max: 500 })
      .withMessage('L\'URL de l\'image ne doit pas dépasser 500 caractères'),
    body('locationGPS')
      .notEmpty()
      .withMessage('La localisation GPS est requise')
      .isObject()
      .withMessage('La localisation GPS doit être un objet'),
    body('locationGPS.type')
      .notEmpty()
      .withMessage('Le type de localisation GPS est requis')
      .isIn(['Point'])
      .withMessage('Le type de localisation GPS doit être "Point"'),
    body('locationGPS.coordinates')
      .isArray({ min: 2, max: 2 })
      .withMessage('Les coordonnées GPS doivent être un tableau de deux nombres [longitude, latitude]'),
    body('locationGPS.coordinates.*')
      .isFloat()
      .withMessage('Chaque coordonnée GPS doit être un nombre'),
  ],
  validate,
  async (req, res) => {
    const { ph, moisture, texture, recommendations, images, locationGPS } = req.body;

    try {
      const soilAnalysisRecord = new SoilAnalysisRecord({
        ph,
        moisture,
        texture,
        recommendations,
        images,
        locationGPS,
        user: req.user._id,
      });

      const newSoilAnalysisRecord = await soilAnalysisRecord.save();
      res.status(201).json(newSoilAnalysisRecord);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// Obtenir tous les enregistrements d'analyse de sol de l'utilisateur connecté
router.get('/', auth, async (req, res) => {
  try {
    const soilAnalysisRecords = await SoilAnalysisRecord.find({ user: req.user._id })
      .populate('user', 'name email');
    res.json(soilAnalysisRecords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir un enregistrement d'analyse de sol par ID
router.get(
  '/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('ID d\'enregistrement d\'analyse de sol invalide'),
  ],
  validate,
  async (req, res) => {
    try {
      const soilAnalysisRecord = await SoilAnalysisRecord.findById(req.params.id)
        .populate('user', 'name email');
      if (!soilAnalysisRecord) {
        return res.status(404).json({ message: 'Enregistrement non trouvé' });
      }

      if (soilAnalysisRecord.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      res.json(soilAnalysisRecord);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Mettre à jour un enregistrement d'analyse de sol
router.put(
  '/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('ID d\'enregistrement d\'analyse de sol invalide'),
    body('ph')
      .optional()
      .isFloat({ min: 0, max: 14 })
      .withMessage('Le pH doit être un nombre entre 0 et 14'),
    body('moisture')
      .optional()
      .isString()
      .withMessage('Le niveau d\'humidité doit être une chaîne de caractères')
      .isLength({ max: 100 })
      .withMessage('Le niveau d\'humidité ne doit pas dépasser 100 caractères'),
    body('texture')
      .optional()
      .isString()
      .withMessage('La texture du sol doit être une chaîne de caractères')
      .isLength({ max: 100 })
      .withMessage('La texture du sol ne doit pas dépasser 100 caractères'),
    body('recommendations')
      .optional()
      .isArray()
      .withMessage('Les recommandations doivent être un tableau de chaînes de caractères'),
    body('recommendations.*')
      .optional()
      .isString()
      .withMessage('Chaque recommandation doit être une chaîne de caractères')
      .isLength({ max: 500 })
      .withMessage('Chaque recommandation ne doit pas dépasser 500 caractères'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Les images doivent être un tableau d\'URLs'),
    body('images.*')
      .optional()
      .isURL()
      .withMessage('Chaque image doit être une URL valide')
      .isLength({ max: 500 })
      .withMessage('L\'URL de l\'image ne doit pas dépasser 500 caractères'),
    body('locationGPS')
      .optional()
      .isObject()
      .withMessage('La localisation GPS doit être un objet'),
    body('locationGPS.type')
      .optional()
      .isIn(['Point'])
      .withMessage('Le type de localisation GPS doit être "Point"'),
    body('locationGPS.coordinates')
      .optional()
      .isArray({ min: 2, max: 2 })
      .withMessage('Les coordonnées GPS doivent être un tableau de deux nombres [longitude, latitude]'),
    body('locationGPS.coordinates.*')
      .optional()
      .isFloat()
      .withMessage('Chaque coordonnée GPS doit être un nombre'),
    body('user')
      .optional()
      .isMongoId()
      .withMessage('L\'utilisateur doit être un ID Mongo valide'),
  ],
  validate,
  async (req, res) => {
    const { ph, moisture, texture, recommendations, images, locationGPS } = req.body;

    try {
      const soilAnalysisRecord = await SoilAnalysisRecord.findById(req.params.id);
      if (!soilAnalysisRecord) {
        return res.status(404).json({ message: 'Enregistrement non trouvé' });
      }

      if (soilAnalysisRecord.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      if (ph !== undefined) soilAnalysisRecord.ph = ph;
      if (moisture !== undefined) soilAnalysisRecord.moisture = moisture;
      if (texture !== undefined) soilAnalysisRecord.texture = texture;
      if (recommendations !== undefined) soilAnalysisRecord.recommendations = recommendations;
      if (images !== undefined) soilAnalysisRecord.images = images;
      if (locationGPS !== undefined) soilAnalysisRecord.locationGPS = locationGPS;

      const updatedSoilAnalysisRecord = await soilAnalysisRecord.save();
      res.json(updatedSoilAnalysisRecord);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// Supprimer un enregistrement d'analyse de sol
router.delete(
  '/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('ID d\'enregistrement d\'analyse de sol invalide'),
  ],
  validate,
  async (req, res) => {
    try {
      const soilAnalysisRecord = await SoilAnalysisRecord.findById(req.params.id);
      if (!soilAnalysisRecord) {
        return res.status(404).json({ message: 'Enregistrement non trouvé' });
      }

      if (soilAnalysisRecord.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      await SoilAnalysisRecord.findByIdAndDelete(req.params.id);
      res.json({ message: 'Enregistrement d\'analyse de sol supprimé avec succès' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
