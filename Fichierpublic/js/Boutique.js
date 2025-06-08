// Fonction utilitaire pour extraire le nom du fichier d'une URL
function getImageFileName(imageUrl) {
    if (!imageUrl) return null;
    const parts = imageUrl.split('/');
    return parts[parts.length - 1];
}

document.getElementById('articleForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const articleData = {
        titre: document.getElementById('titre').value,
        contenu: document.getElementById('contenu').value,
        prix: parseFloat(document.getElementById('prix').value),
        stock: parseInt(document.getElementById('stock').value),
        categorie: document.getElementById('categorie').value,
        dateAjout: document.getElementById('dateAjout').value,
        image: document.getElementById('image').value,
        description: document.getElementById('description').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/articles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(articleData)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Article ajouté avec succès !');
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'article :', error);
        alert('Une erreur est survenue.');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const articlesContainer = document.querySelector('.articles'); // Conteneur des articles

    try {
        // Récupérer les articles depuis le backend
        const response = await fetch('http://localhost:3000/api/articles');
        const result = await response.json();

        if (response.ok) {
            const articles = result.articles;
            // Afficher le nombre d'articles
            const articleCount = document.getElementById('nbArticle');
            articleCount.innerHTML= `Nombre d'articles : ${articles.length}`;

            // Vider le conteneur avant d'ajouter les articles
            articlesContainer.innerHTML = '';

            // Générer un article pour chaque élément
            articles.forEach(article => {
                const articleElement = document.createElement('div');
                articleElement.classList.add('article');
                
                articleElement.innerHTML = `
                    <img src="${article.Image || './asset/image/default.png'}" class="ImageArticle" alt="${article.titre}" onclick="openImageModal(this.src)">
                    <div class="eyes">
                        <button class="dispaly"><img ${article.stock==-1 ? 'src="./asset/svg/eyes.svg" alt="eyes"' : 'src="./asset/svg/hidden.svg" alt="hidden"'}  ></button>
                    </div>
                    <div class="info">
                        <div class="nom">${article.titre}</div>
                        <div class="prix">${article.prix.toLocaleString()} FCFA</div>
                        <div class="detaile">
                            <p >Stock : ${article.stock}</p>
                            <p>Description : ${article.description}</p>
                        </div>
                        <div class="btn">
                            <button class="btn-supprimer" data-id="${article._id}">Supprimer</button>
                            <button class="btn-modifier" data-id="${article._id}">Modifier</button>
                        </div>
                    </div>
                `;
                
                articlesContainer.appendChild(articleElement);
            });

            // Fonction pour ouvrir la modale d'image
            window.openImageModal = function(imageSrc) {
                const modal = document.getElementById('imageModal');
                const modalImg = document.getElementById('modalImage');
                modal.style.display = "block";
                modalImg.src = imageSrc;
            }

            

            // Fermer la modale en cliquant en dehors de l'image
            window.addEventListener('click', function(event) {
                const modal = document.getElementById('imageModal');
                if (event.target === modal) {
                    modal.style.display = "none";
                }
            });

            // Ajouter des gestionnaires d'événements pour les boutons display
            document.querySelectorAll('.dispaly').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const articleElement = e.target.closest('.article');
                    const modifierBtn = articleElement.querySelector('.btn-modifier');
                    const articleId = modifierBtn.dataset.id;
                    
                    // Récupérer le stock actuel depuis l'élément HTML
                    const stockText = articleElement.querySelector('.detaile p:first-child').textContent;
                    const currentStock = parseInt(stockText.split(':')[1]);
                    const nouvelleQuantite = currentStock === -1 ? 0 : -1;
                    
                    await changerQuantiteArticle(articleId, nouvelleQuantite);
                });
            });

            // Ajouter des gestionnaires d'événements pour les boutons
            document.querySelectorAll('.btn-supprimer').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const articleId = e.target.dataset.id;
                    if (confirm('Voulez-vous vraiment supprimer cet article ?')) {
                        await supprimerArticle(articleId);
                    }
                });
            });

            document.querySelectorAll('.btn-modifier').forEach(button => {
                button.addEventListener('click', (e) => {
                    const articleId = e.target.dataset.id;
                    modifierArticle(articleId);
                });
            });
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des articles :', error);
        alert('Une erreur est survenue lors du chargement des articles.');
    }
});

