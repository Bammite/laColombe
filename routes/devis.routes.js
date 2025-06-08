const express = require('express');
const router = express.Router();
const Devis = require('../modele/product.model').model('Devis');

// Route pour enregistrer un devis
router.post('/api/devis', async (req, res) => {
    const { titre, blocs, totalDevis } = req.body;

    // Validation des données
    if (!titre || !blocs || !totalDevis) {
        return res.status(400).json({
            success: false,
            message: 'Tous les champs obligatoires doivent être remplis.'
        });
    }

    try {
        // Création du devis
        const nouveauDevis = new Devis({
            titre,
            blocs,
            totalDevis
        });

        // Sauvegarde dans la base de données
        await nouveauDevis.save();

        res.status(201).json({
            success: true,
            message: 'Devis enregistré avec succès.',
            devis: nouveauDevis
        });
    } catch (err) {
        console.error('Erreur lors de l\'enregistrement du devis :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'enregistrement du devis.'
        });
    }
});

// Route pour récupérer un devis par ID
router.get('/api/devis/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const devis = await Devis.findById(id);
        if (!devis) {
            return res.status(404).json({ success: false, message: 'Devis non trouvé.' });
        }

        res.status(200).json({ success: true, devis });
    } catch (err) {
        console.error('Erreur lors de la récupération du devis :', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
});

// Route pour récupérer tous les devis
router.get('/api/devis', async (req, res) => {
    try {
        const devis = await Devis.find().sort({ dateCreation: -1 }); // Trier par date de création (plus récent en premier)
        res.status(200).json({ success: true, devis });
    } catch (err) {
        console.error('Erreur lors de la récupération des devis :', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
});

module.exports = router;