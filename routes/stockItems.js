// routes/stockItems.js
const express = require('express');
const router = express.Router();
const StockItem = require('../models/StockItem');

// Middleware pour vérifier si l'utilisateur est authentifié (à implémenter ultérieurement)
// const auth = require('../middleware/auth');

// Créer un nouvel article de stock
router.post('/', /* auth, */ async (req, res) => {
  const { name, category, quantity, price, description, supplier } = req.body;

  try {
    const stockItem = new StockItem({
      name,
      category,
      quantity,
      price,
      description,
      supplier,
    });

    const newStockItem = await stockItem.save();
    res.status(201).json(newStockItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtenir tous les articles de stock
router.get('/', /* auth, */ async (req, res) => {
  try {
    const stockItems = await StockItem.find();
    res.json(stockItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir un article de stock par ID
router.get('/:id', /* auth, */ async (req, res) => {
  try {
    const stockItem = await StockItem.findById(req.params.id);
    if (!stockItem) {
      return res.status(404).json({ message: 'Article de stock non trouvé' });
    }
    res.json(stockItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mettre à jour un article de stock
router.put('/:id', /* auth, */ async (req, res) => {
  try {
    const stockItem = await StockItem.findById(req.params.id);
    if (!stockItem) {
      return res.status(404).json({ message: 'Article de stock non trouvé' });
    }

    const { name, category, quantity, price, description, supplier } = req.body;
    if (name) stockItem.name = name;
    if (category) stockItem.category = category;
    if (quantity !== undefined) stockItem.quantity = quantity;
    if (price !== undefined) stockItem.price = price;
    if (description) stockItem.description = description;
    if (supplier) stockItem.supplier = supplier;

    const updatedStockItem = await stockItem.save();
    res.json(updatedStockItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer un article de stock
router.delete('/:id', /* auth, */ async (req, res) => {
  try {
    const stockItem = await StockItem.findById(req.params.id);
    if (!stockItem) {
      return res.status(404).json({ message: 'Article de stock non trouvé' });
    }

    await stockItem.remove();
    res.json({ message: 'Article de stock supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
