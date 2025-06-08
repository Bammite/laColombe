const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Projet = require('../modele/product.model').model('Projet');
const TachePersonnele = require('../modele/product.model').model('TachePersonnele'); 
const Depense = require('../modele/product.model').model('Depense');
const Personnel = require('../modele/product.model').model('Personnel');

// Configuration de multer pour l'upload des images
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join(__dirname, '../asset/upload/');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seules les images sont autorisées.'));
        }
    }
});


////////////////////////////////POST

// Route pour ajouter une tâche à un projet
router.post('/api/projets/:id/taches', async (req, res) => {
    const { id } = req.params; // ID du projet
    const { titre, description, statut, assignéA,dateEcheance } = req.body; // Données de la tâche

    try {
        // Vérification des champs obligatoires
        if (!titre || !assignéA) {
            return res.status(400).json({
                success: false,
                message: 'Les champs titre, description et assignéA sont obligatoires.'
            });
        }

        // Création de la tâche dans la collection TachePersonnele
        const nouvelleTache = new TachePersonnele({
            titre,
            description,
            statut: statut || 'En attente',
            assignéA,
            dateEcheance,

        });
        await nouvelleTache.save();

        // Ajout de l'ID de la tâche au projet
        const projet = await Projet.findByIdAndUpdate(
            id,
            { $push: { Taches: nouvelleTache._id } },
            { new: true }
        );

        if (!projet) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé.'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Tâche ajoutée avec succès.',
            tache: nouvelleTache,
            projet
        });
    } catch (err) {
        console.error('Erreur lors de l\'ajout de la tâche :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'ajout de la tâche.'
        });
    }
});

// Route pour ajouter une dépense à un projet
router.post('/api/projets/:id/depenses', async (req, res) => {
    const { id } = req.params; // ID du projet
    const { categorie, description, montant, date, fournisseur, modePaiement } = req.body; // Données de la dépense

    try {
        // Vérification des champs obligatoires
        if (!categorie || !description || !montant || !date) {
            return res.status(400).json({
                success: false,
                message: 'Les champs catégorie, description, montant et date sont obligatoires.'
            });
        }

        // Création de la dépense dans la collection Depense
        const nouvelleDepense = new Depense({
            categorie,
            description,
            montant,
            date,
            fournisseur: fournisseur || 'N/A',
            modePaiement: modePaiement || 'N/A',
            projetAssocie: id
        });
        await nouvelleDepense.save();

        // Ajout de l'ID de la dépense au projet
        const projet = await Projet.findByIdAndUpdate(
            id,
            { $push: { depenses: nouvelleDepense._id } },
            { new: true }
        );

        if (!projet) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé.'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Dépense ajoutée avec succès.',
            depense: nouvelleDepense,
            projet
        });
    } catch (err) {
        console.error('Erreur lors de l\'ajout de la dépense :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'ajout de la dépense.'
        });
    }
});

// Route pour ajouter un membre à l'équipe d'un projet
router.post('/api/projets/:id/membres', async (req, res) => {
    const { id } = req.params; // ID du projet
    const { membreId } = req.body; // ID du membre à ajouter

    try {
        // Vérification des champs obligatoires
        if (!membreId) {
            return res.status(400).json({
                success: false,
                message: 'Le champ membreId est obligatoire.'
            });
        }

        // Vérification que le membre existe dans la collection Personnel
        const membre = await Personnel.findById(membreId);
        if (!membre) {
            return res.status(404).json({
                success: false,
                message: 'Membre non trouvé.'
            });
        }

        // Ajout du membre à l'équipe du projet
        const projet = await Projet.findByIdAndUpdate(
            id,
            { $addToSet: { idParticipantsPersonnel: membreId } }, // Utilisation de $addToSet pour éviter les doublons
            { new: true }
        );

        if (!projet) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé.'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Membre ajouté avec succès.',
            membre,
            projet
        });
    } catch (err) {
        console.error('Erreur lors de l\'ajout du membre :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'ajout du membre.'
        });
    }
});


