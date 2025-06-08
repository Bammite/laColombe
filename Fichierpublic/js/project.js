const progressBar = document.querySelector('.progress');
const progressText = document.querySelector('.progress-text');
let membres=[];

// Exemple : Mettre à jour la progression
function updateProgress(percentage) {
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
}

// Sélection des éléments HTML où les données seront affichées
const projectTitle = document.querySelector('.title');
const projectDescription = document.querySelector('.description p');
const projectCaracteristiques = document.querySelector('.caracteristiques ul');
const projectProgression = document.querySelector('.progress');
const projectProgressText = document.querySelector('.progress-text');
const tacheList = document.getElementById('taches');
const participantList = document.querySelector('.ListeParticipant');
const selectMb = document.getElementById('listeMbr');
const projectId = getProjectIdFromURL(); // Récupère l'ID du projet depuis l'URL
const contextMenu = document.getElementById('contextMenu');
let currentParticipantId = null; // ID du participant actuellement sélectionné

// Fonction pour récupérer l'ID du projet depuis l'URL
function getProjectIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id'); // Récupère la valeur du paramètre "id"
}

// Fonction pour récupérer les données du projet depuis l'API
async function fetchProject(projectId) {
    try {
        const response = await fetch(`/api/projets/${projectId}`);
        const result = await response.json();

        if (response.ok) {
            displayProject(result.projet);
            afficherProgressionTaches(projectId);
        } else {
            console.error('Erreur lors de la récupération du projet :', result.message);
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du projet :', error);
        alert('Une erreur est survenue lors de la récupération du projet.');
    }
};

// Fonction pour récupérer les membre
async function fetchMembre() {
    try {
        const response = await fetch(`http://localhost:3000/Personnels`);
        const result = await response.json();

        if (response.ok) {
            if (result.personnels.length > 0) {
                console.log(result.personnels)
                membres=result.personnels;
                displayNomMembre(result.personnels);

            }
        } else {
            console.error('Erreur lors de la récupération du projet :', result.message);
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du projet :', error);
        alert('Une erreur est survenue lors de la récupération du projet.');
    }
}

// Fonction pour afficher les données du projet
function displayProject(projet) {
    // Titre du projet
    projectTitle.textContent = projet.partenaire;

    // Description du projet
    projectDescription.textContent = projet.description;

    // Caractéristiques du projet
    projectCaracteristiques.innerHTML = `
        <li><strong>Type de projet :</strong> ${projet.type}</li>
        <li><strong>Pertinence :</strong> ${projet.priorité}</li>
        <li><strong>Budget alloué :</strong> ${projet.budget} FCFA</li>
        <li><strong>Date d'échéance :</strong> ${new Date(projet.dateEcheance).toLocaleDateString()}</li>
        <li><strong>Partenaire :</strong> ${projet.partenaire}</li>
    `;

    // Progression du projet
    const progressionPourcentage = projet.Pourcentage || 0;
    projectProgression.style.width = `${progressionPourcentage}%`;
    projectProgressText.textContent = `${progressionPourcentage}%`;

    // Liste des tâches
    displayTaches(projet.Taches);

    // Liste des participants
    displayParticipants(projet.idParticipantsPersonnel);
}

// Fonction pour afficher les tâches
function displayTaches(taches) {
    tacheList.innerHTML=``;
    tacheList.innerHTML=`<h3>Liste des activités a faire</h3>
                <div class="lineProjet entete">
                    <span>
                        <div class="colonne c1">Tâche</div>
                        <div class="colonne c2">Responsable</div>
                        <div class="colonne c3">Deadline</div>
                    </span>
                    <div class="colonne statuts">Statut</div>
                </div>`;
    taches.forEach((tache) => {
        const tacheItem = document.createElement('div');
        tacheItem.classList.add('lineProjet', 'line');
        if(tache.statut === 'En attente'){
            tacheItem.innerHTML = `
                <span>
                    <div class="colonne c1">${tache.titre}</div>
                    <div class="colonne c2">${tache.assignéA || 'Non assigné'}</div>
                    <div class="colonne c3"> ${tache.dateEcheance?'avant:'+new Date(tache.dateEcheance).toLocaleDateString(): 'Aucune Date'}</div>
                </span>
                <div class="colonne statuts" onclick="updateStatutTache('${tache._id}', '${tache.statut==='En attente'?'Terminé':'Suprrimer'}')">${tache.statut=== 'En attente'? 'Fait' : 'Supprimer'}</div>
            `;
            tacheList.appendChild(tacheItem);
        }
    });

    taches.forEach((tache) => {
        const tacheItem = document.createElement('div');
        tacheItem.classList.add('lineProjet', 'line');
        if(tache.statut === 'Terminé'){
            tacheItem.classList.add('fait');
            
            tacheItem.innerHTML = `
                <span>
                    <div class="colonne c1">${tache.titre}</div>
                    <div class="colonne c2">${tache.assignéA || 'Non assigné'}</div>
                    <div class="colonne c3"> ${tache.dateEcheance?'avant:'+new Date(tache.dateEcheance).toLocaleDateString(): 'Aucune Date'}</div>
                </span>
                <div class="colonne statuts" onclick="updateStatutTache('${tache._id}', '${tache.statut==='En attente'?'Terminé':'Suprrimer'}')">${tache.statut=== 'En attente'? 'Fait' : 'Supprimer'}</div>
            `;
            tacheList.appendChild(tacheItem);
        }
        
    });
}


function displayNomMembre(membres) {
    selectMb.innerHTML = '';
    // const first=document.createElement('option');
    // first.innerHTML='selectionnez un membres';
    // selectMb.appendChild(first);
    membres.forEach((mbr) =>{
        const option =document.createElement('option')
        option.value=mbr._id
        option.innerHTML=mbr.nom;
        selectMb.appendChild(option);
    });
}



// Gestion de l'ajout d'une tâche
const tacheForm = document.getElementById('tacheForm');
tacheForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titre = document.getElementById('titreTache').value;
    const description = document.getElementById('descriptionTache').value;
    const assignéA = document.getElementById('assignéA').value;
    const dateEcheance = document.getElementById('dateEcheance').value;

    try {
        const response = await fetch(`http://localhost:3000/api/projets/${projectId}/taches`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titre, description, assignéA, dateEcheance })
        });

        const result = await response.json();
        if (response.ok) {
            alert('Tâche ajoutée avec succès !');
            tacheForm.reset();
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la tâche :', error);
    }
});

