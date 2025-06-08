const modalActu = document.getElementById('modal-publication');


document.querySelector('.close-actualite').addEventListener('click', function() {
    closeModal(modalActu)
});



function openModal(idModal,forme='') {
    idModal.style.display = 'block';
    if (forme != '' && document.querySelector("."+forme)) {
        document.querySelector("."+forme).style.display ='inline'
    }
}

function closeModal(idModal) {
    idModal.style.display = 'none';
    document.querySelectorAll('.formeModal1').forEach((form) => {
        form.style.display='none';
    });
}

modalActu.addEventListener('click', function() {
    if(event.target.classList.contains('modal')){
        closeModal(modalActu);
    }
});

document.querySelectorAll('.ideeForm').forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            email: form.querySelector('input[name="ida"]').value,
            message: form.querySelector('textarea[name="textd"]').value
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                // Afficher le message de confirmation
                const confirmationModal = document.getElementById('confirmationModal');
                confirmationModal.style.display = 'block';
                
                // Fermer le modal après 3 secondes
                setTimeout(() => {
                    confirmationModal.style.display = 'none';
                }, 3000);

                // Réinitialiser le formulaire
                form.reset();
            } else {
                alert('Erreur : ' + result.message);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            alert('Une erreur est survenue lors de l\'envoi du message.');
        }
    });
});