// Route pour créer un nouveau projet
router.post('/api/projets', upload.single('image'), async (req, res) => {
    try {
        const {
            titre,
            description,
            type,
            budget,
            dateEcheance,
            dateSignature,
            priorite,
            responsable,
            partenaire
        } = req.body;

        // Vérification des champs obligatoires
        if (!titre || !description || !type || !budget || !dateEcheance || !dateSignature || !priorite || !responsable || !partenaire) {
            return res.status(400).json({ success: false, message: 'Tous les champs obligatoires doivent être remplis.' });
        }

        // Chemin de l'image (si elle existe)
        const imagePath = req.file ? `/asset/upload/${req.file.filename}` : './asset/image/DefautProjet.jpg';

        // Création du projet
        const nouveauProjet = new Projet({
            titre,
            partenaire,
            budget,
            Pourcentage: 0, // Initialisé à 0
            dateSignature,
            dateEcheance,
            statut: 'En cours', // Par défaut
            depenses: [], // Initialisé à une liste vide
            description,
            idParticipant: [], // Initialisé à une liste vide
            priorité: priorite,
            responsable,
            type,
            image: imagePath
        });

        // Sauvegarde dans la base de données
        await nouveauProjet.save();

        res.status(201).json({
            success: true,
            message: 'Projet créé avec succès.',
            projet: nouveauProjet
        });
    } catch (err) {
        console.error('Erreur lors de la création du projet :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création du projet.'
        });
    }
});

/////////////////////////////////// PUT

// Route pour mettre à jour un projet
router.put('/api/projets/:id', async (req, res) => {
    const { id } = req.params;
    const projetData = req.body;
    try {
        const projet = await Projet.findByIdAndUpdate(id, projetData, { new: true });
        if (!projet) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé.'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Projet mis à jour avec succès.',
            projet
        });
    } catch (err) {
        console.error('Erreur lors de la mise à jour du projet :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la mise à jour du projet.'
        });
    }
});

// Route pour mettre à jour le statut d'une tâche
router.put('/api/taches/:tacheId', async (req, res) => {
    const { tacheId } = req.params; // ID de la tâche
    const { statut } = req.body; // Nouveau statut

    console.log('Donnée reçue pour la mise à jour du statut de la tâche :', req.body);
    try {
        // Vérifier si la tâche existe
        const tache = await TachePersonnele.findById(tacheId);
        if (!tache) {
            return res.status(404).json({
                success: false,
                message: 'Tâche non trouvée.'
            });
        }

        // Mettre à jour le statut de la tâche
        tache.statut = statut;
        await tache.save();

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

///////////////////////////////////////////  GET

// Route pour calculer le pourcentage des tâches terminées d'un projet
router.get('/api/projets/:id/taches/progression', async (req, res) => {
    const { id } = req.params; // ID du projet

    try {
        // Récupérer le projet avec les tâches associées
        const projet = await Projet.findById(id).populate('Taches');

        if (!projet) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé.'
            });
        }

        const totalTaches = projet.Taches.length;

        if (totalTaches === 0) {
            return res.status(200).json({
                success: true,
                progression: 0,
                message: 'Aucune tâche associée au projet.'
            });
        }

        // Compter les tâches terminées
        const tachesTerminees = projet.Taches.filter(tache => tache.statut === 'Terminé').length;

        // Calculer le pourcentage
        const progression = Math.round((tachesTerminees / totalTaches) * 100);

        res.status(200).json({
            success: true,
            progression,
            totalTaches,
            tachesTerminees,
            message: 'Pourcentage des tâches terminées calculé avec succès.'
        });
    } catch (err) {
        console.error('Erreur lors du calcul de la progression des tâches :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors du calcul de la progression des tâches.'
        });
    }
});

// Route pour récupérer tous les projets
router.get('/api/projets', async (req, res) => {
    try {
        const projets = await Projet.find();
        console.log('\n ---------------------------------------- \n Projets récupérés :', projets);
        if (projets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucun projet trouvé.'
            });
        }
        res.status(200).json({
            success: true,
            projets
        });
    } catch (err) {
        console.error('Erreur lors de la récupération des projets :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des projets.'
        });
    }
});