// Gestion de l'ajout d'une dépense
const depenseForm = document.getElementById('depenseForm');
depenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const categorie = document.getElementById('categorieDepense').value;
    const description = document.getElementById('descriptionDepense').value;
    const montant = document.getElementById('montantDepense').value;
    const date = document.getElementById('dateDepense').value;
    const fournisseur = document.getElementById('fournisseurDepense').value;
    const modePaiement = document.getElementById('modePaiementDepense').value;

    try {
        const response = await fetch(`http://localhost:3000/api/projets/${projectId}/depenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categorie, description, montant, date, fournisseur, modePaiement })
        });

        const result = await response.json();
        if (response.ok) {
            alert('Dépense ajoutée avec succès !');
            depenseForm.reset();
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la dépense :', error);
    }
});

// Gestion de l'ajout d'un membre
const membreForm = document.getElementById('membreForm');
membreForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const membreId = document.getElementById('listeMbr').value;

    try {
        const response = await fetch(`/api/projets/${projectId}/membres`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ membreId })
        });

        const result = await response.json();
        if (response.ok) {
            alert('Membre ajouté avec succès !');
            membreForm.reset();
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout du membre :', error);
    }
})

// Fonction pour mettre à jour le statut d'une tâche
async function updateStatutTache(idTache, nouveauStatut) {
    try {
        if (nouveauStatut == 'Supprimer') {
            const response = await fetch(`'/api/projets/${projectId}/taches/${idTache}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            
            });
    
            const result = await response.json();
    
            if (response.ok) {
                alert('Statut de la tâche supprimé avec succès !');
                // Rechargez les tâches ou mettez à jour l'interface utilisateur si nécessaire
                if (projectId) {
                    afficherProgressionTaches(projectId);
                }
                fetchProject(getProjectIdFromURL()); // Recharge les données du projet
            } else {
                alert('Erreur : ' + result.message);
            }
        }
        if(nouveauStatut == 'Terminé') {

            const response = await fetch(`/api/taches/${idTache}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statut: nouveauStatut }) // Envoi du nouveau statut
            });
    
            const result = await response.json();
    
            if (response.ok) {
                alert('Statut de la tâche mis à jour avec succès !');
                // Rechargez les tâches ou mettez à jour l'interface utilisateur si nécessaire
                if (projectId) {
                    afficherProgressionTaches(projectId);
                }
                fetchProject(getProjectIdFromURL()); // Recharge les données du projet
            } else {
                alert('Erreur : ' + result.message);
            }
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de la tâche :', error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Charger les données du projet au chargement de la page
   
    if (projectId) {
        console.log(projectId);
        fetchProject(projectId); // Charge les données du projet
        fetchMembre()
    } else { 
        alert('Aucun ID de projet fourni dans l\'URL.');
    }





});

// Fonction pour récupérer et afficher la progression des tâches
async function afficherProgressionTaches(projectId) {
    try {
        const response = await fetch(`http://localhost:3000/api/projets/${projectId}/taches/progression`);
        const result = await response.json();

        if (response.ok) {
            const progression = result.progression;
            const totalTaches = result.totalTaches;
            const tachesTerminees = result.tachesTerminees;

            // Afficher la progression dans la console ou dans l'interface utilisateur
            console.log(`Progression : ${progression}% (${tachesTerminees}/${totalTaches} tâches terminées)`);

            // Mettre à jour l'interface utilisateur
            const progressBar = document.querySelector('.progress');
            const progressText = document.querySelector('.progress-text');

            if (progressBar && progressText) {
                progressBar.style.width = `${progression}%`;
                progressText.textContent = `${progression}%`;
            }
        } else {
            console.error('Erreur :', result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de la progression des tâches :', error);
    }
}
if (projectId) {
    afficherProgressionTaches(projectId);
}


////////////////////////////Option Participant//////////////////


    const participantContainer = document.querySelector(".ListeParticipant");

    // Fonction pour générer le HTML d'un participant avec les options
    const generateParticipantHTML = (participant) => {
        return `
            <div class="participant">
                <div class="info">
                    <img src="./asset/image/avatar2.jpeg" alt="">
                    <div class="n-r">
                        <div class="nom">${participant.nom}</div>
                        <div class="role">${participant.role || "Membre"}</div>
                    </div>
                </div>
                <div class="optionMsg">
                    <button class="menu-opt">...</button>
                    <div class="menu-options">
                        <button class="menu-option" onclick="removeParticipantFromProject('${participant._id}')">Supprimer du projet</button>
                        <button class="menu-option" onclick="showCollaboratorInfo('${participant._id}')">Info du collaborateur</button>
                        <button class="menu-option" onclick="showTasksCompleted('${participant._id}')">Tâches réalisées</button>
                    </div>
                </div>
            </div>
        `;
    };

    // Fonction pour afficher les participants
    function displayParticipants(participants) {
        participantContainer.innerHTML = ""; // Réinitialise la liste des participants

        participants.forEach((participant) => {
            participantContainer.innerHTML += generateParticipantHTML(participant);
        });

        // Ajouter les événements pour afficher/masquer les menus
        document.querySelectorAll(".menu-opt").forEach((button) => {
            button.addEventListener("click", (e) => {
                const menu = e.target.nextElementSibling;
                menu.style.display = menu.style.display === "block" ? "none" : "block";
            });
        });

        // Fermer les menus si on clique ailleurs
        document.addEventListener("click", (e) => {
            if (!e.target.matches(".menu-opt")) {
                document.querySelectorAll(".menu-options").forEach((menu) => {
                    menu.style.display = "none";
                });
            }
        });
    }

    // Fonction pour supprimer un participant du projet
    async function removeParticipantFromProject(participantId) {
        try {
            const response = await fetch(`/api/projets/${projectId}/membres/${participantId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            const result = await response.json();
            if (response.ok) {
                alert("Participant supprimé avec succès !");
                fetchProject(projectId); // Recharge les données du projet
            } else {
                alert("Erreur : " + result.message);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du participant :", error);
        }
    }

    // Fonction pour afficher les informations du collaborateur
    async function showCollaboratorInfo(participantId) {
        try {
            const response = await fetch(`/api/membres/${participantId}`);
            const result = await response.json();

            if (response.ok) {
                alert(`Nom : ${result.membre.nom}\nEmail : ${result.membre.email}\nTéléphone : ${result.membre.telephone}`);
            } else {
                alert("Erreur : " + result.message);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des informations du collaborateur :", error);
        }
    }

    // Fonction pour afficher les tâches réalisées par le collaborateur
    async function showTasksCompleted(participantId) {
        try {
            const response = await fetch(`/api/membres/${participantId}/taches`);
            const result = await response.json();

            if (response.ok) {
                const tasks = result.taches;
                if (tasks.length > 0) {
                    const taskList = tasks.map((task) => `- ${task.titre}`).join("\n");
                    alert(`Tâches réalisées :\n${taskList}`);
                } else {
                    alert("Aucune tâche réalisée par ce collaborateur.");
                }
            } else {
                alert("Erreur : " + result.message);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des tâches réalisées :", error);
        }
    }

    // Charger les participants au chargement de la page
    if (projectId) {
        fetchProject(projectId); // Charge les données du projet
    } else {
        alert("Aucun ID de projet fourni dans l'URL.");
    }


  