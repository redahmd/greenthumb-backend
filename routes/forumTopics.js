// routes/forumTopics.js
const express = require('express');
const router = express.Router();
const ForumTopic = require('../models/ForumTopic');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate'); // Importer le middleware de validation

// Middleware pour vérifier si l'utilisateur est authentifié (à implémenter ultérieurement)
// const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/forum-topics:
 *   post:
 *     summary: Créer un nouveau sujet de forum
 *     tags: [ForumTopics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - creator
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               creator:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Sujet de forum créé avec succès
 *       400:
 *         description: Erreur de validation
 */

// Créer un nouveau sujet de forum avec validation
router.post(
  '/',
  [
    body('title')
      .notEmpty()
      .withMessage('Le titre est requis')
      .isLength({ max: 200 })
      .withMessage('Le titre ne doit pas dépasser 200 caractères'),
    body('content')
      .notEmpty()
      .withMessage('Le contenu initial est requis'),
    body('creator')
      .notEmpty()
      .withMessage('Le créateur est requis')
      .isMongoId()
      .withMessage('Le créateur doit être un ID Mongo valide'),
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
    const { title, content, creator, tags } = req.body;

    try {
      const forumTopic = new ForumTopic({
        title,
        content,
        creator,
        tags,
      });

      const newForumTopic = await forumTopic.save();
      res.status(201).json(newForumTopic);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /api/forum-topics:
 *   get:
 *     summary: Obtenir tous les sujets de forum
 *     tags: [ForumTopics]
 *     responses:
 *       200:
 *         description: Liste des sujets de forum
 *       500:
 *         description: Erreur serveur
 */

// Obtenir tous les sujets de forum
router.get('/', async (req, res) => {
  try {
    const forumTopics = await ForumTopic.find()
      .populate('creator', 'name email');
    res.json(forumTopics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/forum-topics/{id}:
 *   get:
 *     summary: Obtenir un sujet de forum par ID
 *     tags: [ForumTopics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du sujet de forum
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du sujet de forum
 *       404:
 *         description: Sujet de forum non trouvé
 *       500:
 *         description: Erreur serveur
 */

// Obtenir un sujet de forum par ID avec validation
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('ID de sujet de forum invalide'),
  ],
  validate, // Utiliser le middleware de validation
  async (req, res) => {
    try {
      const forumTopic = await ForumTopic.findById(req.params.id)
        .populate('creator', 'name email')
        .populate('comments'); // Si tu as un modèle Comment
      if (!forumTopic) {
        return res.status(404).json({ message: 'Sujet de forum non trouvé' });
      }
      res.json(forumTopic);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /api/forum-topics/{id}:
 *   put:
 *     summary: Mettre à jour un sujet de forum
 *     tags: [ForumTopics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du sujet de forum
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               creator:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Sujet de forum mis à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Sujet de forum non trouvé
 *       500:
 *         description: Erreur serveur
 */

// Mettre à jour un sujet de forum avec validation
router.put(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('ID de sujet de forum invalide'),
    body('title')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Le titre ne doit pas dépasser 200 caractères'),
    body('content')
      .optional()
      .isString()
      .withMessage('Le contenu doit être une chaîne de caractères'),
    body('creator')
      .optional()
      .isMongoId()
      .withMessage('Le créateur doit être un ID Mongo valide'),
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
    const { title, content, creator, tags } = req.body;

    try {
      const forumTopic = await ForumTopic.findById(req.params.id);
      if (!forumTopic) {
        return res.status(404).json({ message: 'Sujet de forum non trouvé' });
      }

      // Vérifier si l'utilisateur est le créateur (à implémenter avec l'authentification)

      if (title !== undefined) forumTopic.title = title;
      if (content !== undefined) forumTopic.content = content;
      if (creator !== undefined) forumTopic.creator = creator;
      if (tags !== undefined) forumTopic.tags = tags;

      const updatedForumTopic = await forumTopic.save();
      res.json(updatedForumTopic);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /api/forum-topics/{id}:
 *   delete:
 *     summary: Supprimer un sujet de forum
 *     tags: [ForumTopics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du sujet de forum
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sujet de forum supprimé avec succès
 *       404:
 *         description: Sujet de forum non trouvé
 *       500:
 *         description: Erreur serveur
 */

// Supprimer un sujet de forum avec validation
router.delete(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('ID de sujet de forum invalide'),
  ],
  validate, // Utiliser le middleware de validation
  async (req, res) => {
    try {
      const deletedForumTopic = await ForumTopic.findByIdAndDelete(req.params.id);
      if (!deletedForumTopic) {
        return res.status(404).json({ message: 'Sujet de forum non trouvé' });
      }
      res.json({ message: 'Sujet de forum supprimé avec succès' });
    } catch (err) {
      console.error('Erreur lors de la suppression du sujet de forum:', err);
      res.status(500).json({ message: 'Erreur serveur lors de la suppression du sujet de forum' });
    }
  }
);

module.exports = router;
