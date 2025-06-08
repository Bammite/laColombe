const express = require('express');
const router = express.Router();
const Vente = require('../modele/product.model').model('Vente'); // Modèle Vente
const FicheDePaie = require('../modele/product.model').model('FicheDePaie'); // Modèle FicheDePaie
const Depense = require('../modele/product.model').model('Depense'); // Modèle Depense
const Projet = require('../modele/product.model').model('Projet'); // Modèle Projet
const Personnel = require('../modele/product.model').model('Personnel'); // Modèle Personnel

// Route pour récupérer les revenus (ventes)
router.get('/api/analyse/revenue', async (req, res) => {
    try {
        const ventes = await Vente.find().populate('produitId'); // Récupère les ventes avec les détails des produits
        const revenue = ventes.map(vente => ({
            nom: vente.produitId ? vente.produitId.titre : 'Produit inconnu',
            somme: vente.produitId ? vente.produitId.prix * vente.quantité : 0,
            date: vente.date.toISOString().split('T')[0] // Format YYYY-MM-DD
        }));

        res.status(200).json({ success: true, revenue });
    } catch (err) {
        console.error('Erreur lors de la récupération des revenus :', err);
        res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération des revenus.' });
    }
});

// Route pour récupérer les dépenses
router.get('/api/analyse/depenses', async (req, res) => {
    try {
        const depenses = await Depense.find();
        const fichesDePaie = await FicheDePaie.find();

        // Organiser les dépenses
        const depensesOrganisees = depenses.map(depense => ({
            id: depense._id,
            categorie: depense.categorie,
            description: depense.description,
            montant: depense.montant,
            date: depense.date.toISOString().split('T')[0], // Format YYYY-MM-DD
            fournisseur: depense.fournisseur,
            modePaiement: depense.modePaiement,
            projetAssocie: depense.projetAssocie
        }));

        // Organiser les fiches de paie
        const fichesDePaieOrganisees = fichesDePaie.map(fiche => ({
            id: fiche._id,
            categorie: 'Fiche de paie',
            description: `Paiement pour l'employé ${fiche.Idemploye}`,
            montant: fiche.heuresTravaillees * fiche.primes - fiche.deductions, // Calcul approximatif
            date: fiche.datePaiement.toISOString().split('T')[0], // Format YYYY-MM-DD
            fournisseur: 'N/A',
            modePaiement: fiche.modePaiement,
            projetAssocie: 'N/A'
        }));

        // Fusionner les dépenses et les fiches de paie
        const toutesLesDepenses = [...depensesOrganisees, ...fichesDePaieOrganisees];

        res.status(200).json({ success: true, depenses: toutesLesDepenses });
    } catch (err) {
        console.error('Erreur lors de la récupération des dépenses :', err);
        res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération des dépenses.' });
    }
});

// Route pour obtenir les statistiques de vente par catégorie
router.get('/api/analyse/ventes-par-categorie', async (req, res) => {
    try {
        // 1. Obtenir les statistiques des ventes normales
        const statsVentes = await Vente.aggregate([
            {
                $lookup: {
                    from: 'articles',
                    localField: 'produitId',
                    foreignField: '_id',
                    as: 'produit'
                }
            },
            {
                $unwind: '$produit'
            },
            {
                $group: {
                    _id: '$categorie',
                    totalVentes: {
                        $sum: { $multiply: ['$quantité', '$produit.prix'] }
                    }
                }
            }
        ]);

        // 2. Obtenir les profits des projets terminés
        const statsProjets = await Projet.aggregate([
            {
                $match: {
                    statut: 'Terminé'
                }
            },
            {
                $group: {
                    _id: 'Projet',
                    totalVentes: {
                        $sum: '$profit'
                    }
                }
            }
        ]);

        // 3. Combiner les résultats
        const statsComplete = [...statsVentes, ...statsProjets];

        // 4. Trier par total des ventes
        const statsFinal = statsComplete.sort((a, b) => b.totalVentes - a.totalVentes);

        res.status(200).json({ success: true, stats: statsFinal });
    } catch (err) {
        console.error('Erreur lors de la récupération des statistiques :', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
});

// Route pour obtenir les statistiques du personnel
router.get('/api/analyse/personnel-stats', async (req, res) => {
    try {
        // Statistiques par rôle
        const statsRole = await Personnel.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Statistiques par type de contrat (pour les employés)
        const statsContrat = await Personnel.aggregate([
            {
                $match: { role: 'Employé' }
            },
            {
                $group: {
                    _id: '$typeContrat',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Statistiques par département (pour les employés)
        const statsDepartement = await Personnel.aggregate([
            {
                $match: { role: 'Employé' }
            },
            {
                $group: {
                    _id: '$departement',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                role: statsRole,
                contrat: statsContrat,
                departement: statsDepartement
            }
        });
    } catch (err) {
        console.error('Erreur lors de la récupération des statistiques du personnel :', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
});

module.exports = router;