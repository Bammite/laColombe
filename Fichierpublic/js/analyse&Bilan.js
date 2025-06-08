// donnée projet

const DonneTextProjet =document.getElementById('DetailProjet');



async function fetchProjetsAnalyse(params) {
    try {
        console.log('Chargement des projets...');
        const response = await fetch('http://localhost:3000/api/projets'); // Remplacez par l'URL de votre API
        const result = await response.json();

        if (response.ok) {
            console.log(result);
            displayProjectsData(result.projets);
        } else {
            console.error('Erreur lors de la récupération des projets :', result.message);
            console.log('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des projets :', error);
        console.log('Une erreur est survenue lors de la récupération des projets.');
    }
}


function displayProjectsData(projets) {
    //le nombre totale de projet
    let total= projets.length;
    //le nombre de projet avec pour valeur de statut='Terminé'
    let completedProjects = projets.filter(projet => projet.statut === 'Terminé' || projet.statut == 'Annulé').length;
    console.log(`Nombre de projets terminés : ${completedProjects}`);
    DonneTextProjet.innerHTML=``;
    DonneTextProjet.innerHTML+=`
        <span class="infoAna">Nombres de Projet: <span class="chiffre1">${total}</span></span>
        <span class="infoAna">Projet déjà traité: <span class="chiffre2">${completedProjects}</span></span>
        <span class="infoAna">Projet restant: <span class="chiffre3">${total-completedProjects}</span></span>
        <button onclick="openSection('Facture')">Details</button>
        `
}


fetchProjetsAnalyse();







// Exemple de tableau des revenus
let revenue = [
    // {
    //     "nom": "vente de meuble",
    //     "somme": 10000,
    //     "date": "10/04/2025"
    // },
   
];

let depenses = [
    // {
    //     "id": "d7c8d9e0",
    //     "categorie": "Logiciels",
    //     "description": "Achat de logiciels de gestion de projet et de conception 3D",
    //     "montant": 6000,
    //     "date": "02/03/2025",
    //     "fournisseur": "Logiciels Pro",
    //     "modePaiement": "Carte bancaire",
    //     "projetAssocie": "Gestion des projets de construction"
    // },
    
];

// Fonction pour organiser les dépenses par période
function organiserDepensesParPeriode(depenses) {
    const maintenant = new Date();
    const donnees = {
        aujourdhui: {
            labels: ['8h', '10h', '12h', '14h', '16h', '18h', '20h'],
            data: new Array(7).fill(0)
        },
        semaine: {
            labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
            data: new Array(7).fill(0)
        },
        mois: {
            labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
            data: new Array(4).fill(0)
        },
        annee: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
            data: new Array(12).fill(0)
        }
    };

    depenses.forEach(depense => {
        const dateDepense = new Date(depense.date.split('/').reverse().join('-'));
        const montant = depense.montant;

        // Pour aujourd'hui
        if (dateDepense.toDateString() === maintenant.toDateString()) {
            const heure = dateDepense.getHours();
            const index = Math.floor((heure - 8) / 2); // De 8h à 20h, par tranches de 2h
            if (index >= 0 && index < 7) {
                donnees.aujourdhui.data[index] += montant;
            }
        }

        // Pour la semaine (ajusté pour commencer le lundi)
        const debutSemaine = new Date(maintenant);
        const jour = maintenant.getDay() === 0 ? 6 : maintenant.getDay() - 1; // Ajuste pour lundi
        debutSemaine.setDate(maintenant.getDate() - jour);
        debutSemaine.setHours(0, 0, 0, 0);
        if (dateDepense >= debutSemaine) {
            const jourSemaine = (dateDepense.getDay() === 0 ? 6 : dateDepense.getDay() - 1); // Ajuste pour lundi
            donnees.semaine.data[jourSemaine] += montant;
        }

        // Pour le mois
        const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
        if (dateDepense >= debutMois) {
            const semaine = Math.floor((dateDepense.getDate() - 1) / 7);
            if (semaine < 4) {
                donnees.mois.data[semaine] += montant;
            }
        }

        // Pour l'année
        if (dateDepense.getFullYear() === maintenant.getFullYear()) {
            const mois = dateDepense.getMonth();
            donnees.annee.data[mois] += montant;
        }
    });

    return donnees;
}

