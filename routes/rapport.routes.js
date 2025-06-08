const multer = require('multer');
const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const Report = require('../modele/product.model').model('Report');
// const requireAuth = require('../middleware/auth.middleware');

// Configuration du dossier d'upload
const uploadDir = path.join(__dirname, '../asset/uploads/rapports/');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
        return cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
    }
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter: fileFilter
});

// // Middleware pour sécuriser les routes
// router.use(requireAuth);

// 1. Upload d'un rapport
router.post('/api/reports/upload', upload.single('rapport'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'Aucun fichier PDF fourni' 
            });
        }

        console.log("\n----------------- Ajout du rapports: \n",req.body);
        const { reference, description, category, reportDate } = req.body;

        const newReport = new Report({
            originalName: req.file.originalname,
            filePath: path.relative(path.join(__dirname, '../'), req.file.path).replace(/\\/g, '/'),
            reference: reference || generateReference(),
            description: description || '',
            category: category || 'Autre',
            reportDate: reportDate || new Date(),
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            uploadedBy: req.session.user._id // Utilisation de la session
        });

        await newReport.save();

        res.status(201).json({
            success: true,
            message: 'Rapport uploadé avec succès',
            data: {
                id: newReport._id,
                reference: newReport.reference,
                originalName: newReport.originalName
            }
        });

    } catch (error) {
        console.error('Erreur upload:', error);
        
        // Nettoyage du fichier en cas d'erreur
        if (req.file) {
            fs.unlink(req.file.path, err => {
                if (err) console.error('Erreur nettoyage fichier:', err);
            });
        }

        res.status(500).json({ 
            success: false,
            message: error.message || 'Erreur lors de l\'upload du rapport' 
        });
    }
});

// 2. Lister tous les rapports (avec pagination et filtres)
router.get('/api/reports', async (req, res) => {
    try {
        const reports = await Report.find().sort({ reportDate: -1 })

        console.log("\n---------------------------- Rapport ------------------------\n",reports);
        res.json({
            success: true,
            data: reports,
        });

    } catch (error) {
        console.error('Erreur liste rapports:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur serveur' 
        });
    }
});

// 3. Télécharger un rapport
router.get('/api/reports/download/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ 
                success: false,
                message: 'Rapport non trouvé' 
            });
        }

        const absolutePath = path.join(__dirname, '../', report.filePath);
        
        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ 
                success: false,
                message: 'Fichier PDF introuvable sur le serveur' 
            });
        }

        res.download(absolutePath, report.originalName, (err) => {
            if (err) {
                console.error('Erreur download:', err);
                if (!res.headersSent) {
                    res.status(500).json({ 
                        success: false,
                        message: 'Erreur lors du téléchargement' 
                    });
                }
            }
        });

    } catch (error) {
        console.error('Erreur téléchargement:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur serveur' 
        });
    }
});

// 4. Supprimer un rapport
router.delete('/api/reports/:id', async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);
        if (!report) {
            return res.status(404).json({ 
                success: false,
                message: 'Rapport non trouvé' 
            });
        }

        const filePath = path.join(__dirname, '../', report.filePath);
        
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Erreur suppression fichier:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Erreur lors de la suppression du fichier' 
                });
            }
            res.json({ 
                success: true,
                message: 'Rapport supprimé avec succès' 
            });
        });

    } catch (error) {
        console.error('Erreur suppression:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur serveur' 
        });
    }
});

// 5. Récupérer les métadonnées d'un rapport spécifique
router.get('/api/reports/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .select('-__v -filePath');
            
        if (!report) {
            return res.status(404).json({ 
                success: false,
                message: 'Rapport non trouvé' 
            });
        }

        res.json({ 
            success: true,
            data: report 
        });

    } catch (error) {
        console.error('Erreur détails rapport:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur serveur' 
        });
    }
});

// Fonction utilitaire pour générer une référence
function generateReference() {
    return 'RAPP-' + Date.now().toString(36).toUpperCase() + 
           Math.floor(Math.random() * 1000).toString().padStart(3, '0');
}

module.exports = router;