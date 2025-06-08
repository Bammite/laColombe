document.addEventListener('DOMContentLoaded', async () => {
    const devisId = new URLSearchParams(window.location.search).get('id'); // Récupère l'ID du devis depuis l'URL
    const titreDevisElement = document.getElementById('titreDevis');
    const blocsContainer = document.getElementById('blocsContainer');
    const totalDevisElement = document.getElementById('totalDevis');

    if (!devisId) {
        alert('Aucun ID de devis fourni.');
        return;
    }

    // Gestionnaire d'événement pour le bouton d'impression
    document.getElementById('btnImprimer').addEventListener('click', () => {
        window.print();
    });

    try {
        const response = await fetch(`http://localhost:3000/api/devis/${devisId}`);
        const result = await response.json();

        if (response.ok) {
            const { titre, blocs, totalDevis } = result.devis;

            // Afficher le titre du devis
            titreDevisElement.textContent = titre;

            // Afficher les blocs
            blocs.forEach((bloc, index) => {
                const blocElement = document.createElement('div');
                blocElement.classList.add('bloc');

                blocElement.innerHTML = `
                    <h3>${bloc.titreBloc}</h3>
                    <table class="tableBloc">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Désignation</th>
                                <th>Unité</th>
                                <th>Qtés</th>
                                <th>Prix U (Fcfa)</th>
                                <th>Prix Total (Fcfa)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bloc.lignes.map(ligne => `
                                <tr>
                                    <td>${ligne.numero}</td>
                                    <td>${ligne.designation}</td>
                                    <td>${ligne.unite}</td>
                                    <td>${ligne.quantite}</td>
                                    <td>${ligne.prixUnitaire.toFixed(2)}</td>
                                    <td>${ligne.prixTotal.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="5">Total</td>
                                <td>${bloc.totalBloc.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                `;

                blocsContainer.appendChild(blocElement);
            });

            // Afficher le total général du devis
            totalDevisElement.textContent = `Total du devis : ${totalDevis.toFixed(2)} Fcfa`;
        } else {
            alert('Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du devis :', error);
        alert('Une erreur est survenue.');
    }
});