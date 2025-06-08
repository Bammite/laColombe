document.querySelector('.hamburger').addEventListener('click', () => {
    document.querySelector('.menu').classList.toggle('active');
});

const itemIndexName= document.getElementById('itemName');

document.addEventListener("DOMContentLoaded", () => {
    const menuLinks = document.querySelectorAll(".menu li a");
    const sections = document.querySelectorAll(".section");
    const main = document.querySelector("main");
    const filtre = document.getElementById("filtre");
    const colors = [
        'rgba(3, 3, 3, 0.62)',
        'rgba(255, 255, 255, 0.618)',
        'rgba(255, 255, 255, 0.83)'
    ];

    // Vérifiez que l'élément filtre existe
    if (!filtre) {
        console.error("L'élément avec l'ID 'filtre' est introuvable.");
        return;
    }
    filtre.style.background = colors[0]; // Couleur par défaut
    optionMenu = document.querySelectorAll('.menu li');

    // Fonction pour activer la section correspondante
    menuLinks.forEach((link, index) => {
        link.addEventListener("click", () => {
            // Désactiver tous les liens actifs
            menuLinks.forEach((link) => {
                link.classList.remove("active")
            });
             optionMenu.forEach((link) => {
                if(index >0)
                    link.style.color = "black";
                else
                    link.style.color = "white";
            });


            // Activer le lien cliqué
            link.classList.add("active");

            // Vérifiez que l'index est valide
            if (index >= 0 && index < colors.length) {
                filtre.style.background = colors[index];
            } else {
                console.error("Index hors limites :", index);
            }

            // Déplacer le conteneur principal (main) pour afficher la section correspondante 
            main.style.transform = `translateX(-${index * 100}vw)`;
            document.querySelector('.menu').classList.toggle('active');
        });
    });
});





//////////////////////////  Catalogue  //////////////////////

let produits = [];

document.addEventListener('DOMContentLoaded', async () => {

    try {
        // Récupérer les articles depuis le backend
        const response = await fetch('/api/user');
        const result = await response.json();

        if (response.ok) {
            document.getElementById('auth-option').style.display='none';
            document.getElementById('auth-button').style.opacity='0';

        } else {
            console.log("utilisateur non connecté");
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du user :', error);
        alert('Une erreur est survenue lors de la recuperation du user.');
    }




    const articlesContainer = document.querySelector('.content-catalogue .articles'); // Conteneur des articles

    try {
        // Récupérer les articles depuis le backend
        const response = await fetch('/api/articles/disponibles');
        const result = await response.json();

        if (response.ok) {
            const articles = result.articles;
            produits = articles; // Stocker les articles dans la variable produits

            // Vider le conteneur avant d'ajouter les articles
            articlesContainer.innerHTML = '';

            // Générer un article pour chaque élément
            // Dans votre code de récupération des articles
            articles.forEach(article => {
                const articleElement = document.createElement('div');
                articleElement.classList.add('article');

                // Vérifier si l'article est en favoris via le cookie
                const isFavorite = document.cookie.includes(`favorite_${article._id}=true`);
                
                articleElement.innerHTML = `
                    <div class="favorite-icon ${isFavorite ? 'active' : ''}" data-id="${article._id}">
                        <i class="fas fa-heart"></i>
                    </div>
                    <img src="${article.Image || './asset/image/default.png'}" onclick="openImageModal('${article.Image || './asset/image/default.png'}')" alt="Image de l'article">
                    <div class="info">
                        <div class="nom">${article.titre}</div>
                        <div class="prix">${article.prix.toLocaleString()} FCFA</div>
                        <div class="btn">
                            <button class="btn-Commander" data-id="${article._id}">Commander</button>
                        </div>
                    </div>
                `;

                articlesContainer.appendChild(articleElement);
            });

            // Gestion des clics sur les icônes de favoris
            document.querySelectorAll('.favorite-icon').forEach(icon => {
                icon.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const articleId = e.currentTarget.dataset.id;
                    e.currentTarget.classList.toggle('active');
                    
                    try {
                        const response = await fetch('/api/articles/toggle-favorite', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ articleId }),
                            credentials: 'include'
                        });

                        const result = await response.json();
                        
                        if (response.ok) {
                            
                            // Mettre à jour le cookie local
                            if (result.isFavorite) {
                                document.cookie = `favorite_${articleId}=true; path=/; max-age=${60*60*24*30}`;
                            } else {
                                document.cookie = `favorite_${articleId}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
                            }
                        }
                    } catch (error) {
                        console.error('Erreur:', error);
                    }
                });
            });

            // Ajouter des gestionnaires d'événements pour les boutons "Commander"
            document.querySelectorAll('.btn-Commander').forEach(button => {
                button.addEventListener('click', (e) => {
                    const articleId = e.target.dataset.id;
                    console.log("id : ", articleId);
                    
                    if (articleId) {
                        const articleData = produits.find(article => article._id === articleId);
                        commanderArticle(articleData);
                    }
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

// Fonction pour gérer la commande d'un article
function commanderArticle(articleData) {
    openModal(modalActu, 'formeCommande');
    
    // Remplir les informations de l'article
    const itemName = document.getElementById('itemName');
    const itemId = document.getElementById('itemId');
    const quantity = document.getElementById('quantity');
    
    if (itemName && itemId) {
        itemName.value = articleData.titre;
        itemId.value = articleData._id;
        quantity.value = 1; // Valeur par défaut
    }
}

// Gestionnaire du formulaire de commande
const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            articleId: document.getElementById('itemId').value,
            nom: document.getElementById('itemName').value,
            quantite: parseInt(document.getElementById('quantity').value),
            telephone: document.getElementById('tel').value,
            email: document.getElementById('email').value,
            adresse: document.getElementById('adresse').value
        };

        try {
            const response = await fetch('/api/commandes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                alert('Commande effectuée avec succès !');
                closeModal(modalActu);
                this.reset();
                // Recharger les articles pour mettre à jour le stock
                location.reload();
            } else {
                alert('Erreur : ' + result.message);
            }
        } catch (error) {
            console.error('Erreur lors de la commande :', error);
            alert('Une erreur est survenue lors de la commande.');
        }
    });
}

// Gestion de la modale d'image
function openImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = "block";
    modalImg.src = imageSrc;
}

document.querySelector('.image-close-button').addEventListener('click', function() {
    document.getElementById('imageModal').style.display = "none";
});

window.addEventListener('click', function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        modal.style.display = "none";
    }
});



async function tableaudeBords() {

    try {
        // Récupérer les articles depuis le backend
        const response = await fetch('/api/user');
        const result = await response.json();

        if (response.ok) {
            if (['Elementaire', 'Superieur', 'Absolut'].includes(result.user.grade)) {
                window.location.href = "tableaudeBords.html";
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