// Route pour récupérer un projet par ID
router.get('/api/projets/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const projet = await Projet.findById(id).populate('idParticipantsPersonnel').populate('Taches');
        if (!projet) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé.'
            });
        }
        res.status(200).json({
            success: true,
            projet
        });
    } catch (err) {
        console.error('Erreur lors de la récupération du projet :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération du projet.'
        });
    }
});


// Route pour récupérer les informations d'un participant
router.get('/api/membres/:membreId', async (req, res) => {
    const { membreId } = req.params;

    try {
        // Récupérer les informations du membre
        const membre = await Personnel.findById(membreId);
        if (!membre) {
            return res.status(404).json({
                success: false,
                message: 'Membre non trouvé.'
            });
        }

        res.status(200).json({
            success: true,
            membre
        });
    } catch (err) {
        console.error('Erreur lors de la récupération des informations du membre :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des informations du membre.'
        });
    }
});

// Route pour récupérer les tâches réalisées par un participant
router.get('/api/membres/:membreId/taches', async (req, res) => {
    const { membreId } = req.params;

    try {
        // Récupérer les tâches assignées au membre
        const taches = await TachePersonnele.find({ assignéA: membreId, statut: 'Terminé' });

        res.status(200).json({
            success: true,
            taches
        });
    } catch (err) {
        console.error('Erreur lors de la récupération des tâches du membre :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des tâches du membre.'
        });
    }
});

//////////////////////////////////////////////  DELETE

// Route pour supprimer un projet
router.delete('/api/projets/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const projet = await Projet.findByIdAndDelete(id);
        if (!projet) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé.'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Projet supprimé avec succès.'
        });
    } catch (err) {
        console.error('Erreur lors de la suppression du projet :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la suppression du projet.'
        });
    }
});

// Route pour supprimer une tâche dans le tableau Taches d'un projet
router.delete('/api/projets/:projetId/taches/:tacheId', async (req, res) => {
    const { projetId, tacheId } = req.params;

    try {
        // Vérifier si le projet existe
        const projet = await Projet.findById(projetId);
        if (!projet) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé.'
            });
        }

        // Supprimer l'ID de la tâche du tableau Taches
        await Projet.findByIdAndUpdate(
            projetId,
            { $pull: { Taches: tacheId } }, // Supprime l'ID de la tâche
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Tâche supprimée du projet avec succès.'
        });
    } catch (err) {
        console.error('Erreur lors de la suppression de la tâche du projet :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la suppression de la tâche du projet.'
        });
    }
});


// Route pour supprimer une tâche dans le tableau Taches d'un projet
router.delete('/api/projets/:projetId/taches/:tacheId', async (req, res) => {
    const { projetId, tacheId } = req.params;

    try {
        // Vérifier si le projet existe
        const projet = await Projet.findById(projetId);
        if (!projet) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé.'
            });
        }

        // Supprimer l'ID de la tâche du tableau Taches
        await Projet.findByIdAndUpdate(
            projetId,
            { $pull: { Taches: tacheId } }, // Supprime l'ID de la tâche
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Tâche supprimée du projet avec succès.'
        });
    } catch (err) {
        console.error('Erreur lors de la suppression de la tâche du projet :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la suppression de la tâche du projet.'
        });
    }
});

// Route pour supprimer un participant d'un projet
router.delete('/api/projets/:projetId/membres/:membreId', async (req, res) => {
    const { projetId, membreId } = req.params;

    try {
        // Vérifier si le projet existe
        const projet = await Projet.findById(projetId);
        if (!projet) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé.'
            });
        }

        // Supprimer l'ID du membre du tableau idParticipantsPersonnel
        await Projet.findByIdAndUpdate(
            projetId,
            { $pull: { idParticipantsPersonnel: membreId } }, // Supprime l'ID du membre
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Membre supprimé du projet avec succès.'
        });
    } catch (err) {
        console.error('Erreur lors de la suppression du membre du projet :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la suppression du membre du projet.'
        });
    }
});

module.exports = router;


