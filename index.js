import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import session from 'express-session';
import passport from './middleware/passport.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';

import errorHandler from './middleware/errorHandler.js';

import { reponses } from './reponses.js';

import { Server as SocketIOServer } from 'socket.io';

// --- Initialise Express app
const app = express();

// --- Middlewares
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// --- Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.post('/api/chatbot', (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ reply: "❌ Question manquante." });
  }

  const lower = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const motsClefsJardin = [
    'plante', 'tomate', 'semis', 'arrosage', 'sol', 'engrais', 'compost', 'rosier', 'courgette',
    'puceron', 'basilic', 'menthe', 'lune', 'mildiou', 'carotte', 'limace', 'fleur', 'potager',
    'ombre', 'hortensia', 'paillage', 'maladie', 'fruit', 'arbre', 'jardin', 'culture'
  ];

  const contientMotJardin = motsClefsJardin.some(mot => lower.includes(mot));

  if (!contientMotJardin) {
    return res.json({
      reply: "❌ Cette question ne semble pas concerner le jardinage. Pose-moi une question sur les plantes, le compost, les maladies, etc. 🌿"
    });
  }

  let reply = "🤔 Je n'ai pas encore la réponse à cette question, mais je m'améliore chaque jour !";

  for (const r of reponses) {
    if (r.motsClefs.every(mot => lower.includes(mot))) {
      reply = r.reponse;
      break;
    }
  }

  res.json({ reply });
});

app.get('/', (req, res) => {
  res.send('✅ Backend GreenThumb avec HortiChatbot en ligne');
});

// --- Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GreenThumb API',
      version: '1.0.0',
      description: 'API pour la gestion des plantes et de la communauté GreenThumb',
    },
    servers: [{ url: 'http://localhost:5000' }],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// --- Gestion erreurs
app.use(errorHandler);

// --- Démarrage serveur avec MongoDB et Socket.IO
const startServer = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI manquant dans .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    const server = http.createServer(app);

    // Initialise Socket.IO
    const io = new SocketIOServer(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      }
    });

    io.on('connection', (socket) => {
      console.log('🟢 Nouveau client connecté via Socket.IO:', socket.id);

      socket.on('disconnect', () => {
        console.log('🔴 Client déconnecté:', socket.id);
      });
    });

    // Permet d'accéder à io dans les routes via req.app.get('io')
    app.set('io', io);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur le port ${PORT}`);
      console.log(`📘 Swagger disponible sur http://localhost:${PORT}/api-docs`);
    });

  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB :', error.message);
    process.exit(1);
  }
};

startServer();
