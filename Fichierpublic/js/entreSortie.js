document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('precedenteOperation'); // Sélectionnez le conteneur où les cadres seront ajoutés

    
    try {
        // Récupérer la liste des devis depuis le backend
        const response = await fetch('http://localhost:3000/api/devis');
        const result = await response.json();

        if (response.ok) {
            const devisList = result.devis;

            // Générer un cadre pour chaque devis
            devisList.forEach(devis => {
                const cadre = document.createElement('div');
                cadre.classList.add('cadre');

                cadre.innerHTML = `
                    <div class="cadre_content">
                        <a href="./devis.html?id=${devis._id}" class="devis">
                            <div class="titreCarte">
                                <span>${devis.titre}</span>
                                <br>
                                <span>${new Date(devis.dateCreation).toLocaleDateString()}</span>
                            </div>
                        </a>
                    </div>
                `;

                container.appendChild(cadre);
            });
        } else {
            console.log('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des devis :', error);
        console.log('Une erreur est survenue lors du chargement des devis.');
    }


    async function fetchTransactions() {
        try {
            const [ventes, depenses, fichesPaie] = await Promise.all([
                fetch('http://localhost:3000/api/ventes').then(r => r.json()),
                fetch('http://localhost:3000/api/depenses').then(r => r.json()),
                fetch('http://localhost:3000/api/fichesDePaie').then(r => r.json())
            ]);

            // Pour chaque fiche de paie, récupérer les infos de l'employé
            const fichesWithDetails = await Promise.all(fichesPaie.map(async fiche => {
                const employeResponse = await fetch(`http://localhost:3000/api/personnel/${fiche.Idemploye}`);
                const employeData = await employeResponse.json();
                return {
                    ...fiche,
                    employeNom: employeData.success ? `${employeData.personnel.nom} ${employeData.personnel.prenom}` : 'Employé inconnu'
                };
            }));

            // Pour chaque dépense, récupérer les infos du projet
            const depensesWithDetails = await Promise.all(depenses.map(async depense => {
                if (depense.projetAssocie === 'aucun') {
                    return {
                        ...depense,
                        projetNom: 'Aucun projet'
                    };
                }
                const projetResponse = await fetch(`http://localhost:3000/api/projets/${depense.projetAssocie}`);
                const projetData = await projetResponse.json();
                return {
                    ...depense,
                    projetNom: projetData.success ? projetData.projet.titre : 'Projet inconnu'
                };
            }));

            // Combiner et trier toutes les transactions
            const allTransactions = [
                ...ventes.map(v => ({...v, type: 'vente'})),
                ...depensesWithDetails.map(d => ({...d, type: 'depense'})),
                ...fichesWithDetails.map(f => ({...f, type: 'paiement'}))
            ].sort((a, b) => new Date(b.date || b.datePaiement) - new Date(a.date || a.datePaiement));

            container.innerHTML += allTransactions.map(transaction => {
                const date = new Date(transaction.date || transaction.datePaiement).toLocaleDateString();
                let cardContent = '';

                switch(transaction.type) {
                    case 'vente':
                        cardContent = `
                            <div class="carte vente">
                                <div class="carte-header">
                                    <span class="type">Vente</span>
                                    <span class="date">${date}</span>
                                </div>
                                <div class="carte-body">
                                    <h3>Client: ${transaction.client}</h3>
                                    <p>Quantité: ${transaction.quantité}</p>
                                    <p>Paiement: ${transaction.paiement} FCFA</p>
                                    <p>Via: ${transaction.via}</p>
                                </div>
                                <div class="carte-footer">
                                    <span class="livraison">Mode: ${transaction.livraison}</span>
                                </div>
                            </div>`;
                        break;
                    case 'depense':
                        cardContent = `
                            <div class="carte depense">
                                <div class="carte-header">
                                    <span class="type">Dépense</span>
                                    <span class="date">${date}</span>
                                </div>
                                <div class="carte-body">
                                    <h3>${transaction.categorie}</h3>
                                    <p>${transaction.description}</p>
                                    <p class="montant">-${transaction.montant} FCFA</p>
                                    <p>Fournisseur: ${transaction.fournisseur}</p>
                                    <p>Projet: ${transaction.partenaire}</p>
                                </div>
                                <div class="carte-footer">
                                    <span class="mode">Via: ${transaction.modePaiement}</span>
                                </div>
                            </div>`;
                        break;
                    case 'paiement':
                        cardContent = `
                            <div class="carte paiement">
                                <div class="carte-header">
                                    <span class="type">Fiche de Paie</span>
                                    <span class="date">${date}</span>
                                </div>
                                <div class="carte-body">
                                    <h3>${transaction.typeDePaie}</h3>
                                    <p>Employé: ${transaction.employeNom}</p>
                                    <p>Période: ${new Date(transaction.DebutPeriode).toLocaleDateString()} - ${new Date(transaction.FinPeriode).toLocaleDateString()}</p>
                                </div>
                                <div class="carte-footer">
                                    <span class="mode">Via: ${transaction.modePaiement}</span>
                                </div>
                            </div>`;
                        break;
                }

                return cardContent;
            }).join('');

        } catch (error) {
            console.error('Erreur lors de la récupération des transactions:', error);
            container.innerHTML = '<p class="error">Une erreur est survenue lors du chargement des transactions.</p>';
        }
    }

    fetchTransactions();
});

