const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VenteSchema = new mongoose.Schema({
    client: { type: String, required: true },
    produitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true }, // Référence au produit
    quantité: { type: Number, required: true },
    date: { type: Date, default: Date.now }, // Date par défaut à la date actuelle
    paiement: { type: String, required: true },
    categorie: { type: String, default: 'Autres' },
    via: { type: String, default: 'N/A' },
    livraison: { type: String, required: true }
},
{timestamps: true}
);

module.exports = mongoose.model('Vente', VenteSchema);

const ProjetSchema = new mongoose.Schema({
    titre :{ type: String, required: true },
    partenaire: { type: String, required: true },
    budget: { type: Number, required: true },
    Pourcentage: { type: Number, required: true },
    dateSignature: { type: Date, default: Date.now },
    dateEcheance: { type: Date, required: true },
    statut: { type: String, enum: ['En cours', 'En attente', 'Annulé', 'Terminé'], default: 'En cours' },
    depenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DepenseSchema', default: [] }],
    description: { type: String, required: true },
    idParticipantsPersonnel: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Personnel', default: [] }], // Liste des membres du personnel ayant participé
    Taches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TachePersonnele', default: [] }], //Liste des tâches à faire
    priorité: { type: String, enum: ['Mineur', 'Intermédiaire', 'Majeur'], required: true },
    responsable: { type: String, required: true },
    type: { type: String, required: true },
    image: { type: String, default: './asset/image/DefautProjet.jpg' },
    profit: { type: Number, default: 0 },
    
}, { timestamps: true });

module.exports = mongoose.model('Projet', ProjetSchema);

const FicheDePaieSchema = new mongoose.Schema({
    // id: { type: String, required: true },
    Idemploye: { type: String, required: true },
    datePaiement: { type: Date, required: true },
    DebutPeriode: { type: Date, required: true },
    FinPeriode: { type: Date, required: true },
    typeDePaie: {type: String ,enum: ['Salaire', 'Prime'], required: true },
    modePaiement: { type: String, required: true }
},
{timestamps: true}
);

module.exports = mongoose.model('FicheDePaie', FicheDePaieSchema);

const DepenseSchema = new mongoose.Schema({

    categorie: { type: String, required: true },
    description: { type: String, required: true },
    montant: { type: Number, required: true },
    date: { type: Date, required: true },
    fournisseur: { type: String, default: 'N/A' },
    modePaiement: { type: String, default: 'N/A' },
    projetAssocie: { type: String, required: true }
},
{timestamps: true}
);

module.exports = mongoose.model('Depense', DepenseSchema);

const EquipeSchema = new mongoose.Schema({
    // id: { type: String, required: true },
    nom: { type: String, required: true },
    membres: [{ type: String, required: true }]
},
{timestamps: true});

module.exports = mongoose.model('Equipe', EquipeSchema);

const TachePersonneleSchema = new mongoose.Schema({
    // id: { type: String, required: true },
    titre: { type: String, required: true },
    description: { type: String, default: 'Aucune description fournie' },
    statut: { type: String, enum: ['Terminé', 'En attente'], default: 'En attente' },
    assignéA: { type: String, required: true },
    dateEcheance: { type: Date, require: false },
},
{timestamps: true}
);

module.exports = mongoose.model('TachePersonnele', TachePersonneleSchema);

const ArticleSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    prix: { type: Number, required: true },
    nbFavoris: { type: Number, default: 0 },
    commandes: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    categorie: { type: String, default: 'Autres' },
    Image: { type: String, required: true },
    description: { type: String, required: true },
    corbeille: { type: Boolean, default: false },
},
{timestamps: true}
);

module.exports = mongoose.model('Article', ArticleSchema);

const PersonnelSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    sexe: {type: String,enum: ['M','F'], required: true},
    email: { type: String, required: true },
    telephone: { type: String, required: true },
    adresse: { type: String, required: true },
    role: { type: String, enum: ['Employé', 'Client', 'Partenaire'], required: true },
    dateNaissance: { type: Date, required: false }, // Date de naissance
    numeroCarteIdentite: { type: String, required: false }, // Numéro de carte d'identité
    typeContrat: { type: String, enum: ['CDI', 'CDD', 'Freelance', 'Stage'], required: function() { return this.role === 'Employé'; } }, // Type de contrat pour les employés
    dateEmbauche: { type: Date, required: function() { return this.role === 'Employé'; } }, // Date d'embauche pour les employés
    salaire: { type: Number, required: function() { return this.role === 'Employé'; } }, // Salaire pour les employés
    poste: { type: String, required: function() { return this.role === 'Employé'; } }, // Poste pour les employés
    departement: { type: String, required: function() { return this.role === 'Employé'; } }, // Département pour les employés
    statut: { type: String, enum: ['Actif', 'Inactif'], default: 'Actif' }, // Statut de la personne
    grade: {type: String, enum:['Non autorise','Elementaire', 'Superieur', 'Absolut'], default: 'Non autorise'},
    photo: { type: String, required: false }, // URL de la photo de profil
    historiqueProjets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Projet' }], // Projets associés
    historiqueVentes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vente' }], // Ventes associées
    notes: { type: String, required: false }, // Notes supplémentaires
    dateCreation: { type: Date, default: Date.now }, // Date de création de l'enregistrement
    dernierAcces: { type: Date, required: false } // Dernière connexion ou accès
},
{timestamps: true});

module.exports = mongoose.model('Personnel', PersonnelSchema);
 
const UserSchema = new mongoose.Schema({
    nomUser: { type: String, required: true },
    emailUser: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    personnelAssocie: {type: mongoose.Schema.Types.ObjectId, ref: 'Personnel', default: '' }
},
{timestamps: true}
);

module.exports = mongoose.model('User', UserSchema);

const DevisSchema = new mongoose.Schema({
    titre: { type: String, required: true }, // Titre du devis
    dateCreation: { type: Date, default: Date.now }, // Date de création du devis
    blocs: [
        {
            titreBloc: { type: String, required: true }, // Titre du bloc (ex: "Préparation du chantier")
            lignes: [
                {
                    numero: { type: Number, required: true }, // Numéro de la ligne
                    designation: { type: String, required: true }, // Désignation des ouvrages
                    unite: { type: String, required: true }, // Unité (ex: "FF")
                    quantite: { type: Number, required: true }, // Quantité
                    prixUnitaire: { type: Number, required: true }, // Prix unitaire
                    prixTotal: { type: Number, required: true } // Prix total (calculé)
                }
            ],
            totalBloc: { type: Number, required: true } // Total du bloc
        }
    ],
    totalDevis: { type: Number, required: true } // Total général du devis
},
{
    timestamps: true,
}
);

module.exports = mongoose.model('Devis', DevisSchema);
 
const CommandeSchema = new mongoose.Schema({
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
    client: {
        nom: { type: String, required: true },
        email: { type: String, required: true },
        telephone: { type: String, required: true },
        adresse: { type: String, required: true }
    },
    quantite: { type: Number, required: true },
    montantTotal: { type: Number, required: true },
    statut: { 
        type: String, 
        enum: ['En attente', 'Confirmée', 'En préparation', 'En livraison', 'Livrée', 'Annulée'], 
        default: 'En attente' 
    },
    dateLivraison: { type: Date },
    notes: { type: String },
    methodePaiement: { 
        type: String,
        enum: ['Espèces', 'Mobile Money', 'Carte bancaire'],
        default: 'Espèces'
    },
    statutPaiement: {
        type: String,
        enum: ['En attente', 'Payé', 'Remboursé'],
        default: 'En attente'
    }
},
{timestamps: true}
);

module.exports = mongoose.model('Commande', CommandeSchema);

const ReportSchema = new mongoose.Schema({
    // Nom original du fichier
    originalName: {
        type: String,
        required: true
    },
    
    // Chemin d'accès relatif
    filePath: {
        type: String,
        required: true
    },
    
    // Référence unique
    reference: {
        type: String,
        required: true,
        unique: true
    },
    
    // Taille en octets
    fileSize: {
        type: Number,
        required: true
    },
    
    // Type MIME
    mimeType: {
        type: String,
        default: 'application/pdf'
    },
    
    // Métadonnées supplémentaires
    metadata: {
        uploadDate: { type: Date, default: Date.now },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    },

    //Categorie 
    category:{type: String, require: false}
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);

