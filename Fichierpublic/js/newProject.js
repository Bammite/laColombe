document.getElementById('newProjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('titre', document.getElementById('titre').value.trim());
    formData.append('description', document.getElementById('description').value.trim());
    formData.append('type', document.getElementById('type').value);
    formData.append('budget', parseFloat(document.getElementById('budget').value));
    formData.append('dateEcheance', document.getElementById('dateEcheance').value);
    formData.append('dateSignature', document.getElementById('dateSignature').value);
    formData.append('priorite', document.getElementById('priorite').value);
    formData.append('responsable', document.getElementById('Responsable').value.trim());
    formData.append('partenaire', document.getElementById('Partenaire').value.trim());

    // Ajouter l'image si elle existe
    const imageInput = document.getElementById('image-publication');
    if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        const response = await fetch('http://localhost:3000/api/projets', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            alert('Projet créé avec succès !');
            window.location.reload(); // Recharger la page après succès
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la création du projet :', error);
        alert('Une erreur est survenue.');
    }
});