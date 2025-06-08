

document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.section');
    const options = document.querySelectorAll('.tableauDeBord__content .opt');
    const tableauDeBord = document.getElementById("tableauDeBord");

    // Fonction pour créer ou mettre à jour un cookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
    }

    // Fonction pour récupérer un cookie
    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(`${name}=`)) {
                return cookie.substring(name.length + 1);
            }
        }
        return null;
    }

    // Fonction pour mettre à jour le cookie avec la dernière section et option
    function updateLastSectionCookie(index) {
        setCookie('lastSection', index, 7); // Cookie valable 7 jours
    }

    // Vérifier si un cookie existe pour la dernière section
    const lastSectionIndex = getCookie('lastSection');
    if (lastSectionIndex !== null && sections[lastSectionIndex] && options[lastSectionIndex]) {
        // Charger la dernière section et option depuis le cookie
        sections.forEach(section => section.classList.remove('active'));
        options.forEach(option => option.classList.add('opt--noir'));
        sections[lastSectionIndex].classList.add('active');
        options[lastSectionIndex].classList.remove('opt--noir');
    } else {
        // Afficher la première section par défaut
        if (sections.length > 0) {
            sections[0].classList.add('active');
            options[0].classList.remove('opt--noir');
        }
    }

    // Ajouter un événement pour chaque option
    options.forEach((option, index) => {
        option.addEventListener('click', () => {
            sections.forEach(section => section.classList.remove('active'));
            options.forEach(option => option.classList.add('opt--noir'));
            sections[index].classList.add('active');
            options[index].classList.remove('opt--noir');

            // Mettre à jour le cookie avec la nouvelle section
            updateLastSectionCookie(index);

            // Fermer le menu après avoir sélectionné une option
            tableauDeBord.classList.remove("tableauDeBord--visible");
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menuBtn");
    const tableauDeBord = document.getElementById("tableauDeBord");

    menuBtn.addEventListener("click", () => {
        tableauDeBord.classList.toggle("tableauDeBord--visible");
    });
});

///////////////////defilement Creer une entrée

const defilant = document.querySelector('.defilant');
const defilantContent = document.querySelector('.defilant__content');
const defilantText = document.getElementById('textDefil');
let isOpen = false;
const defilantOptions = document.querySelectorAll('.defilant__content .opt');
defilantText.addEventListener('click', () => {
    if (defilantContent.style.height==='0px' || defilantContent.style.height==='') {
        defilantContent.style.height='125px'
    }
    else{
        defilantContent.style.height='0px'
    }
});

// Fonction pour ouvrir une section spécifique
function openSection(sectionName) {
    const sections = document.querySelectorAll('.section');
    const options = document.querySelectorAll('.tableauDeBord__content .opt');
    const tableauDeBord = document.getElementById("tableauDeBord");

    // Trouver l'index de la section à partir de son ID
    const sectionIndex = Array.from(sections).findIndex(section => section.id === sectionName);
    
    if (sectionIndex !== -1) {
        // Retirer la classe active de toutes les sections
        sections.forEach(section => section.classList.remove('active'));
        options.forEach(option => option.classList.add('opt--noir'));

        // Ajouter la classe active à la section demandée
        sections[sectionIndex].classList.add('active');
        options[sectionIndex].classList.remove('opt--noir');

        // Ouvrir le menu si nécessaire
        tableauDeBord.classList.add("tableauDeBord--visible");
    }
}

// Exemple d'utilisation :
// openSection('Facture'); // Pour ouvrir la section Facture
// openSection('Boutique'); // Pour ouvrir la section Boutique
// openSection('Rapport'); // Pour ouvrir la section Rapport

///////////////////// Submition de formulaire


/////////////////////// Add actualite form //////////////////////

document.addEventListener('DOMContentLoaded', function() {
    const formActualite = document.getElementById('publ');
    
    formActualite.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const contenue = document.getElementById('contenue').value;
        
        if (!contenue.trim()) {
            alert('Veuillez saisir un contenu');
            return;
        }

        try {
            const response = await fetch('/addActualites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ contenue })
            });

            const data = await response.json();

            if (data.success) {
                alert('Publication réussie !');
                document.getElementById('contenue').value = '';
                // Fermer la modal si nécessaire
                document.getElementById('modal-publication').style.display = 'none';
                // Recharger les actualités
                if (data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                }
            } else {
                alert(data.message || 'Erreur lors de la publication');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la publication');
        }
    });
});


/////////////////////////////////////// Add depense form //////////////////////

document.getElementById('depenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const depenseData = {
        categorie: document.getElementById('categorieDepense').value, // Récupère la valeur sélectionnée
        description: document.getElementById('descriptionDepense').value.trim(), // Supprime les espaces inutiles
        montant: parseFloat(document.getElementById('montant').value),
        date: document.getElementById('date').value,
        fournisseur: document.getElementById('fournisseur').value.trim(),
        modePaiement: document.getElementById('modePaiement').value.trim(),
        projetAssocie: document.getElementById('projetAssocie').value.trim()
    };

    console.log('Données de dépense:', depenseData);

    try {
        const response = await fetch('http://localhost:3000/api/depenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(depenseData)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Dépense ajoutée avec succès !');
        } else {
            console.log('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la dépense :', error);
        alert('Une erreur est survenue.');
    }
});

