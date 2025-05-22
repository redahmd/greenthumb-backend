// routes/activityHistory.js
const express = require('express');
const router = express.Router();
const ActivityHistory = require('../models/ActivityHistory');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate'); // Middleware de validation
const auth = require('../middleware/auth'); // Importer le middleware d'authentification

/**
 * @swagger
 * tags:
 *   name: ActivityHistory
 *   description: Gestion de l'historique des activités des utilisateurs
 */

/**
 * @swagger
 * /api/activity-history:
 *   post:
 *     summary: Créer une nouvelle entrée d'historique d'activité
 *     tags: [ActivityHistory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [arrosage, fertilisation, taille, rempotage, autre]
 *                 description: Type d'activité
 *               description:
 *                 type: string
 *                 description: Description détaillée de l'activité
 *               duration:
 *                 type: string
 *                 description: "Durée de l'activité (ex: \"15 minutes\")"

 *     responses:
 *       201:
 *         description: Entrée d'historique d'activité créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityHistory'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non autorisé
 */
router.post(
  '/',
  auth, // Protéger la route avec le middleware d'authentification
  [
    body('type')
      .notEmpty()
      .withMessage('Le type d\'activité est requis')
      .isIn(['arrosage', 'fertilisation', 'taille', 'rempotage', 'autre'])
      .withMessage('Type d\'activité invalide'),
    body('description')
      .notEmpty()
      .withMessage('La description de l\'activité est requise')
      .isString()
      .withMessage('La description doit être une chaîne de caractères'),
    body('duration')
      .optional()
      .isString()
      .withMessage('La durée doit être une chaîne de caractères'),
  ],
  validate, // Utiliser le middleware de validation
  async (req, res) => {
    const { type, description, duration } = req.body;

    try {
      const activity = new ActivityHistory({
        type,
        description,
        duration,
        user: req.user._id, // Associer l'activité à l'utilisateur authentifié
      });

      const newActivity = await activity.save();
      res.status(201).json(newActivity);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /api/activity-history:
 *   get:
 *     summary: Obtenir toutes les activités de l'utilisateur connecté
 *     tags: [ActivityHistory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des activités de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ActivityHistory'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', auth, async (req, res) => {
  try {
    const activities = await ActivityHistory.find({ user: req.user._id }).populate('user', 'name email');
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/activity-history/{id}:
 *   get:
 *     summary: Obtenir une activité par ID
 *     tags: [ActivityHistory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'activité
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'activité
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityHistory'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Activité non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get(
  '/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('ID d\'activité invalide'),
  ],
  validate,
  async (req, res) => {
    try {
      const activity = await ActivityHistory.findById(req.params.id).populate('user', 'name email');
      if (!activity) {
        return res.status(404).json({ message: 'Activité non trouvée' });
      }

      // Vérifier si l'utilisateur est propriétaire de l'activité ou admin
      if (activity.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      res.json(activity);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /api/activity-history/{id}:
 *   put:
 *     summary: Mettre à jour une activité
 *     tags: [ActivityHistory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'activité
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [arrosage, fertilisation, taille, rempotage, autre]
 *               description:
 *                 type: string
 *               duration:
 *                 type: string
 *     responses:
 *       200:
 *         description: Activité mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityHistory'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Activité non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put(
  '/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('ID d\'activité invalide'),
    body('type')
      .optional()
      .isIn(['arrosage', 'fertilisation', 'taille', 'rempotage', 'autre'])
      .withMessage('Type d\'activité invalide'),
    body('description')
      .optional()
      .isString()
      .withMessage('La description doit être une chaîne de caractères'),
    body('duration')
      .optional()
      .isString()
      .withMessage('La durée doit être une chaîne de caractères'),
  ],
  validate,
  async (req, res) => {
    const { type, description, duration } = req.body;

    try {
      const activity = await ActivityHistory.findById(req.params.id);
      if (!activity) {
        return res.status(404).json({ message: 'Activité non trouvée' });
      }

      // Vérifier si l'utilisateur est propriétaire de l'activité ou admin
      if (activity.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      if (type !== undefined) activity.type = type;
      if (description !== undefined) activity.description = description;
      if (duration !== undefined) activity.duration = duration;

      const updatedActivity = await activity.save();
      res.json(updatedActivity);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /api/activity-history/{id}:
 *   delete:
 *     summary: Supprimer une activité
 *     tags: [ActivityHistory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'activité
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Activité supprimée avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Activité non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete(
  '/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('ID d\'activité invalide'),
  ],
  validate,
  async (req, res) => {
    try {
      const activity = await ActivityHistory.findById(req.params.id);
      if (!activity) {
        return res.status(404).json({ message: 'Activité non trouvée' });
      }

      // Vérifier si l'utilisateur est propriétaire de l'activité ou admin
      if (activity.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      await ActivityHistory.findByIdAndDelete(req.params.id);
      res.json({ message: 'Activité supprimée avec succès' });
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'activité:', err);
      res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'activité' });
    }
  }
);

module.exports = router;