// Fonction pour supprimer un article
async function supprimerArticle(articleId) {
    try {
        const response = await fetch(`http://localhost:3000/api/articles/${articleId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (response.ok) {
            alert('Article supprimé avec succès !');
            location.reload(); // Recharger la page pour mettre à jour la liste
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'article :', error);
    }
}

// Fonction pour modifier un article
async function modifierArticle(articleId) {
    try {
        // Récupérer les données de l'article
        const response = await fetch(`http://localhost:3000/api/articles/${articleId}`);
        const result = await response.json();
        
        if (response.ok) {
            const article = result.article;
            
            // Remplir le formulaire
            document.getElementById('modifyArticleId').value = article._id;
            document.getElementById('titreMod').value = article.titre;
            document.getElementById('CategorieArticleMod').value = article.categorie;
            document.getElementById('prixMod').value = article.prix;
            document.getElementById('stockMod').value = article.stock;
            document.getElementById('descriptionMod').value = article.description;
            
            // Ouvrir la modale
            openModal(modalActu, 'formeModifyArticle');
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'article :', error);
        alert('Une erreur est survenue.');
    }
}

// Gestionnaire du formulaire de modification
document.getElementById('modifyArticleForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const articleId = document.getElementById('modifyArticleId').value;
    
    try {
        const response = await fetch(`http://localhost:3000/api/articles/${articleId}`, {
            method: 'PUT',
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            alert('Article modifié avec succès !');
            closeModal(modalActu);
            location.reload();
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la modification de l\'article :', error);
        alert('Une erreur est survenue.');
    }
})

// Fonction pour changer la quantité d'un article
async function changerQuantiteArticle(articleId, nouvelleQuantite) {
    try {
        const response = await fetch(`http://localhost:3000/api/Display`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                articleId: articleId,
                stock: nouvelleQuantite
            })
        });

        const result = await response.json();
        if (response.ok) {
            location.reload(); // Recharger la page pour mettre à jour l'affichage
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors du changement de quantité :', error);
        alert('Une erreur est survenue.');
    }
}

// Gestion des commandes
async function fetchCommandes() {
    try {
        const response = await fetch('/api/commandes');
        const data = await response.json();
        if (data.success) {
            return data.commandes;
        }
        throw new Error(data.message);
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        return [];
    }
}

function updateCommandeStats(commandes) {
    const stats = {
        'En attente': 0,
        'En préparation': 0,
        'En livraison': 0,
        'Livrée': 0
    };

    commandes.forEach(commande => {
        if (stats.hasOwnProperty(commande.statut)) {
            stats[commande.statut]++;
        }
    });

    document.getElementById('enAttente').textContent = stats['En attente'];
    document.getElementById('enPreparation').textContent = stats['En préparation'];
    document.getElementById('enLivraison').textContent = stats['En livraison'];
    document.getElementById('livrees').textContent = stats['Livrée'];
}

