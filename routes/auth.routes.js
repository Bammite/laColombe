const express = require('express');
const router = express.Router();
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../modele/product.model').model('User');
const Personnel = require('../modele/product.model').model('Personnel');
// Route pour gérer l'inscription
router.post('/inscription', async (req, res) => {
    const { nom, email, password } = req.body;
    console.log('Données reçues:', req.body); // Ajout d'un log pour déboguer
    try {
        // Vérifier si l'utilisateur existe déjà
        const utilisateurExistant = await User.findOne({ emailUser: email });
        if (utilisateurExistant) {
            return res.status(400).json({
                success: false,
                message: 'Cet email est déjà utilisé.'
            });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur
        const nouvelUtilisateur = new User({
            nomUser: nom, // Utiliser le champ `nomUser` défini dans le schéma
            emailUser: email, // Utiliser le champ `emailUser` défini dans le schéma
            password: hashedPassword
        });

        // Enregistrer l'utilisateur dans la base de données
        await nouvelUtilisateur.save();

        // Initialiser la session utilisateur
        req.session.user = { 
            nom: nouvelUtilisateur.nomUser, 
            email: nouvelUtilisateur.emailUser ,
            grade: null
        };

        // Renvoyer une réponse JSON
        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            redirectUrl: '/'
        });
    } catch (err) {
        console.error('Erreur lors de l\'inscription :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'inscription'
        });
    }
});

// Route pour gérer la connexion
router.post('/connexion', async (req, res) => {
    console.log('Données reçues:', req.body); // Ajout d'un log pour déboguer

    if (!req.body.email || !req.body.password) {
        return res.status(400).json({
            success: false,
            message: 'Email et mot de passe requis'
        });
    }

    const { email, password } = req.body;

    try {
        console.log('Tentative de connexion avec email:', email);
        
        // Vérifier si l'utilisateur existe
        const utilisateur = await User.findOne({ emailUser: email });
        console.log('Utilisateur trouvé:', utilisateur);
        if (!utilisateur) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé pour le mail ' + email
            });
        }
        

        // Vérifier le mot de passe
        const motDePasseValide = await bcrypt.compare(password, utilisateur.password);
        if (!motDePasseValide) {
            return res.status(401).json({ 
                success: false,
                message: 'Mot de passe incorrect'
            });
        }

        // Vérifier que les champs nécessaires existent
        if (!utilisateur.nomUser || !utilisateur._id) {
            console.error('Champs utilisateur manquants:', utilisateur);
            return res.status(500).json({
                success: false,
                message: 'Erreur interne : informations utilisateur manquantes'
            });
        }

        console.log('Connexion réussie pour l\'utilisateur:', utilisateur.nomUser);

        // Mettre à jour la date de dernier accès dans le personnel associé
        if (utilisateur.personnelAssocie) {
            try {
                await Personnel.findByIdAndUpdate(
                    utilisateur.personnelAssocie,
                    { $set: { dernierAcces: new Date() } },
                    { new: true }
                );
                console.log('Date de dernier accès mise à jour pour le personnel:', utilisateur.personnelAssocie);
            } catch (updateError) {
                console.error('Erreur lors de la mise à jour du dernier accès:', updateError);
                // On ne bloque pas la connexion pour cette erreur
            }
        }

        // Initialiser la session utilisateur avec nom et _id
        req.session.user = { 
            nom: utilisateur.nomUser, 
            id: utilisateur._id,
            grade: getGradeFromPersonnel(utilisateur.personnelAssocie)

        };

        // Renvoyer une réponse JSON
        res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            redirectUrl: '/'
        });
    } catch (err) {
        console.error('Erreur lors de la connexion :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la connexion'
        });
    }
});

async function getGradeFromPersonnel(personnelId) {
    if (!personnelId) return null;
    
    try {
        const personnel = await Personnel.findById(personnelId);
        return personnel?.grade || null;
    } catch (err) {
        console.error('Erreur récupération grade:', err);
        return null;
    }
}

module.exports = router;