async function sauvegarderImage(destination='asset/autres', imageFile) {
    const formData = new FormData();
    formData.append('destination', destination); // Chemin où l'image doit être stockée
    formData.append('image', imageFile); // L'image à sauvegarder

    try {
        const response = await fetch('http://localhost:3000/api/upload-image', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            console.log('Image sauvegardée avec succès :', result.imagePath);
            return result.imagePath; // Retourne le lien de l'image
        } else {
            console.error('Erreur lors de la sauvegarde de l\'image :', result.message);
            return null;
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'image :', error);
        return null;
    }
}

function getImageUrl(relativePath) {
    if (!relativePath) {
        return '/asset/images/default-profile.png';
    }
    
    // Nettoyage du chemin
    const cleanPath = relativePath.replace(/^\/+/, ''); // Supprime les / au début
    
    // Si le chemin contient déjà "asset/upload", on l'utilise directement
    if (cleanPath.startsWith('asset/upload/')) {
        return `/api/images/${cleanPath.replace('asset/upload/', '')}`;
    }
    
    // Pour les anciens chemins sans "asset/upload"
    return `/api/images/${cleanPath}`;
}