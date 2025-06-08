const express = require('express');
const router = express.Router();
const Personnel = require('../modele/product.model').model('Personnel');
const User = require('../modele/product.model').model('User');
const Projet = require('../modele/product.model').model('Projet');
// Route pour changer le mot de passe
router.post('/changer-mot-de-passe', async (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Non autorisé - Utilisateur non connecté'
        });
    }

    const { ancienMotDePasse, nouveauMotDePasse, confirmationMotDePasse } = req.body;

    try {
        // Validation des données
        if (!ancienMotDePasse || !nouveauMotDePasse || !confirmationMotDePasse) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis'
            });
        }

        if (nouveauMotDePasse !== confirmationMotDePasse) {
            return res.status(400).json({
                success: false,
                message: 'Les nouveaux mots de passe ne correspondent pas'
            });
        }

        // Récupérer l'utilisateur
        const utilisateur = await User.findById(req.session.user.id);
        if (!utilisateur) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Vérifier l'ancien mot de passe
        const motDePasseValide = await bcrypt.compare(ancienMotDePasse, utilisateur.password);
        if (!motDePasseValide) {
            return res.status(401).json({
                success: false,
                message: 'Ancien mot de passe incorrect'
            });
        }

        // Hacher et mettre à jour le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(nouveauMotDePasse, 10);
        utilisateur.password = hashedPassword;
        await utilisateur.save();

        res.json({
            success: true,
            message: 'Mot de passe mis à jour avec succès'
        });

    } catch (err) {
        console.error('Erreur changement mot de passe:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors du changement de mot de passe'
        });
    }
});


// Route pour récupérer les données de l'utilisateur connecté, son personnel associé et ses projets
router.get('/api/user', async (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Utilisateur non connecté'
        });
    }

    try {
        // Récupérer l'utilisateur avec le personnel associé
        const user = await User.findById(req.session.user.id)
            .populate({
                path: 'personnelAssocie',
                populate: {
                    path: 'historiqueProjets',
                    model: 'Projet'
                }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Récupérer les projets où le personnel est participant
        let projetsParticipant = [];
        if (user.personnelAssocie) {
            projetsParticipant = await Projet.find({
                idParticipantsPersonnel: user.personnelAssocie._id
            });
        }

        // Fusionner les données utilisateur, personnel et projets
        const responseData = {
            ...user.toObject(),
            ...(user.personnelAssocie ? user.personnelAssocie.toObject() : {}),
            projetsParticipant: projetsParticipant
        };

        res.status(200).json({
            success: true,
            user: responseData
        });

    } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});



// Route pour récupérer les données d'un utilisateur, son personnel associé et ses projets
router.get('/api/user/:id', async (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Utilisateur non connecté'
        });
    }

    const idPersonnel = req.params.id;

    try {
        // Récupérer l'utilisateur avec le personnel associé
        const user = await User.findOne({ personnelAssocie: idPersonnel }).populate({
            path: 'personnelAssocie',
            populate: {
                path: 'historiqueProjets',
                model: 'Projet'
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Récupérer les projets où le personnel est participant
        let projetsParticipant = [];
        if (idPersonnel) {
            projetsParticipant = await Projet.find({
                idParticipantsPersonnel: idPersonnel
            });
        }

        // Fusionner les données utilisateur, personnel et projets
        const responseData = {
            user: user.toObject(),
            personnel: user.personnelAssocie ? user.personnelAssocie.toObject() : null,
            projetsParticipant: projetsParticipant
        };

        console.log("\n------------------------ Données utilisateur Autruit ----------------------\n", responseData,"");

        res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

router.post('/api/Deconnecte', (req, res) => {
    req.session.user = null;
    res.json({ redirectUrl: '/index' });
});



// Route pour changer le mot de passe
router.post('/changer-mot-de-passe/:id', async (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Non autorisé - Utilisateur non connecté'
        });
    }

    const { ancienMotDePasse, nouveauMotDePasse, confirmationMotDePasse } = req.body;

    try {
        // Validation des données
        if (!ancienMotDePasse || !nouveauMotDePasse || !confirmationMotDePasse) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis'
            });
        }

        if (nouveauMotDePasse !== confirmationMotDePasse) {
            return res.status(400).json({
                success: false,
                message: 'Les nouveaux mots de passe ne correspondent pas'
            });
        }

        // Récupérer l'utilisateur
        const utilisateur = await User.find(req.params.id);
        if (!utilisateur) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Vérifier l'ancien mot de passe
        const motDePasseValide = await bcrypt.compare(ancienMotDePasse, utilisateur.password);
        if (!motDePasseValide) {
            return res.status(401).json({
                success: false,
                message: 'Ancien mot de passe incorrect'
            });
        }

        // Hacher et mettre à jour le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(nouveauMotDePasse, 10);
        utilisateur.password = hashedPassword;
        await utilisateur.save();

        res.json({
            success: true,
            message: 'Mot de passe mis à jour avec succès'
        });

    } catch (err) {
        console.error('Erreur changement mot de passe:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors du changement de mot de passe'
        });
    }
});



module.exports = router;