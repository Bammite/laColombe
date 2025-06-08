const express = require('express');
const router = express.Router();
const TachePersonnele = require('../modele/product.model').model('TachePersonnele');

// Route pour ajouter une nouvelle tâche personnelle
router.post('/api/taches', async (req, res) => {
    const { titre, description, statut, assignéA } = req.body;

    // Vérification des champs obligatoires
    if (!titre || !assignéA) {
        return res.status(400).json({
            success: false,
            message: 'Le titre et l\'assigné sont obligatoires.'
        });
    }

    // Vérification que l'utilisateur est connecté
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Utilisateur non connecté'
        });
    }
    console.log('Utilisateur connecté:', req.session.user);


    try {
        // Création de la tâche
        const nouvelleTache = new TachePersonnele({
            titre,
            description: description || 'Tâche personnelle', // Valeur par défaut
            statut: statut || 'En attente', // Valeur par défaut
            assignéA: req.session.user.id,
        });

        // Sauvegarde dans la base de données
        await nouvelleTache.save();

        res.status(201).json({
            success: true,
            message: 'Tâche ajoutée avec succès.',
            tache: nouvelleTache
        });
    } catch (err) {
        console.error('Erreur lors de l\'ajout de la tâche :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'ajout de la tâche.'
        });
    }
});

router.get('/api/taches', async (req, res) => {
    // Vérification que l'utilisateur est connecté
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Utilisateur non connecté'
        });
    }

    try {
        // Récupération des tâches assignées à l'utilisateur connecté et ayant le statut "En attente"
        const taches = await TachePersonnele.find({
            assignéA: req.session.user.id,
            statut: 'En attente' // Filtre pour récupérer uniquement les tâches en attente
        });

        res.status(200).json({
            success: true,
            taches,
            message: "Voici la liste des tâches en attente de l'utilisateur connecté."
        });
        console.log("Tâches en attente récupérées pour l'utilisateur :", req.session.user.id);
    } catch (err) {
        console.error('Erreur lors de la récupération des tâches :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des tâches.'
        });
    }
});

// Route pour mettre à jour le statut d'une tâche
router.put('/api/taches/:id', async (req, res) => {
    const { id } = req.params; // Récupère l'ID de la tâche depuis les paramètres
    const { statut } = req.body; // Récupère le nouveau statut depuis le corps de la requête

    // Vérification que l'utilisateur est connecté
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Utilisateur non connecté'
        });
    }

    try {
        // Recherche et mise à jour de la tâche
        const tache = await TachePersonnele.findOneAndUpdate(
            { _id: id, assignéA: req.session.user.id }, // Filtre : tâche par ID et assignée à l'utilisateur connecté
            { statut }, // Mise à jour du statut
            { new: true } // Retourne la tâche mise à jour
        );

        if (!tache) {
            return res.status(404).json({
                success: false,
                message: 'Tâche non trouvée ou non autorisée'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Statut de la tâche mis à jour avec succès.',
            tache
        });
    } catch (err) {
        console.error('Erreur lors de la mise à jour du statut de la tâche :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la mise à jour du statut de la tâche.'
        });
    }
});




module.exports = router;