// Fonction pour organiser les revenus par période (similaire aux dépenses)
function organiserRevenusParPeriode(revenue) {
    const maintenant = new Date();
    const donnees = {
        aujourdhui: new Array(7).fill(0),
        semaine: new Array(7).fill(0),
        mois: new Array(4).fill(0),
        annee: new Array(12).fill(0)
    };

    revenue.forEach(revenu => {
        const dateRevenu = new Date(revenu.date.split('/').reverse().join('-'));
        const somme = revenu.somme;

        // Pour aujourd'hui
        if (dateRevenu.toDateString() === maintenant.toDateString()) {
            const heure = dateRevenu.getHours();
            const index = Math.floor((heure - 8) / 2); // De 8h à 20h, par tranches de 2h
            if (index >= 0 && index < 7) {
                donnees.aujourdhui[index] += somme;
            }
        }

        // Pour la semaine
        const debutSemaine = new Date(maintenant);
        const jour = maintenant.getDay() === 0 ? 6 : maintenant.getDay() - 1; // Ajuste pour lundi
        debutSemaine.setDate(maintenant.getDate() - jour);
        debutSemaine.setHours(0, 0, 0, 0);
        if (dateRevenu >= debutSemaine) {
            const jourSemaine = (dateRevenu.getDay() === 0 ? 6 : dateRevenu.getDay() - 1); // Ajuste pour lundi
            donnees.semaine[jourSemaine] += somme;
        }

        // Pour le mois
        const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
        if (dateRevenu >= debutMois) {
            const semaine = Math.floor((dateRevenu.getDate() - 1) / 7);
            if (semaine < 4) {
                donnees.mois[semaine] += somme;
            }
        }

        // Pour l'année
        if (dateRevenu.getFullYear() === maintenant.getFullYear()) {
            const mois = dateRevenu.getMonth();
            donnees.annee[mois] += somme;
        }
    });

    return donnees;
}

// Fonction pour filtrer les dépenses par période
function filtrerDepensesParPeriode(depenses, periode) {
    const maintenant = new Date();
    const debutPeriode = new Date();

    switch (periode) {
        case '0': // Aujourd'hui
            debutPeriode.setHours(0, 0, 0, 0);
            break;
        case '1': // Cette semaine
            const jour = maintenant.getDay() === 0 ? 6 : maintenant.getDay() - 1; // Ajuste pour lundi
            debutPeriode.setDate(maintenant.getDate() - jour);
            debutPeriode.setHours(0, 0, 0, 0);
            break;
        case '2': // Ce mois
            debutPeriode.setDate(1);
            debutPeriode.setHours(0, 0, 0, 0);
            break;
        case '3': // Cette année
            debutPeriode.setMonth(0, 1);
            debutPeriode.setHours(0, 0, 0, 0);
            break;
        default: // Tout
            return depenses;
    }

    return depenses.filter(depense => {
        const dateDepense = new Date(depense.date.split('/').reverse().join('-'));
        return dateDepense >= debutPeriode && dateDepense <= maintenant;
    });
}

