// models/ForumTopic.js
const mongoose = require('mongoose');

const forumTopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre du sujet est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne doit pas dépasser 200 caractères'],
  },
  content: {
    type: String,
    required: [true, 'Le contenu initial est requis'],
    trim: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le créateur est requis'],
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment', // Référence au modèle Comment
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ForumTopic', forumTopicSchema);
