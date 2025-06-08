const express = require('express');
const router = express.Router();
const Paie = require('../modele/product.model').model('FicheDePaie'); 


router.post('/api/AddPaie', async (req,res) =>{
    const {Idemploye, datePaiement, DebutPeriode, FinPeriode, typeDePaie, modePaiement }= req.body;

    if (!Idemploye || !datePaiement || !DebutPeriode || !FinPeriode || !typeDePaie) {
        return res.status(400).json({
            success: false,
            message: "Tous les champs sont requis",
        });
    }

    try {
        const fiche =new Paie({
            Idemploye,
            datePaiement,
            DebutPeriode,
            FinPeriode,
            typeDePaie,
            modePaiement
        });
        await fiche.save();
        res.status(201).json({
            success: true,
            message: "Fiche de paie ajouté avec success"
        });

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: "Erreur lors de la sauvegarde de la fiche de paie",
            error: error.message
        });
    }
});



router.get('/api/fichesDePaie', async (req, res) => {
    try {
        const fichesDePaie = await Paie.find().sort({ datePaiement: -1 });
        res.status(200).json(fichesDePaie);
    } catch (err) {
        console.error('Erreur lors de la récupération des fiches de paie:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des fiches de paie.'
        });
    }
});

module.exports = router;