// Création du graphique en ligne avec les données des dépenses et des revenus
const lineChart = new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
        labels: [], // Les labels seront mis à jour dynamiquement
        datasets: [
            {
                label: 'Évolution des dépenses (FCFA)',
                data: [],
                borderColor: 'rgb(192, 75, 75)', // Rouge pour les dépenses
                tension: 0.3,
                fill: false,
                borderWidth: 2,
                pointRadius: 5,
                pointBackgroundColor: 'rgb(192, 75, 75)'
            },
            {
                label: 'Évolution des revenus (FCFA)',
                data: [],
                borderColor: 'rgb(75, 192, 192)', // Bleu (ou vert) pour les revenus
                tension: 0.3,
                fill: false,
                borderWidth: 2,
                pointRadius: 5,
                pointBackgroundColor: 'rgb(75, 192, 192)'
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 0,
                    minRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 10,
                    font: {
                        size: (context) => {
                            const screenWidth = window.innerWidth;
                            if (screenWidth < 600) {
                                return 8;
                            } else if (screenWidth < 900) {
                                return 10;
                            } else {
                                return 12;
                            }
                        }
                    }
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString() + ' FCFA';
                    },
                    font: {
                        size: (context) => {
                            const screenWidth = window.innerWidth;
                            if (screenWidth < 600) {
                                return 8;
                            } else if (screenWidth < 900) {
                                return 10;
                            } else {
                                return 12;
                            }
                        }
                    }
                }
            }
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: (context) => {
                            const screenWidth = window.innerWidth;
                            if (screenWidth < 600) {
                                return 10;
                            } else if (screenWidth < 900) {
                                return 12;
                            } else {
                                return 14;
                            }
                        }
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return context.raw.toLocaleString() + ' FCFA';
                    }
                }
            }
        }
    }
});

// Fonction pour mettre à jour le graphique avec les dépenses et les revenus
function mettreAJourGraphique(depensesFiltrees, revenusFiltres) {
    // Fusionner les dates des dépenses et des revenus
    const toutesLesDates = [
        ...new Set([
            ...depensesFiltrees.map(d => d.date),
            ...revenusFiltres.map(r => r.date)
        ])
    ].sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')));

    // Préparer les données pour les dépenses
    const dataDepenses = toutesLesDates.map(date => {
        const depense = depensesFiltrees.find(d => d.date === date);
        return depense ? depense.montant : 0;
    });

    // Préparer les données pour les revenus
    const dataRevenus = toutesLesDates.map(date => {
        const revenu = revenusFiltres.find(r => r.date === date);
        return revenu ? revenu.somme : 0;
    });

    // Mettre à jour le graphique
    lineChart.data.labels = toutesLesDates;
    lineChart.data.datasets[0].data = dataDepenses;
    lineChart.data.datasets[1].data = dataRevenus;
    lineChart.update();
}

// Écouteur d'événement pour le select
const selectDate = document.querySelector('.selectDate');
if (selectDate) {
    selectDate.addEventListener('change', function (e) {
        const depensesFiltrees = filtrerDepensesParPeriode(depenses, e.target.value);
        const revenusFiltres = filtrerDepensesParPeriode(revenue, e.target.value); // Même logique pour les revenus
        mettreAJourGraphique(depensesFiltrees, revenusFiltres);
    });
}

// Initialisation avec toutes les données
if (typeof depenses !== 'undefined' && depenses.length > 0) {
    const revenusFiltres = revenue; // Tous les revenus au départ
    mettreAJourGraphique(depenses, revenusFiltres);
} else {
    console.warn('Aucune dépense ou revenu disponible.');
}

// Fonction pour trier les transactions par date
function trierParDate(transactions) {
    return transactions.sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateA - dateB;
    });
}

// Fonction pour générer dynamiquement les transactions
function genererTransactions() {
    const listeTrfq = document.querySelector('.ListeTrfq');
    if (!listeTrfq) return;
    
    listeTrfq.innerHTML = ''; // Vider le conteneur

    const toutesLesTransactions = [
        ...(Array.isArray(revenue) ? revenue : []).map(r => ({ ...r, type: 'revenue' })),
        ...(Array.isArray(depenses) ? depenses : []).map(d => ({ ...d, type: 'depense' }))
    ];

    const transactionsTriees = trierParDate(toutesLesTransactions);

    transactionsTriees.forEach(transaction => {
        if (!transaction) return;

        const transactionElement = document.createElement('div');
        transactionElement.classList.add('trfq', transaction.type);

        if (transaction.type === 'revenue' && transaction.somme != null) {
            transactionElement.innerHTML = `
                <span>+${transaction.somme?.toLocaleString() || '0'} FCFA</span>
                <span>(${transaction.nom || 'Sans nom'})</span>
            `;
        } else if (transaction.type === 'depense' && transaction.montant != null) {
            transactionElement.innerHTML = `
                <span>-${transaction.montant?.toLocaleString() || '0'} FCFA</span>
                <span>(${transaction.categorie || 'Non catégorisé'})</span>
            `;
        }

        listeTrfq.appendChild(transactionElement);
    });
}

