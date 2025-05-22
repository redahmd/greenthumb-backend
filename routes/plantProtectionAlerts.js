// routes/plantProtectionAlerts.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Importer le middleware d'authentification
const PlantProtectionAlert = require('../models/PlantProtectionAlert');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate'); // Middleware de validation

// Middleware pour vérifier si l'utilisateur est authentifié (à implémenter ultérieurement)
// const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/plant-protection-alerts:
 *   post:
 *     summary: Créer une nouvelle alerte de protection des plantes
 *     tags: [PlantProtectionAlerts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plant
 *               - alertType
 *               - description
 *               - user
 *             properties:
 *               plant:
 *                 type: string
 *               alertType:
 *                 type: string
 *                 enum: [pest, disease, environmental]
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               user:
 *                 type: string
 *     responses:
 *       201:
 *         description: Alerte de protection des plantes créée avec succès
 *       400:
 *         description: Erreur de validation
 */
router.post(
  '/',
  [
    body('plant')
      .notEmpty()
      .withMessage('La plante associée est requise')
      .isMongoId()
      .withMessage('La plante doit être un ID Mongo valide'),
    body('alertType')
      .notEmpty()
      .withMessage('Le type d\'alerte est requis')
      .isIn(['pest', 'disease', 'environmental'])
      .withMessage('Le type d\'alerte doit être "pest", "disease" ou "environmental"'),
    body('description')
      .notEmpty()
      .withMessage('La description de l\'alerte est requise')
      .isLength({ max: 1000 })
      .withMessage('La description ne doit pas dépasser 1000 caractères'),
    body('severity')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('La sévérité doit être "low", "medium" ou "high"'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Les images doivent être un tableau d\'URLs'),
    body('images.*')
      .optional()
      .isURL()
      .withMessage('Chaque image doit être une URL valide'),
    body('user')
      .notEmpty()
      .withMessage('L\'utilisateur est requis')
      .isMongoId()
      .withMessage('L\'utilisateur doit être un ID Mongo valide'),
  ],
  validate, // Utiliser le middleware de validation
  async (req, res) => {
    const { plant, alertType, description, severity, images, user } = req.body;

    try {
      const alert = new PlantProtectionAlert({
        plant,
        alertType,
        description,
        severity,
        images,
        user,
      });

      const newAlert = await alert.save();
      res.status(201).json(newAlert);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /api/plant-protection-alerts:
 *   get:
 *     summary: Obtenir toutes les alertes de protection des plantes
 *     tags: [PlantProtectionAlerts]
 *     parameters:
 *       - in: query
 *         name: plant
 *         schema:
 *           type: string
 *         description: ID de la plante pour filtrer les alertes
 *     responses:
 *       200:
 *         description: Liste des alertes de protection des plantes
 *       500:
 *         description: Erreur serveur
 */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.plant) {
      filter.plant = req.query.plant;
    }

    const alerts = await PlantProtectionAlert.find(filter)
      .populate('plant', 'name species')
      .populate('user', 'name email');
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/plant-protection-alerts/{id}:
 *   get:
 *     summary: Obtenir une alerte de protection des plantes par ID
 *     tags: [PlantProtectionAlerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'alerte de protection des plantes
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'alerte de protection des plantes
 *       404:
 *         description: Alerte non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('ID d\'alerte invalide'),
  ],
  validate, // Utiliser le middleware de validation
  async (req, res) => {
    try {
      const alert = await PlantProtectionAlert.findById(req.params.id)
        .populate('plant', 'name species')
        .populate('user', 'name email');
      if (!alert) {
        return res.status(404).json({ message: 'Alerte non trouvée' });
      }
      res.json(alert);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /api/plant-protection-alerts/{id}:
 *   put:
 *     summary: Mettre à jour une alerte de protection des plantes
 *     tags: [PlantProtectionAlerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'alerte de protection des plantes
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alertType:
 *                 type: string
 *                 enum: [pest, disease, environmental]
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Alerte de protection des plantes mise à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Alerte non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('ID d\'alerte invalide'),
    body('alertType')
      .optional()
      .isIn(['pest', 'disease', 'environmental'])
      .withMessage('Le type d\'alerte doit être "pest", "disease" ou "environmental"'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('La description ne doit pas dépasser 1000 caractères'),
    body('severity')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('La sévérité doit être "low", "medium" ou "high"'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Les images doivent être un tableau d\'URLs'),
    body('images.*')
      .optional()
      .isURL()
      .withMessage('Chaque image doit être une URL valide'),
  ],
  validate, // Utiliser le middleware de validation
  async (req, res) => {
    const { alertType, description, severity, images } = req.body;

    try {
      const alert = await PlantProtectionAlert.findById(req.params.id);
      if (!alert) {
        return res.status(404).json({ message: 'Alerte non trouvée' });
      }

      // Vérifier si l'utilisateur est le créateur de l'alerte (à implémenter avec l'authentification)

      if (alertType !== undefined) alert.alertType = alertType;
      if (description !== undefined) alert.description = description;
      if (severity !== undefined) alert.severity = severity;
      if (images !== undefined) alert.images = images;

      const updatedAlert = await alert.save();
      res.json(updatedAlert);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /api/plant-protection-alerts/{id}:
 *   delete:
 *     summary: Supprimer une alerte de protection des plantes
 *     tags: [PlantProtectionAlerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'alerte de protection des plantes
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alerte de protection des plantes supprimée avec succès
 *       404:
 *         description: Alerte non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('ID d\'alerte invalide'),
  ],
  validate, // Utiliser le middleware de validation
  async (req, res) => {
    try {
      const deletedAlert = await PlantProtectionAlert.findByIdAndDelete(req.params.id);
      if (!deletedAlert) {
        return res.status(404).json({ message: 'Alerte non trouvée' });
      }
      res.json({ message: 'Alerte de protection des plantes supprimée avec succès' });
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'alerte:', err);
      res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'alerte' });
    }
  }
);

module.exports = router;
