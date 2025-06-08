const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const Article = require('../modele/product.model').model('Article');
const Commande = require('../modele/product.model').model('Commande');

// Configuration de multer pour l'upload des images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../asset/upload/article');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true }); // Crée le dossier s'il n'existe pas
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Ajoute un suffixe unique au nom du fichier
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seules les images sont autorisées.'));
        }
    }
});

// Route pour ajouter un nouvel article
router.post('/api/articles', upload.single('image'), async (req, res) => {
    const { titre, contenu, prix, stock, categorie, dateAjout, description } = req.body;

    // Validation des données 
    if (!titre || !categorie || !prix || !stock || !description) {
        return res.status(400).json({
            success: false,
            message: 'Tous les champs sont requis.'
        });
    }

    try {
        // Chemin de l'image (si elle existe)
        const imagePath = req.file ? `/asset/upload/article/${req.file.filename}` : null;

        // Création d'un nouvel article
        const nouvelArticle = new Article({
            titre,
            prix,
            stock,
            categorie,
            Image: imagePath, // Enregistre le chemin de l'image
            description
        });

        // Sauvegarde dans la base de données
        await nouvelArticle.save();

        res.status(201).json({
            success: true,
            message: 'Article ajouté avec succès.',
            article: nouvelArticle
        });
    } catch (err) {
        console.error('Erreur lors de l\'ajout de l\'article :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'ajout de l\'article.'
        });
    }
});

// Route pour récupérer une image d'article
router.get('/api/articles/image/:filename', (req, res) => {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../asset/upload/article', filename);

    // Vérifier si le fichier existe
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).json({ success: false, message: 'Image non trouvée.' });
    }
});

// Route pour récupérer tous les articles
router.get('/api/articles', async (req, res) => {
    try {
        const articles = await Article.find();
        if (!articles || articles.length === 0) {
            return res.status(404).json({ success: false, message: 'Aucun article trouvé.' });
        }

        // Ajouter un lien complet pour l'image dans chaque article
        const articlesWithImageLinks = articles.map(article => ({
            ...article._doc,
            Image: article.Image ? `http://localhost:3000/api/articles/image/${path.basename(article.Image)}` : null
        }));

        res.status(200).json({ success: true, articles: articlesWithImageLinks });
    } catch (err) {
        console.error('Erreur lors de la récupération des articles :', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
});

// Route pour récupérer les produits disponibles (stock > -1)
router.get('/api/articles/disponibles', async (req, res) => {
    try {
        const articles = await Article.find({ stock: { $gt: -1 } });
        
        if (!articles || articles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucun article disponible trouvé.'
            });
        }

        // Ajouter un lien complet pour l'image dans chaque article
        const articlesWithImageLinks = articles.map(article => ({
            ...article._doc,
            Image: article.Image ? `http://localhost:3000/api/articles/image/${path.basename(article.Image)}` : null
        }));

        res.status(200).json({
            success: true,
            articles: articlesWithImageLinks
        });
    } catch (err) {
        console.error('Erreur lors de la récupération des articles disponibles :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur.'
        });
    }
});

// Route pour récupérer un article spécifique
router.get('/api/articles/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article non trouvé"
            });
        }
        
        // Ajouter le lien complet pour l'image
        const articleWithImageLink = {
            ...article._doc,
            Image: article.Image ? `http://localhost:3000/api/articles/image/${path.basename(article.Image)}` : null
        };

        res.status(200).json({
            success: true,
            article: articleWithImageLink
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération de l'article",
            error: error.message
        });
    }
});

// Route pour modifier un article
router.put('/api/articles/:id', upload.single('image'), async (req, res) => {
    try {
        const { titre, prix, stock, categorie, description } = req.body;
        const updateData = { titre, prix, stock, categorie, description };

        // Si une nouvelle image est fournie
        if (req.file) {
            updateData.Image = `/asset/upload/article/${req.file.filename}`;
        }

        const article = await Article.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            message: "Article modifié avec succès",
            article
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la modification de l'article",
            error: error.message
        });
    }
});

// Route pour changer la quantité d'un article
router.put('/api/Display', async (req, res) => {
    try {
        const { articleId, stock } = req.body;
        const article = await Article.findByIdAndUpdate(
            articleId,
            { stock: stock },
            { new: true }
        );

        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            message: "Stock mis à jour avec succès",
            article
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du stock :', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour du stock",
            error: error.message
        });
    }
});

