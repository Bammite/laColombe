const tacheList = document.getElementById('tacheList');
const formAddTache = document.getElementById('AddTache');
const newTacheInput = document.getElementById('NewTache');
const actualiteList = document.getElementById('actuBox_content'); 


// Fonction pour récupérer les tâches depuis l'API
async function fetchActu() {
    try {
        const response = await fetch('http://localhost:3000/actualites');
        const result = await response.json();
 
        if (response.ok) {
            console.log(result);
            displayActu(result.actualites);

        } else {
            console.error('Erreur lors de la récupération des actualité :', result.message);
            console.log('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des actu :', error);
        console.log('Une erreur est survenue lors de la récupération des actu.');
    }
}

// Fonction pour afficher les actualité
function displayActu(actuLst) {
    actualiteList.innerHTML = '';

    actuLst.forEach((actu) => {
        const actuItem = document.createElement('span');
        actuItem.classList.add('actu-item');
        actuItem.innerHTML = `
            ${actu.contenu}
            <div class="gestionTache" >
                <button class="btn-fermer">Fermer</button>
                <button class="btn-supprimer-actualité" data-id="${actu._id}">Supprimer</button>
            </div>
        `;

        // Gestion du clic sur l'actualité
        actuItem.addEventListener('click', function(e) {
            if (e.target.tagName !== 'BUTTON') {
                const gestionDiv = this.querySelector('.gestionTache');
                const allGestionDivs = document.querySelectorAll('.gestionTache');
                
                // Ferme tous les autres menus de gestion
                allGestionDivs.forEach(div => {
                    if (div !== gestionDiv) {
                        div.style.height = '0px';
                    }
                });
                
                // Bascule l'affichage du menu de gestion actuel
                gestionDiv.style.height = gestionDiv.style.height === '0px' ? '30px' : '0px';
            }
        });

        // Gestion du clic sur le bouton Fermer
        actuItem.querySelector('.btn-fermer').addEventListener('click', function(e) {
            e.stopPropagation();
            this.closest('.gestionTache').style.height = '0px';
        });

        // Gestion du clic sur le bouton Supprimer
        actuItem.querySelector('.btn-supprimer-actualité').addEventListener('click', async function(e) {
            e.stopPropagation();
            const actuId = this.dataset.id;
            
            if (confirm('Voulez-vous vraiment supprimer cette actualité ?')) {
                try {
                    const response = await fetch(`/actualites/${actuId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        actuItem.remove();
                    } else {
                        alert('Erreur lors de la suppression de l\'actualité');
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Erreur lors de la suppression');
                }
            }
        });

        actualiteList.appendChild(actuItem);
    });
}

fetchActu();

// Fonction pour récupérer les tâches depuis l'API
async function fetchTaches() {
    try {
        const response = await fetch('http://localhost:3000/api/taches');
        const result = await response.json();
 
        if (response.ok) {
            // Filtrer les tâches pour ne pas afficher celles marquées comme "supprimées"
            const tachesActives = result.taches.filter(tache => tache.statut !== 'Supprimée');
            displayTaches(tachesActives);
        } else {
            console.error('Erreur lors de la récupération des tâches :', result.message);
            console.log('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des tâches :', error);
        console.log('Une erreur est survenue lors de la récupération des tâches.');
    }
}

// Fonction pour afficher les tâches dans la liste
function displayTaches(taches) {
    tacheList.innerHTML = ''; // Réinitialise la liste des tâches

    taches.forEach((tache) => {
        const tacheItem = document.createElement('div');
        tacheItem.classList.add('tacheItem');
        tacheItem.innerHTML = `
            <input type="checkbox" class="custom-checkbox" data-id="${tache._id}" ${tache.statut === 'Terminé' ? 'checked' : ''}>
            <label>${tache.titre}</label>
        `;
        tacheList.appendChild(tacheItem);
    });
}



// Gestion du changement de statut d'une tâche (y compris suppression)
tacheList.addEventListener('change', async (event) => {
    if (event.target.classList.contains('custom-checkbox')) {
        const tacheId = event.target.dataset.id;
        const statut = event.target.checked ? 'Terminé' : 'En attente';

        try {
            const response = await fetch(`http://localhost:3000/api/taches/${tacheId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ statut })
            });

            const result = await response.json();
            if (response.ok) {
                alert('Tâche mise à jour avec succès !');
                
            } else {
                alert('Erreur : ' + result.message);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la tâche :', error);
            alert('Une erreur est survenue.');
        }
    }
});

// Charger les tâches au chargement de la page
fetchTaches();

//////////////////////////////// add tache//////////////////////////////

const openSectionAddTache = document.getElementById("ouvFrmTache");
const formAddTacheElement = document.getElementById("AddTacheForm");

openSectionAddTache.addEventListener('click', function(){
    let ht = formAddTacheElement.style.height;
    if(ht === '50px'){
        openSectionAddTache.innerHTML = 'Ajouter';
        formAddTacheElement.style.height = '0px';
    } else {
        openSectionAddTache.innerHTML = 'Fermer';
        formAddTacheElement.style.height = '50px';
    }
});

document.getElementById('AddTache').addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    const titre = document.getElementById('NewTache').value.trim();

    // Vérification que le champ n'est pas vide
    if (!titre) {
        alert('Veuillez entrer une tâche.');
        return;
    }

    const tacheData = {
        titre: titre,
        description: 'Tâche personnelle', // Description par défaut
        statut: 'En attente', // Statut par défaut
        assignéA: 'Utilisateur actuel' // Remplacez par l'utilisateur connecté si nécessaire
    };

    try {
        const response = await fetch('http://localhost:3000/api/taches', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tacheData)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Tâche ajoutée avec succès !');
            document.getElementById('NewTache').value = ''; // Réinitialise le champ
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la tâche :', error);
        alert('Une erreur est survenue.');
    }
});

async function utilisateur() {

    try {
        // Récupérer les articles depuis le backend
        const response = await fetch('/api/user');
        const result = await response.json();

        if (response.ok) {
            if (!['Elementaire', 'Superieur', 'Absolut'].includes(result.user.grade)) {
                window.location.href = "index.html";
            }
            else{
                document.getElementById('profileUser').src=getImageUrl(result.user.photo);
                document.getElementById('Salutation').innerHTML=`Salut, ${result.user.prenom} !`;
            }

        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du user :', error);
        alert('Une erreur est survenue lors de la recuperation du user.');
    }
    // 
}

utilisateur();