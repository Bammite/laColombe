const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session'); // Pour gérer les sessions
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

// Importer les routes
const actualitesRoutes = require('./routes/actualites.routes');
const authRoutes = require('./routes/auth.routes');
const articleRoutes = require('./routes/article.routes');
const depenseRoutes = require('./routes/depense.routes');
const personnelRoutes = require('./routes/personnel.routes'); // Importer la nouvelle route
const projetRoutes = require('./routes/projet.routes'); // Importer la route des projets
const tacheRoutes = require('./routes/tache.routes'); // Importer la route des tâches
const venteRoutes = require('./routes/vente.routes'); // Importer la route des ventes
const devisRoutes = require('./routes/devis.routes'); // Importer la route des devis
const apiTiereRoutes = require('./routes/apiTiere.route'); // Importer la route
const analyseBilanRoutes = require('./routes/analyse&Bilan.route'); // Importer les routes
const FicheDePaieRoutes = require('./routes/ficheDePaie.route'); // Importer les routes
const contactRoutes = require('./routes/contact.route'); // Importer la route contact
const rapport = require('./routes/rapport.routes');
const user = require('./routes/user.routes');
const Product = require('./modele/product.model');
const { 
    requireAuth, 
    requireElementaire, 
    requireSuperieur, 
    requireAbsolut 
} = require('./middleware/auth.middleware');

// Middleware pour gérer les sessions
app.use(session({
    secret: 'votre_secret_de_session',
    resave: false,
    saveUninitialized: true
}));

// Middleware pour parser les données JSON
app.use(express.json()); // Ajouter cette ligne avant les routes
app.use(bodyParser.json());
app.use(cookieParser());

// Middleware pour parser les données du formulaire
app.use(express.urlencoded({ extended: true }));

// Utiliser les routes
app.use(actualitesRoutes);
app.use(authRoutes);
app.use(articleRoutes);
app.use(depenseRoutes);
app.use(personnelRoutes); // Ajouter la route pour le personnel
app.use(projetRoutes); // Utiliser la route des projets
app.use(tacheRoutes); // Utiliser la route des tâches
app.use(venteRoutes);
app.use(devisRoutes);
app.use(apiTiereRoutes);
app.use(analyseBilanRoutes);
app.use(FicheDePaieRoutes);
app.use(user);
app.use(contactRoutes); // Utiliser la route contact
app.use(rapport); // Utiliser les route de rapport

// Servir les fichiers statiques depuis le répertoire ./Fichierpublic
app.use(express.static(path.join(__dirname, 'Fichierpublic')));
app.use('/assets', express.static(path.join(__dirname, 'Fichierpublic/assets')));
app.use('/css', express.static(path.join(__dirname, 'Fichierpublic/css')));
app.use('/js', express.static(path.join(__dirname, 'Fichierpublic/js')));

// Basic route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Route spécifique pour /tableaudeBords
app.get('/tableaudeBords', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'Fichierpublic', 'tableaudeBords.html'));
});

app.get('/newProjet', (req, res) => {
    res.sendFile(path.join(__dirname, 'Fichierpublic', 'newProjet.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Fichierpublic', 'index.html'));
});

app.get('/inscription', (req, res) => {
    res.sendFile(path.join(__dirname, 'Fichierpublic', 'inscription.html'));
});

// Route pour afficher la page de connexion
app.get('/connexion', (req, res) => {
    res.sendFile(path.join(__dirname, 'Fichierpublic', 'connexion.html'));
});

// Route pour afficher la page de connexion
app.get('/AfficherDevis', (req, res) => {
    res.sendFile(path.join(__dirname, 'Fichierpublic', 'AfficherDevis.html'));
});

// Route pour afficher la page de profile
app.get('/profile', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'Fichierpublic', 'profile.html'));
});


// Empecher l'acces direct au fichier par n'importe qui
app.use('/assets/uploads', (req, res, next) => {
    // Vérifiez ici l'authentification
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Utilisateur non connecté'
        });
    }
    next();
});

// Ajouter le middleware de gestion d'erreurs
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: err.message
    });
});

// Start the server
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.set('strictQuery', false);

// Middleware de journalisation
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Fonction de connexion avec retry
const connectDB = async (retries = 5) => {
    try {
        await mongoose.connect('mongodb+srv://princebammite:8NdzHU8xc0dzJStV@bdcolombe01.gsuewhb.mongodb.net/Node-Api-Colombe?retryWrites=true&w=majority&appName=BdColombe01', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 30000,
        });
        console.log('[MongoDB] Connexion établie');
        return true;
    } catch (err) {
        if (retries > 0) {
            console.log(`[MongoDB] Tentative de reconnexion... (${retries})`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            return connectDB(retries - 1);
        }
        console.error('[MongoDB] Erreur finale:', err);
        return false;
    }
};

// Modifiez le démarrage du serveur
const startServer = async () => {
    const connected = await connectDB();
    if (!connected) {
        console.error('Impossible de démarrer sans MongoDB');
        process.exit(1);
    }
    
    if (process.env.NODE_ENV !== 'production') {
        app.listen(PORT, () => {
            console.log(`[Server] Démarré sur le port ${PORT}`);
        });
    } else {
        // En production (Vercel), pas besoin d'écouter explicitement
        console.log('[Server] Mode production');
    }
};

startServer();

// Ajouter un gestionnaire d'erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});