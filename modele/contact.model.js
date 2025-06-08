const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true,
        trim: true
    },
    message: { 
        type: String, 
        required: true 
    },
    dateEnvoi: { 
        type: Date, 
        default: Date.now 
    },
    localisation: {
        pays: String,
        region: String,
        ville: String,
        coordonnees: {
            latitude: Number,
            longitude: Number
        }
    },
    ipSource: String,
    userAgent: String,
    langue: String,
    statut: {
        type: String,
        enum: ['Non lu', 'Lu', 'En traitement', 'Traité'],
        default: 'Non lu'
    },
    repondu: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Contact', ContactSchema);