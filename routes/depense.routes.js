const express = require('express');
const router = express.Router();
const Depense = require('../modele/product.model').model('Depense');

// Route pour récupérer toutes les dépenses
router.get('/api/depenses', async (req, res) => {
    try {
        const depenses = await Depense.find().sort({ date: -1 });
        res.status(200).json(depenses);
    } catch (err) {
        console.error('Erreur lors de la récupération des dépenses:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la récupération des dépenses.' 
        });
    }
});

// Route pour ajouter une nouvelle dépense
router.post('/api/depenses', async (req, res) => {
    const { categorie, description, montant, date, fournisseur, modePaiement, projetAssocie } = req.body;
    console.log('Données reçues:', req.body);
    // Validation des données
    if (!categorie || !description || !montant || !date || !fournisseur || !modePaiement || !projetAssocie) {
        return res.status(400).json({
            success: false,
            message: 'Tous les champs sont requis.'
        });
    }

    try {
        // Création d'une nouvelle dépense
        const nouvelleDepense = new Depense({
            categorie,
            description,
            montant,
            date,
            fournisseur,
            modePaiement,
            projetAssocie
        });

        // Sauvegarde dans la base de données
        await nouvelleDepense.save();

        res.status(201).json({
            success: true,
            message: 'Dépense ajoutée avec succès.',
            depense: nouvelleDepense
        });
    } catch (err) {
        console.error('Erreur lors de l\'ajout de la dépense :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'ajout de la dépense.'
        });
    }
});

module.exports = router;