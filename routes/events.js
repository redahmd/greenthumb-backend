// routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate'); // Importer le middleware de validation

// Middleware pour vérifier si l'utilisateur est authentifié (à implémenter ultérieurement)
// const auth = require('../middleware/auth');

// Créer un nouvel événement avec validation
router.post(
  '/',
  [
    // Validation des champs
    body('title')
      .notEmpty()
      .withMessage('Le titre est requis')
      .isLength({ max: 100 })
      .withMessage('Le titre ne doit pas dépasser 100 caractères'),
    body('date')
      .notEmpty()
      .withMessage('La date est requise')
      .isISO8601()
      .withMessage('La date doit être au format ISO8601'),
    body('location')
      .notEmpty()
      .withMessage('Le lieu est requis')
      .isLength({ max: 200 })
      .withMessage('Le lieu ne doit pas dépasser 200 caractères'),
    body('organizer')
      .notEmpty()
      .withMessage('L\'organisateur est requis')
      .isMongoId()
      .withMessage('L\'organisateur doit être un ID Mongo valide'),
    body('participants')
      .optional()
      .isArray()
      .withMessage('Les participants doivent être un tableau d\'IDs'),
    body('participants.*')
      .optional()
      .isMongoId()
      .withMessage('Chaque participant doit être un ID Mongo valide'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Les images doivent être un tableau d\'URLs'),
    body('images.*')
      .optional()
      .isURL()
      .withMessage('Chaque image doit être une URL valide'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Les tags doivent être un tableau de chaînes de caractères'),
    body('tags.*')
      .optional()
      .isString()
      .withMessage('Chaque tag doit être une chaîne de caractères'),
  ],
  validate, // Utiliser le middleware de validation
  async (req, res) => {
    const { title, description, date, location, organizer, participants, images, tags } = req.body;

    try {
      const event = new Event({
        title,
        description,
        date,
        location,
        organizer,
        participants,
        images,
        tags,
      });

      const newEvent = await event.save();
      res.status(201).json(newEvent);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// Mettre à jour un événement avec validation
router.put(
  '/:id',
  [
    // Validation de l'ID de l'événement
    param('id')
      .isMongoId()
      .withMessage('ID d\'événement invalide'),
    // Validation des champs (optionnels)
    body('title')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Le titre ne doit pas dépasser 100 caractères'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('La date doit être au format ISO8601'),
    body('location')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Le lieu ne doit pas dépasser 200 caractères'),
    body('organizer')
      .optional()
      .isMongoId()
      .withMessage('L\'organisateur doit être un ID Mongo valide'),
    body('participants')
      .optional()
      .isArray()
      .withMessage('Les participants doivent être un tableau d\'IDs'),
    body('participants.*')
      .optional()
      .isMongoId()
      .withMessage('Chaque participant doit être un ID Mongo valide'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Les images doivent être un tableau d\'URLs'),
    body('images.*')
      .optional()
      .isURL()
      .withMessage('Chaque image doit être une URL valide'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Les tags doivent être un tableau de chaînes de caractères'),
    body('tags.*')
      .optional()
      .isString()
      .withMessage('Chaque tag doit être une chaîne de caractères'),
  ],
  validate, // Utiliser le middleware de validation
  async (req, res) => {
    const { title, description, date, location, organizer, participants, images, tags } = req.body;

    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Événement non trouvé' });
      }

      // Vérifier si l'utilisateur est l'organisateur (à implémenter avec l'authentification)

      if (title !== undefined) event.title = title;
      if (description !== undefined) event.description = description;
      if (date !== undefined) event.date = date;
      if (location !== undefined) event.location = location;
      if (organizer !== undefined) event.organizer = organizer;
      if (participants !== undefined) event.participants = participants;
      if (images !== undefined) event.images = images;
      if (tags !== undefined) event.tags = tags;

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// Supprimer un événement avec validation
router.delete(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('ID d\'événement invalide'),
  ],
  validate, // Utiliser le middleware de validation
  async (req, res) => {
    try {
      const deletedEvent = await Event.findByIdAndDelete(req.params.id);
      if (!deletedEvent) {
        return res.status(404).json({ message: 'Événement non trouvé' });
      }
      res.json({ message: 'Événement supprimé avec succès' });
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'événement:', err);
      res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'événement' });
    }
  }
);

// Obtenir tous les événements
router.get('/', /* auth, */ async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email')
      .populate('participants', 'name email');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir un événement par ID
router.get('/:id', /* auth, */ async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('participants', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route de test
router.get('/test', (req, res) => {
  res.send('Route de test pour les événements fonctionne!');
});

module.exports = router;
