const mongoose = require('mongoose');

const actualiteSchema = new mongoose.Schema({
    contenu: {
        type: String,
        required: true
    },
    datePublication: {
        type: Date,
        default: Date.now
    },
    auteur: {
        type: String,
        default: 'Anonyme'
    }
}, { timestamps: true });

module.exports = mongoose.model('Actualite', actualiteSchema);