///////////////////////////// Add article form ////////////////////////////

document.getElementById('articleForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('titre', document.getElementById('titre').value);
    formData.append('categorie', document.getElementById('CategorieArticle').value);
    formData.append('prix', parseFloat(document.getElementById('prix').value));
    formData.append('stock', parseInt(document.getElementById('stock').value));
    formData.append('description', document.getElementById('description').value);

    // Ajouter l'image si elle existe
    const imageInput = document.getElementById('image');
    if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }
    

    try {
        const response = await fetch('http://localhost:3000/api/articles', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            alert('Article ajouté avec succès !');
            document.getElementById('articleForm').reset(); // Réinitialise le formulaire
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'article :', error);
        alert('Une erreur est survenue.');
    }
});


////////////////////////// Add personnel form //////////////////////////

document.getElementById('personnelForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Sauvegarder l'image et attendre son chemin
    let photoPath = null;
    const photoInput = document.getElementById('photo-Employe');
    if (photoInput.files.length > 0) {
        photoPath = await sauvegarderImage('photoProfile', photoInput.files[0]);
        if (!photoPath) {
            alert('Erreur lors de la sauvegarde de la photo.');
            return;
        }
    }

    const personnelData = {
        nom: document.getElementById('nom-Employe').value.trim(),
        prenom: document.getElementById('prenom-Employe').value.trim(),
        sexe: document.getElementById('sexe-Employe').value.trim(),
        email: document.getElementById('email-Employe').value.trim(),
        telephone: document.getElementById('telephone-Employe').value.trim(),
        adresse: document.getElementById('adresse-Employe').value.trim(),
        role: document.getElementById('role-Employe').value,
        dateNaissance: document.getElementById('dateNaissance-Employe').value,
        numeroCarteIdentite: document.getElementById('numeroCarteIdentite-Employe').value.trim(),
        typeContrat: document.getElementById('typeContrat-Employe').value,
        dateEmbauche: document.getElementById('dateEmbauche-Employe').value,
        salaire: parseFloat(document.getElementById('salaire-Employe').value),
        poste: document.getElementById('poste-Employe').value.trim(),
        departement: document.getElementById('departement-Employe').value.trim(),
        statut: document.getElementById('statut-Employe').value,
        photo: photoPath, // Utiliser le chemin de la photo sauvegardée
        notes: document.getElementById('notes-Employe').value.trim()
    };

    console.log('Données du membre du personnel :', personnelData);

    try {
        const response = await fetch('/Addpersonnel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(personnelData)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Membre du personnel ajouté avec succès !');
            document.getElementById('personnelForm').reset(); // Réinitialise le formulaire
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout du membre du personnel :', error);
        alert('Une erreur est survenue.');
    }
});


////////////////////////////////// vente ////////////////////////////////////

document.addEventListener('DOMContentLoaded', async () => {
    const produitSelect = document.getElementById('produitId');

    // Charger les produits existants depuis le backend
    try {
        const response = await fetch('http://localhost:3000/api/Vente/articles');
        const produits = await response.json();

        if (response.ok) {
            produits.forEach(produit => {
                const option = document.createElement('option');
                option.value = produit._id;
                option.textContent = `${produit.titre} - ${produit.prix}€`;
                produitSelect.appendChild(option);
            });
        } else {
            alert('Erreur lors du chargement des produits : ' + produits.message);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des produits :', error);
    }

    // Gestion de l'envoi du formulaire
    document.getElementById('venteForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const venteData = {
            client: document.getElementById('client').value.trim(),
            produitId: document.getElementById('produitId').value,
            quantité: parseInt(document.getElementById('quantité').value),
            date: document.getElementById('dateVente').value,
            paiement: document.getElementById('paiement').value.trim(),
            via: document.getElementById('via').value.trim(),
            livraison: document.getElementById('livraison').value.trim(),

        };

        try {
            const response = await fetch('http://localhost:3000/api/ventes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(venteData)
            });

            const result = await response.json();
            if (response.ok) {
                alert('Vente enregistrée avec succès !');
                document.getElementById('venteForm').reset(); // Réinitialise le formulaire
            } else {
                alert('Erreur : ' + result.message);
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de la vente :', error);
            alert('Une erreur est survenue.');
        }
    });
});

////////////////////////////////  Fiche de paie /////////////////////////////


// Gestion de l'envoi du formulaire de fiche de paie
document.getElementById('FicheDePaie').addEventListener('submit', async (e) => {
    e.preventDefault();

    const FicheData = {
        Idemploye: document.getElementById('idEmployé').value.trim(),
        datePaiement: document.getElementById('datePaiement').value,
        DebutPeriode: document.getElementById('debutPeriode').value,
        FinPeriode: document.getElementById('finPeriode').value,
        typeDePaie: document.getElementById('TypeDePaie').value.trim(),
        modePaiement: document.getElementById('ModePaiement-FicheDePAie').value.trim(),
    };

    try {
        const response = await fetch('/api/AddPaie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(FicheData)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Paie enregistrée avec succès !');
            document.getElementById('FicheDePaie').reset(); // Réinitialise le formulaire
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la vente :', error);
        alert('Une erreur est survenue.');
    }
});