function createCommandeCard(commande) {
    const template = document.getElementById('commande-template');
    const clone = template.content.cloneNode(true);
    
    clone.querySelector('.commande-id span').textContent = commande._id.slice(-6);
    clone.querySelector('.commande-date').textContent = new Date(commande.createdAt).toLocaleDateString();
    clone.querySelector('.client-nom').textContent = commande.client.nom;
    clone.querySelector('.client-tel').textContent = commande.client.telephone;
    clone.querySelector('.client-adresse').textContent = commande.client.adresse;
    
    // Gestion du chemin de l'image
    const productImage = clone.querySelector('.product-image');
    const imageUrl = commande.articleId.Image ? 
        `http://localhost:3000/api/articles/image/${getImageFileName(commande.articleId.Image)}` : 
        './asset/image/default.png';
    productImage.src = imageUrl;
    productImage.alt = commande.articleId.titre;
    
    clone.querySelector('.product-name').textContent = commande.articleId.titre;
    clone.querySelector('.product-quantity').textContent = `Quantité: ${commande.quantite}`;
    clone.querySelector('.product-total').textContent = `Total: ${commande.montantTotal.toLocaleString()} FCFA`;

    const statusSelect = clone.querySelector('.status-select');
    statusSelect.value = commande.statut;
    
    statusSelect.addEventListener('change', async (e) => {
        await updateCommandeStatus(commande._id, e.target.value);
    });
    
    clone.querySelector('.view-details-btn').addEventListener('click', () => {
        showCommandeDetails(commande);
    });
    
    clone.querySelector('.print-btn').addEventListener('click', () => {
        printCommande(commande);
    });
    
    return clone;
}

async function updateCommandeStatus(commandeId, newStatus) {
    try {
        const response = await fetch(`/api/commandes/${commandeId}/statut`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ statut: newStatus })
        });
        
        const data = await response.json();
        if (data.success) {
            await refreshCommandes();
        } else {
            alert('Erreur lors de la mise à jour du statut');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la mise à jour du statut');
    }
}

function filterCommandes(commandes) {
    const statusFilter = document.getElementById('filterStatus').value;
    const dateFilter = document.getElementById('filterDate').value;
    
    return commandes.filter(commande => {
        const matchStatus = statusFilter === 'all' || commande.statut === statusFilter;
        const matchDate = !dateFilter || new Date(commande.createdAt).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();
        return matchStatus && matchDate;
    });
}

function showCommandeDetails(commande) {
    // Implémenter l'affichage des détails
    alert(`Détails de la commande #${commande._id}:\n` +
          `Client: ${commande.client.nom}\n` +
          `Article: ${commande.articleId.titre}\n` +
          `Quantité: ${commande.quantite}\n` +
          `Total: ${commande.montantTotal} FCFA\n` +
          `Statut: ${commande.statut}`);
}

function printCommande(commande) {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Commande #${commande._id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .details { margin-bottom: 20px; }
                    .total { font-weight: bold; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>La Colombe</h1>
                    <h2>Bon de Commande #${commande._id}</h2>
                </div>
                <div class="details">
                    <p><strong>Date:</strong> ${new Date(commande.createdAt).toLocaleDateString()}</p>
                    <p><strong>Client:</strong> ${commande.client.email}</p>
                    <p><strong>Téléphone:</strong> ${commande.client.telephone}</p>
                    <p><strong>Adresse:</strong> ${commande.client.adresse}</p>
                    <p><strong>Article:</strong> ${commande.articleId.titre}</p>
                    <p><strong>Quantité:</strong> ${commande.quantite}</p>
                    <p><strong>Prix unitaire:</strong> ${commande.articleId.prix} FCFA</p>
                </div>
                <div class="total">
                    <p>Total: ${commande.montantTotal} FCFA</p>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

async function refreshCommandes() {
    const commandes = await fetchCommandes();
    updateCommandeStats(commandes);
    
    const filteredCommandes = filterCommandes(commandes);
    const commandesList = document.querySelector('.commandes-list');
    commandesList.innerHTML = '';
    
    filteredCommandes.forEach(commande => {
        commandesList.appendChild(createCommandeCard(commande));
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    refreshCommandes();
    
    document.getElementById('filterStatus').addEventListener('change', refreshCommandes);
    document.getElementById('filterDate').addEventListener('change', refreshCommandes);
    document.querySelector('.filter-btn').addEventListener('click', refreshCommandes);
});