// Route pour créer une nouvelle commande
router.post('/api/commandes', async (req, res) => {
    try {
        const { articleId, nom, quantite, telephone, email, adresse } = req.body;

        // Vérification des champs requis
        if (!articleId || !nom || !quantite || !telephone || !email || !adresse) {
            return res.status(400).json({
                success: false,
                message: "Tous les champs sont obligatoires"
            }); 
        }

        // Vérifier l'article et calculer le montant
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article non trouvé"
            });
        }

        // Vérifier le stock disponible
        if (article.stock < quantite) {
            return res.status(400).json({
                success: false,
                message: "Stock insuffisant"
            });
        }

        const montantTotal = article.prix * quantite;

        const commande = new Commande({
            articleId,
            client: {
                nom,
                email,
                telephone,
                adresse
            },
            quantite,
            montantTotal
        });

        await commande.save();

        // Mise à jour du stock et du compteur de commandes
        article.stock -= quantite;
        article.commandes += 1;
        await article.save();

        res.status(201).json({
            success: true,
            message: "Commande créée avec succès",
            commande
        });
    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création de la commande",
            error: error.message
        });
    }
});

// Route pour récupérer toutes les commandes
router.get('/api/commandes', async (req, res) => {
    try {
        const commandes = await Commande.find()
            .populate('articleId')
            .sort('-createdAt');
        
        res.status(200).json({
            success: true,
            commandes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des commandes",
            error: error.message
        });
    }
});

// Route pour mettre à jour le statut d'une commande
router.put('/api/commandes/:id/statut', async (req, res) => {
    try {
        const { statut } = req.body;
        const commande = await Commande.findByIdAndUpdate(
            req.params.id,
            { statut },
            { new: true }
        ).populate('articleId');

        if (!commande) {
            return res.status(404).json({
                success: false,
                message: "Commande non trouvée"
            });
        }

        res.status(200).json({
            success: true,
            message: "Statut de la commande mis à jour",
            commande
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour du statut",
            error: error.message
        });
    }
});

// Route pour mettre à jour le statut de paiement
router.put('/api/commandes/:id/paiement', async (req, res) => {
    try {
        const { statutPaiement, methodePaiement } = req.body;
        const commande = await Commande.findByIdAndUpdate(
            req.params.id,
            { statutPaiement, methodePaiement },
            { new: true }
        ).populate('articleId');

        if (!commande) {
            return res.status(404).json({
                success: false,
                message: "Commande non trouvée"
            });
        }

        res.status(200).json({
            success: true,
            message: "Statut de paiement mis à jour",
            commande
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour du paiement",
            error: error.message
        });
    }
});

// Route pour annuler une commande
router.put('/api/commandes/:id/annuler', async (req, res) => {
    try {
        const commande = await Commande.findById(req.params.id);
        if (!commande) {
            return res.status(404).json({
                success: false,
                message: "Commande non trouvée"
            });
        }

        // Restaurer le stock
        const article = await Article.findById(commande.articleId);
        if (article && commande.statut !== 'Annulée') {
            article.stock += commande.quantite;
            article.commandes -= 1;
            await article.save();
        }

        commande.statut = 'Annulée';
        await commande.save();

        res.status(200).json({
            success: true,
            message: "Commande annulée avec succès",
            commande
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'annulation de la commande",
            error: error.message
        });
    }
});



// Route pour gérer les favoris
router.post('/api/articles/toggle-favorite', async (req, res) => {
    try {
        const { articleId } = req.body;
        
        if (!articleId) {
            return res.status(400).json({ success: false, message: 'ID article manquant' });
        }

        // Vérifier si l'article existe
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ success: false, message: 'Article non trouvé' });
        }

        // Vérifier si l'utilisateur a déjà mis en favoris via le cookie
        const cookieName = `favorite_${articleId}`;
        const isFavorite = req.cookies[cookieName] === 'true';
        
        if (isFavorite) {
            // Supprimer le favori
            res.cookie(cookieName, '', { expires: new Date(0) });
            await Article.findByIdAndUpdate(articleId, { 
                $inc: { nbFavoris: -1 }
            });
            
            return res.json({ 
                success: true, 
                isFavorite: false,
                nbFavoris: article.nbFavoris - 1,
                message: 'Article retiré des favoris'
            });
        } else {
            // Ajouter le favori
            res.cookie(cookieName, 'true', { 
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
                httpOnly: true 
            });
            await Article.findByIdAndUpdate(articleId, { 
                $inc: { nbFavoris: 1 }
            });
            
            return res.json({ 
                success: true, 
                isFavorite: true,
                nbFavoris: article.nbFavoris + 1,
                message: 'Article ajouté aux favoris'
            });
        }
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});
module.exports = router;