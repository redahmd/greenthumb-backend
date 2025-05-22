// routes/wateringTasks.js
const express = require('express');
const router = express.Router();
const WateringTask = require('../models/WateringTask');

// Middleware pour vérifier si l'utilisateur est authentifié (à implémenter ultérieurement)
// const auth = require('../middleware/auth');

// Créer une nouvelle tâche d'arrosage
router.post('/', /* auth, */ async (req, res) => {
  const { plant, wateringDate, status, quantity, notes } = req.body;

  try {
    const task = new WateringTask({
      plant,
      wateringDate,
      status,
      quantity,
      notes,
    });

    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtenir toutes les tâches d'arrosage pour une plante spécifique
router.get('/', /* auth, */ async (req, res) => {
  try {
    const tasks = await WateringTask.find({ plant: req.query.plant }).populate('plant', 'name species');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir une tâche d'arrosage par ID
router.get('/:id', /* auth, */ async (req, res) => {
  try {
    const task = await WateringTask.findById(req.params.id).populate('plant', 'name species');
    if (!task) {
      return res.status(404).json({ message: 'Tâche d\'arrosage non trouvée' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mettre à jour une tâche d'arrosage
router.put('/:id', /* auth, */ async (req, res) => {
  try {
    const task = await WateringTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche d\'arrosage non trouvée' });
    }

    // Vérifier si l'utilisateur est le propriétaire de la plante (à implémenter avec l'authentification)

    // Mettre à jour les champs
    const { wateringDate, status, quantity, notes } = req.body;
    if (wateringDate) task.wateringDate = wateringDate;
    if (status) task.status = status;
    if (quantity !== undefined) task.quantity = quantity;
    if (notes) task.notes = notes;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer une tâche d'arrosage
router.delete('/:id', /* auth, */ async (req, res) => {
  try {
    const task = await WateringTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche d\'arrosage non trouvée' });
    }

    // Vérifier si l'utilisateur est le propriétaire de la plante (à implémenter avec l'authentification)

    await task.remove();
    res.json({ message: 'Tâche d\'arrosage supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