///////////////// secion pour la gestion des projets

// Sélection de l'élément contenant les cadres des projets
const projectContainer = document.getElementById('projetContent');

// Fonction pour récupérer les projets depuis l'API
async function fetchProjects() {
    try {
        console.log('Chargement des projets...');
        const response = await fetch('http://localhost:3000/api/projets'); // Remplacez par l'URL de votre API
        const result = await response.json();

        if (response.ok) {
            console.log(result);
            displayProjects(result.projets);
        } else {
            console.error('Erreur lors de la récupération des projets :', result.message);
            console.log('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des projets :', error);
        console.log('Une erreur est survenue lors de la récupération des projets.');
    }
}

// Fonction pour afficher les projets dans des cadres
function displayProjects(projets) {
    // Réinitialise le conteneur des projets (garde le cadre pour "Créer un nouveau projet")
    projectContainer.innerHTML = `
        <div class="cadre">
            <a href="./newProjet.html" target="_blank" rel="noopener noreferrer">
                <div class="cadre_content addProjet">
                    <span>+</span>
                </div>
                <p>Créer un nouveau projet</p> 
            </a>
        </div>
    `;

    // Parcourt les projets et génère un cadre pour chacun
    projets.forEach((projet) => {
        const cadre = document.createElement('div');
        cadre.classList.add('cadre');
        cadre.innerHTML = `
            <div class="cadre_content">
                <a href="./projet.html?id=${projet._id}" class="paie" target="_blank" rel="noopener noreferrer">
                    <div class="titreCarte">
                        <span>${projet.partenaire}</span>
                        <br>
                        <span>${new Date(projet.dateEcheance).toLocaleDateString()}</span>
                    </div>
                </a>
            </div>
            <p>${projet.responsable}</p>
        `;
        projectContainer.appendChild(cadre);
    });
}

// Charger les projets au chargement de la page
fetchProjects();

const selectMbFichePaie = document.getElementById("idEmployé");

// Fonction pour récupérer les membre
async function fetchMembrePaie() {
    try {
        const response = await fetch(`http://localhost:3000/Personnels`);
        const result = await response.json();

        if (response.ok) {
            if (result.personnels.length > 0) {
                console.log(result.personnels)
                membres=result.personnels;
                membres.forEach((mbr) =>{
                    const option =document.createElement('option')
                    option.value=mbr._id
                    option.innerHTML=mbr.nom;
                    selectMbFichePaie.appendChild(option);
                });
            }
        } else {
            console.error('Erreur lors de la récupération du personnele :', result.message);
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du personnele :', error);
        alert('Une erreur est survenue lors de la récupération du personnele.');
    }
}

fetchMembrePaie();



////////////////// Code de recuperation de vente & depense & ficheDePaie