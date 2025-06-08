const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour l'upload des images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../asset/upload', req.body.destination || 'default');
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

// Route pour sauvegarder une image
router.post('/api/upload-image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Aucun fichier fourni.' });
        }

        const imagePath = `/asset/upload/${req.body.destination || 'default'}/${req.file.filename}`;
        res.status(200).json({ success: true, imagePath });
    } catch (err) {
        console.error('Erreur lors de la sauvegarde de l\'image :', err);
        res.status(500).json({ success: false, message: 'Erreur serveur lors de la sauvegarde de l\'image.' });
    }
});




// Route pour récupérer une image


// Route pour récupérer une image
router.get('/api/images/:subfolder?/:filename', (req, res) => {
    try {
        const { subfolder, filename } = req.params;
        
        // Validation du nom de fichier pour la sécurité
        if (!filename || !/^[a-zA-Z0-9\-\._]+$/.test(filename)) {
            return res.status(400).send('Nom de fichier invalide');
        }

        // Chemin de base où sont stockées les images
        const basePath = path.join(__dirname, '../asset/upload');
        
        // Construire le chemin complet
        let imagePath;
        if (subfolder) {
            imagePath = path.join(basePath, subfolder, filename);
        } else {
            imagePath = path.join(basePath, filename);
        }

        // Vérification de sécurité du chemin
        const normalizedPath = path.normalize(imagePath);
        if (!normalizedPath.startsWith(basePath)) {
            return res.status(403).send('Accès non autorisé');
        }

        // Vérifier si le fichier existe
        if (fs.existsSync(imagePath)) {
            // Déterminer le type MIME
            const mimeType = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif'
            }[path.extname(imagePath).toLowerCase()] || 'application/octet-stream';

            res.setHeader('Content-Type', mimeType);
            res.sendFile(imagePath);
        } else {
            // Image par défaut si le fichier n'existe pas
            const defaultImagePath = path.join(__dirname, '../asset/images/default-profile.png');
            res.sendFile(defaultImagePath);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'image:', error);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;