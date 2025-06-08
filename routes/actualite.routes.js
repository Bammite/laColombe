const express = require('express');
const router = express.Router();
const Actualite = require('../models/Actualite');

// Route pour récupérer toutes les actualités
router.get('/actualites', async (req, res) => {
    try {
        const actualites = await Actualite.find();
        res.status(200).json({
            success: true,
            data: actualites
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des actualités",
            error: error.message
        });
    }
});

// Route pour ajouter une nouvelle actualité
router.post('/actualites', async (req, res) => {
    try {
        const actualite = new Actualite(req.body);
        await actualite.save();
        res.status(201).json({
            success: true,
            data: actualite
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'ajout de l'actualité",
            error: error.message
        });
    }
});



module.exports = router;