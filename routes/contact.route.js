const express = require('express');
const router = express.Router();
const Contact = require('../modele/contact.model');
const geoip = require('geoip-lite');

router.post('/api/contact', async (req, res) => {
    try {
        const { email, message } = req.body;
        
        // Récupération de l'IP du client
        const ip = req.ip || req.connection.remoteAddress;
        const geo = geoip.lookup(ip);

        const contact = new Contact({
            email,
            message,
            localisation: {
                pays: geo ? geo.country : 'Inconnu',
                region: geo ? geo.region : 'Inconnue',
                ville: geo ? geo.city : 'Inconnue'
            },
            userAgent: req.headers['user-agent'],
            langue: req.headers['accept-language']
        });

        await contact.save();
        res.status(201).json({ success: true, message: 'Message envoyé avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du message:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi du message' });
    }
});

// Récupérer tous les contacts
router.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ dateEnvoi: -1 }); // Tri par date décroissante
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Erreur lors de la récupération des contacts:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}); 

// Récupérer un contact par son ID
router.get('/contacts/:id', async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact non trouvé' });
        }
        res.status(200).json(contact);
    } catch (error) {
        console.error('Erreur lors de la récupération du contact:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Récupérer les contacts filtrés (ex: par statut)
router.get('/contacts/filter/:statut', async (req, res) => {
    try {
        const contacts = await Contact.find({ statut: req.params.statut }).sort({ dateEnvoi: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Erreur lors du filtrage des contacts:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});




module.exports = router;