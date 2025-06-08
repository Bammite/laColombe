const express = require('express');
const router = express.Router();
const Actualite = require('../modele/actualite.model');
const product = require('../modele/product.model');

// Route pour créer une actualité
router.post('/addActualites', async (req, res) => {
    console.log('Données reçues:', req.body);

    // Vérifier si l'utilisateur est connecté
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Utilisateur non connecté'
        });
    }

    const contenu = req.body.contenue;
    
    if (!contenu) {
        return res.status(400).json({
            success: false,
            message: 'Le contenu est requis'
        });
    }
    console.log('auteur:', req.session.user.nom);

    try {
        const nouvelleActualite = new Actualite({
            contenu: contenu,
            auteur: req.session.user.nom,
        });

        await nouvelleActualite.save();

        res.status(201).json({
            success: true,
            message: 'Actualité publiée avec succès',
            actualite: nouvelleActualite,
            redirectUrl: '/tableaudeBords'
        });
    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la publication'
        });
    }
});

// Route pour récupérer toutes les actualités
router.get('/actualites', async (req, res) => {
    try {
        const actualites = await Actualite.find()
            .sort({ datePublication: -1 }) // Tri par date décroissante
            .limit(10); // Limite à 10 actualités

        res.json({
            success: true,
            actualites: actualites
        });
    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des actualités'
        });
    }
});

// Route pour supprimer une actualité
router.delete('/actualites/:id', async (req, res) => {
    try {
        const actualite = await Actualite.findByIdAndDelete(req.params.id);
        console.log("Suppresion de: ", req.params.id);
        if (!actualite) {
            return res.status(404).json({
                success: false,
                message: "Actualité non trouvée"
            });
        }

        res.status(200).json({
            success: true,
            message: "Actualité supprimée avec succès"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression de l'actualité",
            error: error.message
        });
    }
});

module.exports = router;