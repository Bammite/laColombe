const express = require('express');
const router = express.Router();
const Personnel = require('../modele/product.model').model('Personnel');
const User = require('../modele/product.model').model('User');


// Route pour ajouter un membre du personnel
router.post('/Addpersonnel', async (req, res) => {
    const personnelData = req.body;

    try {
        const nouveauPersonnel = new Personnel(personnelData);
        await nouveauPersonnel.save();

        res.status(201).json({
            success: true,
            message: 'Membre du personnel ajouté avec succès.',
            personnel: nouveauPersonnel
        });
    } catch (err) {
        console.error('Erreur lors de l\'ajout du membre du personnel :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'ajout du membre du personnel.'
        });
    }
});

// Route pour recuperer les membres du personnel
router.get('/Personnels', async (req, res) => {

    try {
        const Personnels = await Personnel.find();
        res.status(200).json({
            success: true,
            message: 'Liste des membres du personnel récupérée avec succès.',
            personnels: Personnels
        });
    } catch (err) {
        console.error('Erreur lors de la recuperation des membres du personnel :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la recuperation des membres du personnel.'
        });
    }
});

// Route pour récupérer un membre du personnel par ID
router.get('/api/personnel/:id', async (req, res) => {
    try {
        const personnel = await Personnel.findById(req.params.id);
        
        if (!personnel) {
            return res.status(404).json({
                success: false,
                message: 'Personnel non trouvé'
            });
        }
        res.status(200).json({
            success: true,
            personnel
        });
    } catch (err) {
        console.error('Erreur lors de la récupération du personnel:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});







router.put('/personnele/modifier/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Gestion spécifique de la photo
        if (updateData.photo === '') {
            const personnel = await Personnel.findById(id);
            if (personnel && personnel.photo) {
                const photoPath = path.join(__dirname, '../../', personnel.photo);
                if (fs.existsSync(photoPath)) {
                    fs.unlinkSync(photoPath);
                }
            }
            updateData.photo = undefined;
        } else if (!updateData.photo) {
            delete updateData.photo;
        }

        // Mise à jour du membre du personnel
        const updatedPersonnel = await Personnel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedPersonnel) {
            return res.status(404).json({
                success: false,
                message: 'Employé non trouvé'
            });
        }

        // Gestion de l'association utilisateur
        const authorizedGrades = ['Elementaire', 'Superieur', 'Absolut'];
        
        if (updatedPersonnel.email && authorizedGrades.includes(updatedPersonnel.grade)) {
            // Associer cet employé à un utilisateur ayant le même email
            await User.findOneAndUpdate(
                { emailUser: updatedPersonnel.email },
                { $set: { personnelAssocie: updatedPersonnel._id } },
                { new: true }
            );
        } else if (updatedPersonnel.email) {
            // Si le grade n'est plus autorisé, supprimer l'association
            await User.findOneAndUpdate(
                { emailUser: updatedPersonnel.email },
                { $unset: { personnelAssocie: "" } },
                { new: true }
            );
        }

        res.json({
            success: true,
            message: 'Employé mis à jour avec succès',
            personnel: updatedPersonnel
        });

    } catch (error) {
        console.error('Erreur modification employé:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur serveur'
        });
    }
});

module.exports = router;