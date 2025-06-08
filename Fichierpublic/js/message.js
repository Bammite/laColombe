// const messages = [
//     {
//         id: 1,
//         content: "Commande de 10 meubles en marbre vert par Aliou à 15h. Il est situé à la position suivante.",
//         isRead: false,
//         IdExpediteur: "Boutique",
//     },
//     {
//         id: 2,
//         content: "Réunion de toute l'équipe à 18h chez le RH.",
//         isRead: false,
//         IdExpediteur: "RH",
//     },
//     {
//         id: 3,
//         content: "Le contrat sur chantier qui devait commencer dans deux semaines a été précipité pour la semaine prochaine.",
//         isRead: true,
//         IdExpediteur: "RH",
//     },
//     {
//         id: 4,
//         content: "Appel client prévu à 14h pour finaliser les détails du projet.",
//         isRead: true,
//         IdExpediteur: "RH",
//     },
// ];


// document.addEventListener("DOMContentLoaded", () => {
//     const messageContainer = document.querySelector("#BtRcp .contente");

//     // Fonction pour générer le HTML d'un message
//     const generateMessageHTML = (message) => {
//         return `
//             <div class="message ${message.isRead ? "" : "nonLus"}">
//                 <span>${message.content}</span>
//                 <div class="optionMsg">
//                     <button class="menu-opt">...</button>
//                     <div class="menu-options">
//                         <button class="menu-option" onclick="openModal(modalActu,'formeSendMessage',);">Répondre</button>
//                         <button class="menu-option">Supprimer</button>
//                         <button class="menu-option">Marquer comme ${message.isRead ? "non lu" : "lu"}</button>
//                     </div>
//                 </div>
//             </div>
//         `;
//     };

//     // Parcourir les messages et les ajouter au conteneur
//     messages.forEach((message) => {
//         messageContainer.innerHTML += generateMessageHTML(message);
//     });

//     // Ajouter les événements pour afficher/masquer les menus
//     document.querySelectorAll(".menu-opt").forEach((button) => {
//         button.addEventListener("click", (e) => {
//             const menu = e.target.nextElementSibling;
//             menu.style.display = menu.style.display === "block" ? "none" : "block";
//         });
//     });

//     // Fermer les menus si on clique ailleurs
//     document.addEventListener("click", (e) => {
//         if (!e.target.matches(".menu-opt")) {
//             document.querySelectorAll(".menu-options").forEach((menu) => {
//                 menu.style.display = "none";
//             });
//         }
//     });
// });

// function SendMessage(idMessage) {
    
// }

// function deleteMessage(idMessage) {
    
// }

// function marque(idMessage) {
    
// }




document.addEventListener('DOMContentLoaded', function() {
    const messagesList = document.querySelector('.messages-list');
    const modal = document.getElementById('messageModal');
    const closeModal = document.querySelector('.close-modal2');
    
    // Charger les messages au démarrage
    loadMessages();
    
    // Fermer le modal
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    
    // Charger les messages depuis l'API
    async function loadMessages() {
        try {
            const response = await fetch('/api/contacts');
            const messages = await response.json();
            
            renderMessages(messages);
        } catch (error) {
            console.error('Erreur:', error);
            messagesList.innerHTML = '<div class="error">Erreur de chargement des messages</div>';
        }
    }
    
    // Afficher les messages dans la liste
    function renderMessages(messages) {
        messagesList.innerHTML = '';
        
        if (messages.length === 0) {
            messagesList.innerHTML = '<div class="no-messages">Aucun message reçu</div>';
            return;
        }
        
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            messageElement.innerHTML = `
                <div class="message-email">${message.email}</div>
                <div class="message-content">${truncateMessage(message.message)}</div>
                <div class="message-date">${formatDate(message.dateEnvoi)}</div>
            `;
            
            messageElement.addEventListener('click', () => openMessageModal(message));
            
            messagesList.appendChild(messageElement);
        });
    }
    
    // Ouvrir le modal avec le message complet
    function openMessageModal(message) {
        document.getElementById('modalEmail').textContent = message.email;
        document.getElementById('modalDate').textContent = formatDate(message.dateEnvoi, true);
        document.getElementById('modalMessage').textContent = message.message;
        
        modal.style.display = 'block';
    }
    
    // Fonction utilitaire pour tronquer les messages longs
    function truncateMessage(message, maxLength = 60) {
        return message.length > maxLength 
            ? message.substring(0, maxLength) + '...' 
            : message;
    }
    
    // Fonction utilitaire pour formater la date
    function formatDate(dateString, full = false) {
        const date = new Date(dateString);
        
        if (full) {
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Aujourd\'hui, ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Hier, ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        }
    }
    
    // Fermer le modal en cliquant à l'extérieur
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});