// routes/plants.js
const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

// Créer une nouvelle plante
router.post(
  '/',
  auth,
  [
    body('name')
      .notEmpty()
      .withMessage('Le nom de la plante est requis')
      .isString()
      .withMessage('Le nom de la plante doit être une chaîne de caractères')
      .isLength({ max: 100 })
      .withMessage('Le nom de la plante ne doit pas dépasser 100 caractères'),
    body('species')
      .optional()
      .isString()
      .withMessage('Le nom de l\'espèce doit être une chaîne de caractères')
      .isLength({ max: 100 })
      .withMessage('Le nom de l\'espèce ne doit pas dépasser 100 caractères'),
    body('wateringFrequency')
      .notEmpty()
      .withMessage('La fréquence d\'arrosage est requise')
      .isInt({ min: 1 })
      .withMessage('La fréquence d\'arrosage doit être un entier d\'au moins 1'),
    body('location')
      .optional()
      .isString()
      .withMessage('La localisation doit être une chaîne de caractères')
      .isLength({ max: 200 })
      .withMessage('La localisation ne doit pas dépasser 200 caractères'),
    body('image')
      .optional()
      .isURL()
      .withMessage('L\'URL de l\'image doit être valide')
      .isLength({ max: 500 })
      .withMessage('L\'URL de l\'image ne doit pas dépasser 500 caractères'),
    body('notes')
      .optional()
      .isString()
      .withMessage('Les notes doivent être une chaîne de caractères')
      .isLength({ max: 1000 })
      .withMessage('Les notes ne doivent pas dépasser 1000 caractères'),
  ],
  validate,
  async (req, res) => {
    const { name, species, wateringFrequency, location, image, notes } = req.body;

    try {
      const plant = new Plant({
        name,
        species,
        wateringFrequency,
        owner: req.user._id,
        location,
        image,
        notes,
      });

      const newPlant = await plant.save();
      res.status(201).json(newPlant);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// Obtenir toutes les plantes de l'utilisateur connecté
router.get('/', auth, async (req, res) => {
  try {
    const plants = await Plant.find({ owner: req.user._id }).populate('owner', 'name email');
    res.json(plants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir une plante par ID
router.get(
  '/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('ID de plante invalide'),
  ],
  validate,
  async (req, res) => {
    try {
      const plant = await Plant.findById(req.params.id).populate('owner', 'name email');
      if (!plant) {
        return res.status(404).json({ message: 'Plante non trouvée' });
      }

      if (plant.owner._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      res.json(plant);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Mettre à jour une plante
router.put(
  '/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('ID de plante invalide'),
    body('name')
      .optional()
      .isString()
      .withMessage('Le nom de la plante doit être une chaîne de caractères')
      .isLength({ max: 100 })
      .withMessage('Le nom de la plante ne doit pas dépasser 100 caractères'),
    body('species')
      .optional()
      .isString()
      .withMessage('Le nom de l\'espèce doit être une chaîne de caractères')
      .isLength({ max: 100 })
      .withMessage('Le nom de l\'espèce ne doit pas dépasser 100 caractères'),
    body('wateringFrequency')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La fréquence d\'arrosage doit être un entier d\'au moins 1'),
    body('location')
      .optional()
      .isString()
      .withMessage('La localisation doit être une chaîne de caractères')
      .isLength({ max: 200 })
      .withMessage('La localisation ne doit pas dépasser 200 caractères'),
    body('image')
      .optional()
      .isURL()
      .withMessage('L\'URL de l\'image doit être valide')
      .isLength({ max: 500 })
      .withMessage('L\'URL de l\'image ne doit pas dépasser 500 caractères'),
    body('notes')
      .optional()
      .isString()
      .withMessage('Les notes doivent être une chaîne de caractères')
      .isLength({ max: 1000 })
      .withMessage('Les notes ne doivent pas dépasser 1000 caractères'),
  ],
  validate,
  async (req, res) => {
    try {
      const plant = await Plant.findById(req.params.id);
      if (!plant) {
        return res.status(404).json({ message: 'Plante non trouvée' });
      }

      if (plant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const { name, species, wateringFrequency, location, image, notes } = req.body;
      if (name) plant.name = name;
      if (species) plant.species = species;
      if (wateringFrequency) plant.wateringFrequency = wateringFrequency;
      if (location) plant.location = location;
      if (image) plant.image = image;
      if (notes) plant.notes = notes;

      const updatedPlant = await plant.save();
      res.json(updatedPlant);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// Supprimer une plante
router.delete(
  '/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('ID de plante invalide'),
  ],
  validate,
  async (req, res) => {
    try {
      const plant = await Plant.findById(req.params.id);
      if (!plant) {
        return res.status(404).json({ message: 'Plante non trouvée' });
      }

      if (plant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      await Plant.findByIdAndDelete(req.params.id);
      res.json({ message: 'Plante supprimée avec succès' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
