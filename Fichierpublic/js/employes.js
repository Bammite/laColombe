const idEmpFormulaire =document.getElementById('idEmploye');

// Fonction pour récupérer les Employés depuis l'API
async function fetchPerso() {
    try {
        const response = await fetch('http://localhost:3000/Personnels');
        const result = await response.json();
 
        if (response.ok) {
            console.log("Personnele recuperée: ", result);
            afficherEmployes(result.personnels);

        } else {
            console.error('Erreur lors de la récupération des membres du personnele :', result.message);
            console.log('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des actu :', error);
        console.log('Une erreur est survenue lors de la récupération des actu.');
    }
}

fetchPerso();


function afficherEmployes(personnel) {
    const employeeGrid = document.querySelector('.employee-grid');
    employeeGrid.innerHTML = ''; // Vider le contenu existant
    const employeeCount = document.getElementById('employeeCount');
    employeeCount.textContent = personnel.length;

    // Fonction d'échappement HTML
    const escapeHtml = (unsafe) => {
        return unsafe?.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;") || '';
    };

    personnel.forEach(employe => {
        const card = document.createElement('div');
        card.classList.add('employee-card');
        
        // Échapper toutes les données
        const nom = escapeHtml(employe.nom);
        const prenom = escapeHtml(employe.prenom);
        const poste = escapeHtml(employe.poste);
        const departement = escapeHtml(employe.departement);
        const email = escapeHtml(employe.email);
        const telephone = escapeHtml(employe.telephone);
        const photoProfile = getImageUrl(employe.photo) || '/asset/image/default-profile.jpg';

        card.innerHTML = `
            <div class="card-header">
                <img src="${photoProfile}" alt="Photo de ${nom}" 
                     onerror="this.src='/assets/default-profile.jpg'">
                <button class="employee-menu-btn" data-id="${employe._id}">...</button>
                <div class="employee-menu-options">
                    <button class="menu-option" data-action="modify">Modifier le profil</button>
                     <a href="./profileAutre.html?id=${employe._id}" target="_blank" ><button class="menu-option">Afficher toutes les infos</button></a>
                    <button class="menu-option" data-action="promote">Élever le statut</button>
                </div>
            </div>
            <div class="card-body">
                <div class="name">${nom} ${prenom}</div>
                <div class="position">${poste}</div>
                <details>
                    <summary>Voir plus</summary>
                    <div class="details">
                        <p><strong>Département:</strong> ${departement}</p>
                        <p><strong>Date d'embauche:</strong> ${new Date(employe.dateEmbauche).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div class="contact">
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Téléphone:</strong> ${telephone}</p>
                    </div>
                </details>
            </div>
        `;

        employeeGrid.appendChild(card);
    });

    // Délégation d'événements pour meilleure performance
    employeeGrid.addEventListener('click', (e) => {
        // Gestion du menu
        if (e.target.classList.contains('employee-menu-btn')) {
            const menu = e.target.nextElementSibling;
            document.querySelectorAll('.employee-menu-options').forEach(m => {
                if (m !== menu) m.style.display = 'none';
            });
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            e.stopPropagation();
        }
        // Gestion des actions
        else if (e.target.classList.contains('menu-option')) {
            const card = e.target.closest('.employee-card');
            const employeeId = card.querySelector('.employee-menu-btn').dataset.id;
            const action = e.target.dataset.action;
            
            const employe = personnel.find(e => e._id === employeeId);
            if (!employe) return;

            if (action === 'modify') {
                ModifierPersonnele(employe);
            }
            // ... autres actions
        }
    });

    // Fermer les menus en cliquant ailleurs
    document.addEventListener('click', () => {
        document.querySelectorAll('.employee-menu-options').forEach(menu => {
            menu.style.display = 'none';
        });
    });
}

// Charger les employés au chargement de la page
document.addEventListener('DOMContentLoaded', afficherEmployes);


/////////////////////////////// Modifier un Employé //////////////////////////

async function ModifierPersonnele(Personne) {
    console.log("Personne a modifier: ", Personne);
    // Remplir le formulaire avec les données de l'employé
    document.getElementById('idEmploye').value = Personne._id;
    document.getElementById('nom-Employe-Modif').value = Personne.nom || '';
    document.getElementById('prenom-Employe-Modif').value = Personne.prenom || '';
    document.getElementById('sexe-Employe-Modif').value = Personne.sexe || '';
    document.getElementById('email-Employe-Modif').value = Personne.email || '';
    document.getElementById('telephone-Employe-Modif').value = Personne.telephone || '';
    document.getElementById('adresse-Employe-Modif').value = Personne.adresse || '';
    document.getElementById('role-Employe-Modif').value = Personne.role || '';
    document.getElementById('dateNaissance-Employe-Modif').value = Personne.dateNaissance ? new Date(Personne.dateNaissance).toISOString().split('T')[0] : '';
    document.getElementById('numeroCarteIdentite-Employe-Modif').value = Personne.numeroCarteIdentite || '';
    document.getElementById('typeContrat-Employe-Modif').value = Personne.typeContrat || '';
    document.getElementById('dateEmbauche-Employe-Modif').value = Personne.dateEmbauche ? new Date(Personne.dateEmbauche).toISOString().split('T')[0] : '';
    document.getElementById('salaire-Employe-Modif').value = Personne.salaire || '';
    document.getElementById('poste-Employe-Modif').value = Personne.poste || '';
    document.getElementById('departement-Employe-Modif').value = Personne.departement || '';
    document.getElementById('statut-Employe-Modif').value = Personne.statut || 'Actif';
    document.getElementById('grade-Employe-Modif').value = Personne.grade || 'Non autorise';
    document.getElementById('notes-Employe-Modif').value = Personne.notes || '';

   // Gestion de la photo
   const photoContainer = document.getElementById('photo-Employe-Modif').parentNode;
   const photoPreview = document.createElement('div');
   photoPreview.id = 'photo-preview';
   
   if (Personne.photo) {
       photoPreview.innerHTML = `
           <p>Photo actuelle :</p>
           <img src="${getImageUrl(Personne.photo)}" alt="Photo actuelle" 
                style="max-width: 100px; max-height: 100px; display: block; margin-bottom: 10px;">
           <label>
               <input type="checkbox" id="supprimer-photo"> Supprimer la photo actuelle
           </label>
       `;
   }else {
       photoPreview.innerHTML = '<p>Aucune photo actuelle</p>';
   }
   photoContainer.insertBefore(photoPreview, document.getElementById('photo-Employe-Modif'));
   openModal(modalActu, 'formeModifierEmploye');
}




document.getElementById('personnelForm-Modif').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('idEmploye').value;
    const photoInput = document.getElementById('photo-Employe-Modif');
    const supprimerPhotoCheckbox = document.getElementById('supprimer-photo');
    let photoPath = null;

    // Cas 1: Suppression de la photo actuelle
    if (supprimerPhotoCheckbox && supprimerPhotoCheckbox.checked) {
        photoPath = ''; // Chaîne vide pour indiquer la suppression
    } 
    // Cas 2: Nouvelle photo fournie
    else if (photoInput.files.length > 0) {
        photoPath = await sauvegarderImage('photoProfile', photoInput.files[0]);
        if (!photoPath) {
            alert('Erreur lors de la sauvegarde de la nouvelle photo');
            return;
        }
    }
    // Cas 3: Conservation de l'ancienne photo
    else {
        const currentPhotoPreview = document.getElementById('photo-preview').querySelector('img');
        if (currentPhotoPreview) {
            photoPath = extractRelativePath(currentPhotoPreview.src);
        }
    }

    // Préparer les données
    const formData = {
        nom: document.getElementById('nom-Employe-Modif').value.trim(),
        prenom: document.getElementById('prenom-Employe-Modif').value.trim(),
        sexe: document.getElementById('sexe-Employe-Modif').value,
        email: document.getElementById('email-Employe-Modif').value.trim(),
        telephone: document.getElementById('telephone-Employe-Modif').value.trim(),
        adresse: document.getElementById('adresse-Employe-Modif').value.trim(),
        role: document.getElementById('role-Employe-Modif').value,
        dateNaissance: document.getElementById('dateNaissance-Employe-Modif').value || null,
        numeroCarteIdentite: document.getElementById('numeroCarteIdentite-Employe-Modif').value.trim() || null,
        typeContrat: document.getElementById('typeContrat-Employe-Modif').value || null,
        dateEmbauche: document.getElementById('dateEmbauche-Employe-Modif').value || null,
        salaire: document.getElementById('salaire-Employe-Modif').value ? parseFloat(document.getElementById('salaire-Employe-Modif').value) : null,
        poste: document.getElementById('poste-Employe-Modif').value.trim() || null,
        departement: document.getElementById('departement-Employe-Modif').value.trim() || null,
        statut: document.getElementById('statut-Employe-Modif').value,
        grade: document.getElementById('grade-Employe-Modif').value,
        notes: document.getElementById('notes-Employe-Modif').value.trim() || null
    };

    // Conserver l'ancienne photo si aucune nouvelle n'est fournie
    if (!photoPath) {
        const currentPhotoPreview = document.getElementById('photo-preview').querySelector('img');
        if (currentPhotoPreview) {
            // Extraire le chemin de l'URL de l'image
            const imgSrc = currentPhotoPreview.src;
            const baseUrl = window.location.origin;
            photoPath = imgSrc.replace(baseUrl, '');
        }
    }
    
    if (photoPath) {
        formData.photo = photoPath;
    }

    try {
        const response = await fetch(`/personnele/modifier/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Employé mis à jour avec succès!');
            closeModal(modalActu);
            loadPersonnelList();
        } else {
            throw new Error(result.message || 'Erreur lors de la mise à jour');
        }
    } catch (error) {
        console.error('Erreur modification employé:', error);
        alert('Erreur: ' + error.message);
    }
});



// Fonction pour extraire le chemin relatif depuis une URL complète
function extractRelativePath(fullUrl) {
    try {
        const url = new URL(fullUrl);
        return url.pathname;
    } catch {
        // Si ce n'est pas une URL absolue, retourner tel quel
        return fullUrl;
    }
}