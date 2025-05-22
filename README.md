# GreenThumb Backend

API backend pour la gestion des plantes et de la communauté GreenThumb, avec authentification, chatbot horticole, Socket.IO, et documentation Swagger.

---

## Prérequis

- Node.js (v16 ou supérieure recommandée)  
- npm (fourni avec Node.js)  
- Accès à une base MongoDB (MongoDB Atlas recommandé)  

---

## Installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/redahmd/greenthumb-backend.git
cd greenthumb-backend

Installer les dépendances

npm install express mongoose cors dotenv express-session passport swagger-ui-express swagger-jsdoc socket.io jsonwebtoken

Créez un fichier .env à la racine du projet contenant les variables d’environnement suivantes (adaptez les valeurs si besoin) :

PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.z8za4gp.mongodb.net/greenthumb
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/social/google/callback
GOOGLE_CLIENT_ID=.
GOOGLE_CLIENT_SECRET=.
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/social/facebook/callback
FACEBOOK_CLIENT_ID=.
FACEBOOK_CLIENT_SECRET=.
SESSION_SECRET=greenthumb-secret
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=chelsey.wehner72@ethereal.email
EMAIL_PASS=XK4AUc3jD5db59gdKC
JWT_SECRET=8446bd42b5d984fa790e6993bcb94925c092bfc71d1cafa69df2dfda4b0b1c9a3dd03576b531d3bb12d0fa093d88137a0b5068f4c2c755262440503951814ba6
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:3000

Pour générer un token JWT signé avec la clé secrète définie dans .env, exécutez cette commande dans Git Bash (depuis la racine du projet) :

node -e "console.log(require('jsonwebtoken').sign({user:'test'}, '8446bd42b5d984fa790e6993bcb94925c092bfc71d1cafa69df2dfda4b0b1c9a3dd03576b531d3bb12d0fa093d88137a0b5068f4c2c755262440503951814ba6', {expiresIn:'1d'}))"

Démarrez le serveur avec la commande :
npm start


