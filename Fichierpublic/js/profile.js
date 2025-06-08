
async function loadUserData() {
    try {
        const response = await fetch(`/api/user`); 
        const data = await response.json();
        console.log(data);
        if (response.ok) {
            updateUserInterface(data.user);
        } else {
            alert('Erreur lors du chargement des données : ' + data.message);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données :', error);
    }
}
loadUserData();

async function Deconnection() {
    const response = await fetch('/api/Deconnecte', {
        method: 'POST'
    });

    const data = await response.json();
    if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
    }
}

// Fonction pour mettre à jour l'interface utilisateur
function updateUserInterface(userData) {
    // Informations de base
    document.getElementById('prenom').textContent = userData.prenom;
    document.getElementById('nom').textContent = userData.nom;
    document.getElementById('role').textContent = userData.role;
    
    // Statut avec classe CSS
    const statutElement = document.getElementById('statut');
    statutElement.textContent = userData.statut || 'Iconnu';
    statutElement.className = `statut ${userData.statut.toLowerCase()}`;

    // Photo de profil
    if (userData.photo) {
        document.getElementById('profile-pic').src = getImageUrl(userData.photo);
    }

    // Informations personnelles
    document.getElementById('email').textContent = userData.email;
    document.getElementById('telephone').textContent = userData.telephone;
    document.getElementById('adresse').textContent = userData.adresse;
    document.getElementById('dateNaissance').textContent = formatDate(userData.dateNaissance);
    document.getElementById('numeroCarteIdentite').textContent = userData.numeroCarteIdentite || 'Non renseigné';

    // Informations professionnelles (uniquement pour les employés)
    const employeeSection = document.querySelector('.employee-only');
    if (userData.role === 'Employé') {
        employeeSection.style.display = 'block';
        document.getElementById('poste').textContent = userData.poste;
        document.getElementById('departement').textContent = userData.departement;
        document.getElementById('typeContrat').textContent = userData.typeContrat;
        document.getElementById('dateEmbauche').textContent = formatDate(userData.dateEmbauche);
        document.getElementById('salaire').textContent = formatSalaire(userData.salaire);
    } else {
        employeeSection.style.display = 'none';
    }

    // Historique
    document.getElementById('dernierAcces').textContent = formatDate(userData.dernierAcces);
    document.getElementById('dateCreation').textContent = formatDate(userData.dateCreation);

    // Projets
    const projetsContainer = document.getElementById('historiqueProjets');
    if (userData.projetsParticipant && userData.projetsParticipant.length > 0) {
        projetsContainer.innerHTML = userData.projetsParticipant
            .map(projet => createProjectCard(projet))
            .join('');
    } else {
        projetsContainer.innerHTML = '<p>Aucun projet associé</p>';
    }

    // Notes
    document.getElementById('notes').textContent = userData.notes || 'Aucune note';
}

// Séparer l'initialisation du menu dans une fonction dédiée
function initializeDropdownMenu() {
    const menuTrigger = document.querySelector('.menu-trigger');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    console.log('Initialisation du menu...'); // Débogage
    console.log('menuTrigger:', menuTrigger); // Vérifier si l'élément est trouvé
    console.log('dropdownMenu:', dropdownMenu); // Vérifier si l'élément est trouvé

    if (menuTrigger && dropdownMenu) {
        menuTrigger.addEventListener('click', function(e) {
            e.preventDefault(); // Ajouter ceci
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
            console.log('Menu cliqué - état:', dropdownMenu.classList.contains('active')); // Débogage amélioré
        });

        // Simplifier la gestion du clic extérieur
        document.addEventListener('click', function(e) {
            if (!menuTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    } else {
        console.error('Éléments du menu non trouvés:', {
            trigger: !!menuTrigger,
            menu: !!dropdownMenu
        });
    }
}

 initializeDropdownMenu() ;

// Fonction pour charger les données de l'utilisateur

// Initialisation des modaux
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');

    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            // Fermer le dropdown quand on ouvre un modal
            document.querySelector('.dropdown-menu').classList.remove('active');
        }
    };

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = button.closest('.modal');
            modal.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Fonctions pour gérer les modaux
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        // Fermer le menu déroulant
        const dropdownMenu = document.querySelector('.dropdown-menu');
        if (dropdownMenu) {
            dropdownMenu.classList.remove('active');
        }
    }
}

function closeModal(idModal) {
    const modal = document.getElementById(idModal);
    modal.style.display = 'none';

}

const modalPassword= document.getElementById('password-modal')
const modalCadre= document.getElementById('business-card-modal')

modalPassword.addEventListener('click', function() {
    if(event.target.classList.contains('modal')){
        closeModal(modalPassword);
    }
});

modalCadre.addEventListener('click', function() {
    if(event.target.classList.contains('modal')){
        closeModal(modalCadre);
    }
});



