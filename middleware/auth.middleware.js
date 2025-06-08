// authMiddleware.js
const Personnel = require('../modele/product.model').model('Personnel');

// Middleware de base - vérifie simplement la connexion
function requireAuth(req, res, next) {
    if (!req.session?.user) {
        return res.redirect('/inscription');
    }
    next();
}

// Vérifie le grade Elementaire
async function requireElementaire(req, res, next) {
    try {
        if (!req.session?.user?.id) {
            return res.redirect('/inscription');
        }

        const userGrade = await getGradeFromUser(req.session.user.id);
        if (userGrade !== 'Elementaire') {
            return res.status(403).send('Accès non autorisé');
        }
        next();
    } catch (err) {
        console.error('Erreur vérification grade:', err);
        res.status(500).send('Erreur serveur');
    }
}

// Vérifie les grades Supérieur ou Absolut
async function requireSuperieur(req, res, next) {
    try {
        if (!req.session?.user?.id) {
            return res.redirect('/inscription');
        }

        const userGrade = await getGradeFromUser(req.session.user.id);
        if (!['Superieur', 'Absolut'].includes(userGrade)) {
            return res.status(403).send('Accès non autorisé');
        }
        next();
    } catch (err) {
        console.error('Erreur vérification grade:', err);
        res.status(500).send('Erreur serveur');
    }
}

// Vérifie le grade Absolut uniquement
async function requireAbsolut(req, res, next) {
    try {
        if (!req.session?.user?.id) {
            return res.redirect('/inscription');
        }

        const userGrade = await getGradeFromUser(req.session.user.id);
        if (userGrade !== 'Absolut') {
            return res.status(403).send('Accès non autorisé');
        }
        next();
    } catch (err) {
        console.error('Erreur vérification grade:', err);
        res.status(500).send('Erreur serveur');
    }
}

// Fonction utilitaire pour récupérer le grade
async function getGradeFromUser(userId) {
    const user = await User.findById(userId).populate('personnelAssocie');
    return user?.personnelAssocie?.grade || null;
}

module.exports = {
    requireAuth,
    requireElementaire,
    requireSuperieur,
    requireAbsolut
};