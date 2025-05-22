// routes/expertQuestions.js
const express = require('express');
const router = express.Router();
const ExpertQuestion = require('../models/ExpertQuestion');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: ExpertQuestions
 *   description: Gestion des questions posées aux experts
 */

/**
 * @swagger
 * /api/expert-questions:
 *   post:
 *     summary: Poser une nouvelle question à un expert
 *     tags: [ExpertQuestions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *               description:
 *                 type: string
 *               plant:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question posée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpertQuestion'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non autorisé
 */
router.post(
  '/',
  auth,
  [
    body('question')
      .notEmpty()
      .withMessage('La question est requise')
      .isLength({ max: 1000 })
      .withMessage('La question ne doit pas dépasser 1000 caractères'),
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('La description ne doit pas dépasser 2000 caractères'),
    body('plant')
      .optional()
      .isMongoId()
      .withMessage('La plante doit être un ID Mongo valide'),
  ],
  validate,
  async (req, res) => {
    const { question, description, plant } = req.body;

    try {
      const expertQuestion = new ExpertQuestion({
        question,
        description,
        plant,
        user: req.user._id,
      });

      const newExpertQuestion = await expertQuestion.save();
      res.status(201).json(newExpertQuestion);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /api/expert-questions:
 *   get:
 *     summary: Obtenir toutes les questions posées par l'utilisateur connecté
 *     tags: [ExpertQuestions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, answered, closed]
 *         description: Filtrer les questions par statut
 *     responses:
 *       200:
 *         description: Liste des questions posées aux experts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExpertQuestion'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', auth, async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const questions = await ExpertQuestion.find(filter)
      .populate('plant', 'name species')
      .populate('user', 'name email');
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/expert-questions/{id}:
 *   get:
 *     summary: Obtenir une question à un expert par ID
 *     tags: [ExpertQuestions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la question à l'expert
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la question à l'expert
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpertQuestion'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Question non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get(
  '/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('ID de question invalide'),
  ],
  validate,
  async (req, res) => {
    try {
      const question = await ExpertQuestion.findById(req.params.id)
        .populate('plant', 'name species')
        .populate('user', 'name email');
      if (!question) {
        return res.status(404).json({ message: 'Question non trouvée' });
      }

      if (question.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      res.json(question);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /api/expert-questions/{id}:
 *   put:
 *     summary: Mettre à jour une question à un expert
 *     tags: [ExpertQuestions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la question à l'expert
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, answered, closed]
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpertQuestion'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Question non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put(
  '/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('ID de question invalide'),
    body('status')
      .optional()
      .isIn(['pending', 'answered', 'closed'])
      .withMessage('Le statut doit être "pending", "answered" ou "closed"'),
    body('answer')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('La réponse ne doit pas dépasser 2000 caractères'),
  ],
  validate,
  async (req, res) => {
    const { status, answer } = req.body;

    try {
      const question = await ExpertQuestion.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ message: 'Question non trouvée' });
      }

      if (question.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      if (status !== undefined) {
        question.status = status;
        if (status === 'answered' || status === 'closed') {
          question.answeredAt = new Date();
        }
      }
      if (answer !== undefined) {
        question.answer = answer;
      }

      const updatedQuestion = await question.save();
      res.json(updatedQuestion);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /api/expert-questions/{id}:
 *   delete:
 *     summary: Supprimer une question à un expert
 *     tags: [ExpertQuestions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la question à l'expert
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Question non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete(
  '/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('ID de question invalide'),
  ],
  validate,
  async (req, res) => {
    try {
      const question = await ExpertQuestion.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ message: 'Question non trouvée' });
      }

      if (question.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      await ExpertQuestion.findByIdAndDelete(req.params.id);
      res.json({ message: 'Question à l\'expert supprimée avec succès' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