// Initialisation des formulaires
function initializeForms(userId) {
    // Formulaire de modification du profil
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(profileForm);
        const userData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`/api/personnel/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();
            if (response.ok) {
                alert('Profil mis à jour avec succès');
                loadUserData(userId);
                document.getElementById('profile-modal').style.display = 'none';
            } else {
                alert('Erreur : ' + result.message);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil :', error);
        }
    });

    // Autres gestionnaires de formulaires similaires pour le mot de passe et la photo...
}

// Fonctions utilitaires
function formatDate(dateString) {
    if (!dateString) return 'Non renseigné';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}
function formatSalaire(salaire) {
    if (!salaire) return 'Non renseigné';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(salaire);
}
function createProjectCard(projet) {
    return `
        <div class="project-card">
            <div class="project-info">
                <h3>${projet.titre}</h3>
                <p>${projet.description}</p>
            </div>
            <div class="project-status">
                <span class="status ${projet.statut.toLowerCase()}">${projet.statut}</span>
            </div>
        </div>
    `;
}
  /////////////////// modifier mdp

// Gestion du formulaire de changement de mot de passe
document.getElementById('password-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const inputs = form.querySelectorAll('input');
    const messageEl = form.querySelector('.Message');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Récupération des valeurs
    const ancienMotDePasse = inputs[0].value;
    const nouveauMotDePasse = inputs[1].value;
    const confirmationMotDePasse = inputs[2].value;

    // Validation frontale
    if (nouveauMotDePasse !== confirmationMotDePasse) {
        showMessage(messageEl, 'Les nouveaux mots de passe ne correspondent pas', 'error');
        return;
    }

    if (nouveauMotDePasse.length < 6) {
        showMessage(messageEl, 'Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }

    // Désactiver le bouton pendant la requête
    submitBtn.disabled = true;
    submitBtn.textContent = 'En cours...';

    try {
        const response = await fetch('/changer-mot-de-passe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ancienMotDePasse,
                nouveauMotDePasse,
                confirmationMotDePasse
            })
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(messageEl, result.message, 'success');
            form.reset();
            // Fermer le modal après 2 secondes
            setTimeout(() => {
                document.getElementById('password-modal').style.display = 'none';
            }, 2000);
        } else {
            showMessage(messageEl, result.message, 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage(messageEl, 'Erreur de connexion au serveur', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Mettre à jour';
    }
});
// Fonction pour afficher les messages
function showMessage(element, text, type) {
    element.textContent = text;
    element.style.color = type === 'success' ? 'green' : 'red';
    element.style.display = 'block';
    
    // Effacer le message après 5 secondes
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Fonction pour mettre à jour les infos de la carte de visite
function updateBusinessCard(userData) {
    document.getElementById('bc-prenom').textContent = userData.prenom;
    document.getElementById('bc-nom').textContent = userData.nom;
    document.getElementById('bc-poste').textContent = userData.poste || userData.role;
    document.getElementById('bc-telephone').textContent = userData.telephone;
    document.getElementById('bc-email').textContent = userData.email;
    document.getElementById('bc-adresse').textContent = userData.adresse;
}

// Fonction pour imprimer la carte de visite
function printBusinessCard() {
    const printContents = document.querySelector('.business-card').outerHTML;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = `
        <style>
            @media print {
                body * {
                    visibility: hidden;
                }
                .business-card, .business-card * {
                    visibility: visible;
                }
                .business-card {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    box-shadow: none;
                }
            }
            ${getBusinessCardStyles()}
        </style>
        ${printContents}
    `;
    
    window.print();
    document.body.innerHTML = originalContents;
}

// Fonction pour les styles de la carte de visite
function getBusinessCardStyles() {
    return `
        .business-card {
            width: 85mm;
            height: 55mm;
            perspective: 1000px;
            margin: 20px auto;
        }
        .card-front, .card-back {
            width: 100%;
            height: 100%;
            position: absolute;
            backface-visibility: hidden;
            border-radius: 10px;
            padding: 15px;
            box-sizing: border-box;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .card-front {
            background: linear-gradient(135deg, #2c3e50, #4ca1af);
            color: white;
            align-items: center;
            justify-content: center;
        }
        .card-back {
            background: white;
            color: #333;
            transform: rotateY(180deg);
        }
        .company-name {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .company-slogan {
            font-style: italic;
            font-size: 0.9em;
            opacity: 0.8;
        }
        .company-website {
            font-size: 0.8em;
            margin-top: 10px;
        }
        .user-name {
            font-size: 1.3em;
            margin: 5px 0;
            color: #2c3e50;
        }
        .user-position {
            font-size: 1em;
            color: #4ca1af;
            margin-bottom: 10px;
        }
        .contact-info p, .address-info p {
            margin: 3px 0;
            font-size: 0.8em;
        }
        .print-button {
            margin-top: 20px;
            padding: 10px 15px;
            background-color: #4ca1af;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
    `;
}