document.addEventListener('DOMContentLoaded', () => {
    const modalTitre = document.getElementById('modalTitre');
    const titreDevisInput = document.getElementById('titreDevis');
    const validerTitreBtn = document.getElementById('validerTitre');
    const titreDevisAffiche = document.getElementById('titreDevisAffiche');
    const ajouterBlocBtn = document.getElementById('ajouterBloc');
    const blocsContainer = document.getElementById('blocsContainer');
    const totalDevisElement = document.getElementById('totalDevis');
    
    let blocCount = 0;

    // Afficher la fenêtre modale pour le titre
    modalTitre.style.display = 'flex';

    // Valider le titre du devis
    validerTitreBtn.addEventListener('click', () => {
        const titre = titreDevisInput.value.trim();
        if (titre) {
            titreDevisAffiche.textContent = titre;
            modalTitre.style.display = 'none';
        } else {
            alert('Veuillez entrer un titre pour le devis.');
        }
    });

    // Ajouter un nouveau bloc
    ajouterBlocBtn.addEventListener('click', () => {
        blocCount++;
        const bloc = document.createElement('div');
        bloc.classList.add('bloc');
        bloc.dataset.blocId = blocCount;

        bloc.innerHTML = `
            <div class="bloc-entete">
                <h3 contenteditable="true">Bloc ${blocCount} - Cliquez pour éditer</h3>
            </div>
            <table class="tableBloc">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Désignation des ouvrages</th>
                        <th>Unité</th>
                        <th>Qtés</th>
                        <th>Prix U (Fcfa)</th>
                        <th>Prix Total (Fcfa)</th>
                    </tr>
                </thead>
                <tbody></tbody>
                <tfoot>
                    <tr>
                        <td colspan="5">Total</td>
                        <td class="totalBloc">0</td>
                    </tr>
                </tfoot>
            </table>
            <button class="ajouterLigne">Ajouter une Ligne</button>
        `;

        blocsContainer.appendChild(bloc);

        // Ajouter une ligne dans le bloc
        const ajouterLigneBtn = bloc.querySelector('.ajouterLigne');
        ajouterLigneBtn.addEventListener('click', () => ajouterLigne(bloc));
    });

    // Ajouter une ligne dans un bloc
    function ajouterLigne(bloc) {
        const tbody = bloc.querySelector('tbody');
        const ligne = document.createElement('tr');

        ligne.innerHTML = `
            <td>${tbody.children.length + 1}</td>
            <td contenteditable="true">Nouvel ouvrage</td>
            <td contenteditable="true">FF</td>
            <td contenteditable="true">1</td>
            <td contenteditable="true">0</td>
            <td>0</td>
        `;

        ligne.addEventListener('input', () => recalculerBloc(bloc));
        tbody.appendChild(ligne);
        recalculerBloc(bloc);
    }

    // Recalculer le total d'un bloc
    function recalculerBloc(bloc) {
        const tbody = bloc.querySelector('tbody');
        const totalBlocElement = bloc.querySelector('.totalBloc');
        let totalBloc = 0;

        tbody.querySelectorAll('tr').forEach(ligne => {
            const quantite = parseFloat(ligne.children[3].textContent) || 0;
            const prixUnitaire = parseFloat(ligne.children[4].textContent) || 0;
            const prixTotal = quantite * prixUnitaire;

            ligne.children[5].textContent = prixTotal.toFixed(2);
            totalBloc += prixTotal;
        });

        totalBlocElement.textContent = totalBloc.toFixed(2);
        recalculerTotalDevis();
    }

    // Recalculer le total du devis
    function recalculerTotalDevis() {
        let totalDevis = 0;

        document.querySelectorAll('.totalBloc').forEach(totalBlocElement => {
            totalDevis += parseFloat(totalBlocElement.textContent) || 0;
        });

        totalDevisElement.textContent = `Total du devis : ${totalDevis.toFixed(2)} Fcfa`;
    }

    // Fonction pour enregistrer le devis
    async function enregistrerDevis() {
        const titre = document.getElementById('titreDevisAffiche').textContent.trim();
        const blocs = [];
        const totalDevis = parseFloat(document.getElementById('totalDevis').textContent.replace('Total du devis : ', '').replace(' Fcfa', ''));

        document.querySelectorAll('.bloc').forEach((bloc, index) => {
            const titreBloc = bloc.querySelector('.bloc-entete h3').textContent.trim();
            const lignes = [];
            let totalBloc = 0;

            bloc.querySelectorAll('tbody tr').forEach((ligne, ligneIndex) => {
                const numero = ligneIndex + 1;
                const designation = ligne.children[1].textContent.trim();
                const unite = ligne.children[2].textContent.trim();
                const quantite = parseFloat(ligne.children[3].textContent) || 0;
                const prixUnitaire = parseFloat(ligne.children[4].textContent) || 0;
                const prixTotal = quantite * prixUnitaire;

                lignes.push({ numero, designation, unite, quantite, prixUnitaire, prixTotal });
                totalBloc += prixTotal;
            });

            blocs.push({ titreBloc, lignes, totalBloc });
        });

        const devisData = { titre, blocs, totalDevis };

        try {
            const response = await fetch('http://localhost:3000/api/devis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(devisData)
            });

            const result = await response.json();
            if (response.ok) {
                alert('Devis enregistré avec succès !');
            } else {
                alert('Erreur : ' + result.message);
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du devis :', error);
            alert('Une erreur est survenue.');
        }
    }

    // Ajouter un bouton pour enregistrer le devis
    const enregistrerBtn = document.createElement('button');
    enregistrerBtn.textContent = 'Enregistrer le Devis';
    enregistrerBtn.addEventListener('click', enregistrerDevis);
    document.querySelector('main').appendChild(enregistrerBtn);
});