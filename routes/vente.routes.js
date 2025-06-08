const express = require('express');
const router = express.Router();
const Vente = require('../modele/product.model').model('Vente');
const Article = require('../modele/product.model').model('Article');

// Route pour récupérer tous les produits
router.get('/api/Vente/articles', async (req, res) => {
    try {
        const articles = await Article.find();
        res.status(200).json(articles);
    } catch (err) {
        console.error('Erreur lors de la récupération des articles :', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
});

// Route pour récupérer toutes les ventes
router.get('/api/ventes', async (req, res) => {
    try {
        const ventes = await Vente.find().populate('produitId').sort({ date: -1 });
        res.status(200).json(ventes);
    } catch (err) {
        console.error('Erreur lors de la récupération des ventes:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
});

// Route pour enregistrer une vente
router.post('/api/ventes', async (req, res) => {
    const { client, produitId, quantité, date, paiement, via, livraison } = req.body;

    // Vérification des champs obligatoires
    if (!client || !produitId || !quantité || !date || !paiement || !via || !livraison) {
        console.log('Donnees recues :', req.body);
        return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
    }

    try {
        // Vérifier si le produit existe
        const produit = await Article.findById(produitId);
        if (!produit) {
            return res.status(404).json({ success: false, message: 'Produit non trouvé.' });
        }

        // Enregistrer la vente
        const nouvelleVente = new Vente({
            client,
            produitId,
            quantité,
            paiement,
            via,
            date,
            livraison,
            categorie: produit.categorie || 'Autres' // Utiliser la catégorie du produit ou 'Autres' par défaut
        });

        await nouvelleVente.save();

        res.status(201).json({ success: true, message: 'Vente enregistrée avec succès.', vente: nouvelleVente });
    } catch (err) {
        console.error('Erreur lors de l\'enregistrement de la vente :', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
});

module.exports = router;