// Appeler la fonction pour générer les transactions au chargement de la page
document.addEventListener('DOMContentLoaded', genererTransactions);

/////////////////////categorie vendu 
// Type de graphique, autre ex: 'line', 'pie', 'doughnut', 'polarArea'.
// Creaion de graphe 
const barCanvas = document.getElementById('barCanvas');
const barChart = new Chart(barCanvas, {
    type: 'bar',
    data: {
        labels: [], // Sera rempli dynamiquement
        datasets: [{
            label: 'Ventes par catégorie (FCFA)',
            data: [], // Sera rempli dynamiquement
            backgroundColor: [], // Sera rempli dynamiquement
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                align: 'start',
                labels: {
                    color: 'black',
                    font: {
                        size: function() {
                            const screenWidth = window.innerWidth;
                            return screenWidth < 600 ? 10 : screenWidth < 900 ? 12 : 14;
                        }()
                    },
                    padding: 20,
                    boxWidth: 20,
                    boxHeight: 20
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.raw.toLocaleString()} FCFA`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 0, // Empêcher la rotation des labels
                    minRotation: 0,
                    color: 'black',
                    font: {
                        size: function() {
                            const screenWidth = window.innerWidth;
                            if (screenWidth < 600) {
                                return 8;
                            } else if (screenWidth < 900) {
                                return 10;
                            } else {
                                return 12;
                            }
                        }()
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },

                ticks: {
                    color: 'black',
                    font: {
                        size: function() {
                            const screenWidth = window.innerWidth;
                            if (screenWidth < 600) {
                                return 8;
                            } else if (screenWidth < 900) {
                                return 10;
                            } else {
                                return 8;
                            }
                        }()
                    }
                }
            }
        }
    }
});

// Fonction debounce pour limiter les appels lors du redimensionnement
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Gestionnaire de redimensionnement optimisé
const handleResize = debounce(() => {
    const screenWidth = window.innerWidth;
    const fontSize = screenWidth < 600 ? 8 : screenWidth < 900 ? 10 : 10;
    // Mettre à jour les tailles de police
    barChart.options.scales.x.ticks.font.size = fontSize;
    barChart.options.scales.y.ticks.font.size = fontSize;
    barChart.update('none'); // Mode 'none' pour une mise à jour plus rapide
}, 250);

// Ajouter l'écouteur d'événement avec debounce
window.addEventListener('resize', handleResize);

// Création du graphique des ventes par catégorie
async function initialiserGraphiqueVentes() {
    try {
        const response = await fetch('http://localhost:3000/api/analyse/ventes-par-categorie');
        const result = await response.json();

        if (response.ok) {
            const stats = result.stats;
            
            // Mise à jour du graphique
            barChart.data.labels = stats.map(stat => stat._id);
            barChart.data.datasets[0].label = 'Ventes par catégorie (FCFA)';
            barChart.data.datasets[0].data = stats.map(stat => stat.totalVentes);
            barChart.data.datasets[0].backgroundColor = [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)'
            ];

            barChart.options.plugins.legend.labels.generateLabels = function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                    return data.labels.map(function(label, i) {
                        return {
                            text: `${label}: ${data.datasets[0].data[i].toLocaleString()} FCFA`,
                            fillStyle: data.datasets[0].backgroundColor[i],
                            strokeStyle: 'rgba(0, 0, 0, 0.1)',
                            lineWidth: 1,
                            hidden: false,
                            index: i
                        };
                    });
                }
                return [];
            };

            barChart.update();
        } else {
            console.error('Erreur lors de la récupération des statistiques :', result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques :', error);
    }
}

// Configuration du graphique démographique
const demographie = document.getElementById('DemographieCanvas');
const demographieChart = new Chart(demographie, {
    type: 'doughnut',
    data: {
        labels: [], // Sera rempli dynamiquement
        datasets: [{
            data: [], // Sera rempli dynamiquement
            backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            }
        },
        plugins: {
            legend: {
                position: 'right',
                align: 'center',
                labels: {
                    boxWidth: 15,
                    padding: 15,
                    color: 'black',
                    font: {
                        size: 12
                    },
                    generateLabels: function(chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map(function(label, i) {
                                const value = data.datasets[0].data[i];
                                const total = data.datasets[0].data.reduce((acc, val) => acc + val, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return {
                                    text: `${label}: ${percentage}% (${value})`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    strokeStyle: '#fff',
                                    lineWidth: 2,
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                        return [];
                    }
                }
            },
            title: {
                display: true,
                text: 'Répartition du Personnel',
                color: 'black',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            }
        }
    }
});

// Fonction pour mettre à jour le graphique démographique
async function initialiserGraphiqueDemographie() {
    try {
        const response = await fetch('http://localhost:3000/api/analyse/personnel-stats');
        const result = await response.json();

        if (response.ok) {
            const { role, contrat, departement } = result.stats;
            
            // S'assurer que les données ne sont pas vides
            if (!role || role.length === 0) {
                console.warn('Aucune donnée de personnel disponible');
                return;
            }

            // Mise à jour initiale avec les données par rôle
            mettreAJourDonneesDemographie(role);

            // Création des boutons si pas déjà présents
            if (!document.querySelector('.demo-btn-container')) {
                const btnContainer = document.createElement('div');
                btnContainer.className = 'demo-btn-container';
                btnContainer.innerHTML = `
                    <button class="demo-btn active" data-type="role">Par Rôle</button>
                    <button class="demo-btn" data-type="contrat">Par Type de Contrat</button>
                    <button class="demo-btn" data-type="departement">Par Département</button>
                `;
                
                const canvas = document.getElementById('DemographieCanvas');
                canvas.parentElement.insertBefore(btnContainer, canvas);

                // Gestionnaire d'événements pour les boutons
                btnContainer.addEventListener('click', (e) => {
                    if (e.target.classList.contains('demo-btn')) {
                        const type = e.target.dataset.type;
                        let data;
                        
                        switch(type) {
                            case 'role':
                                data = role;
                                break;
                            case 'contrat':
                                data = contrat;
                                break;
                            case 'departement':
                                data = departement;
                                break;
                        }
                        
                        mettreAJourDonneesDemographie(data);
                        
                        // Mise à jour des classes active
                        btnContainer.querySelectorAll('.demo-btn')
                            .forEach(btn => btn.classList.remove('active'));
                        e.target.classList.add('active');
                    }
                });
            }
        } else {
            console.error('Erreur lors de la récupération des statistiques :', result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques :', error);
    }
}

function mettreAJourDonneesDemographie(data) {
    demographieChart.data.labels = data.map(stat => stat._id);
    demographieChart.data.datasets[0].data = data.map(stat => stat.count);
    demographieChart.update();
}

// Récupération des données depuis l'API
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Récupérer les revenus (ventes)
        const responseRevenue = await fetch('http://localhost:3000/api/analyse/revenue');
        const resultRevenue = await responseRevenue.json();
        if (responseRevenue.ok) {
            revenue = resultRevenue.revenue;
            console.log('Revenus récupérés :', revenue);
        } else {
            console.error('Erreur lors de la récupération des revenus :', resultRevenue.message);
        }

        // Récupérer les dépenses
        const responseDepenses = await fetch('http://localhost:3000/api/analyse/depenses');
        const resultDepenses = await responseDepenses.json();
        if (responseDepenses.ok) {
            depenses = resultDepenses.depenses;
            console.log('Dépenses récupérées :', depenses);
        } else {
            console.error('Erreur lors de la récupération des dépenses :', resultDepenses.message);
        }

        // Mettre à jour les graphiques et les transactions
        genererTransactions();
        mettreAJourGraphique(depenses, revenue);

        // Initialiser le graphique des ventes
        await initialiserGraphiqueVentes();

        // Initialiser le graphique démographique
        await initialiserGraphiqueDemographie();
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
    }
});


