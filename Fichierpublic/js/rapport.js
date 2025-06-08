document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const pdfFileInput = document.getElementById('rapport');
    const fileInfo = document.getElementById('fileInfo');
    const reportsContainer = document.getElementById('reportsContainer');
    const submitBtn = document.getElementById('submitText');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Gestion de l'affichage du fichier sélectionné
    pdfFileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
        } else {
            fileInfo.textContent = 'Aucun fichier sélectionné';
        }
    });

    // Soumission du formulaire
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('reference', document.getElementById('reference').value);
        formData.append('reportDate', document.getElementById('reportDate').value);
        formData.append('category', document.getElementById('category').value);
        formData.append('rapport', pdfFileInput.files[0]);

        // Afficher le loading
        submitBtn.textContent = 'Envoi en cours...';
        loadingSpinner.classList.remove('hidden');
        
        try {
            const response = await fetch('/api/reports/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                // Réinitialiser le formulaire
                uploadForm.reset();
                fileInfo.textContent = 'Aucun fichier sélectionné';
                
                // Recharger la liste
                loadReports();
                
                // Afficher un message de succès
                showToast('Rapport uploadé avec succès!', 'success');
            } else {
                throw new Error(result.message || 'Erreur lors de l\'upload');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showToast(error.message, 'error');
        } finally {
            // Cacher le loading
            submitBtn.textContent = 'Envoyer le rapport';
            loadingSpinner.classList.add('hidden');
        }
    });

    // Charger les rapports au démarrage
    loadReports();

    // Fonction pour charger les rapports
    async function loadReports() {
        try {
            const response = await fetch('/api/reports');
            const reports = await response.json();
            console.log("voici les rapports:", reports.data);
            
            renderReports(reports.data);
        } catch (error) {
            console.error('Erreur:', error);
            reportsContainer.innerHTML = '<div class="error">Erreur de chargement des rapports</div>';
        }
    }

    // Fonction pour afficher les rapports
    function renderReports(reports) {
        if (reports.length === 0) {
            reportsContainer.innerHTML = '<div class="no-reports">Aucun rapport disponible</div>';
            return;
        }

        reportsContainer.innerHTML = '';
        
        reports.forEach(report => {
            const reportEl = document.createElement('div');
            reportEl.className = 'report-item';
            
            reportEl.innerHTML = `
                <div class="report-ref">${report.reference}</div>
                <div class="report-date">${formatDate(report.uploadDate)}</div>
                <div class="report-cat">
                    <span class="cat-${report.category.toLowerCase()}">${report.category}</span>
                </div>
                <div class="report-actions">
                    <button class="action-btn download-btn" data-id="${report._id}">
                        Télécharger
                    </button>
                    <button class="action-btn delete-btn" data-id="${report._id}">
                        Supprimer
                    </button>
                </div>
            `;
            
            reportsContainer.appendChild(reportEl);
        });

        // Gestion des boutons
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                downloadReport(this.dataset.id);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteReport(this.dataset.id);
            });
        });
    }

    // Télécharger un rapport
    async function downloadReport(reportId) {
        try {
            // Ouverture dans un nouvel onglet pour éviter les problèmes de CORS
            window.open(`/api/reports/download/${reportId}`, '_blank');
        } catch (error) {
            console.error('Erreur:', error);
            showToast('Erreur lors du téléchargement', 'error');
        }
    }

    // Supprimer un rapport
    async function deleteReport(reportId) {
        if (!confirm('Voulez-vous vraiment supprimer ce rapport ?')) return;
        
        try {
            const response = await fetch(`/api/reports/${reportId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('Rapport supprimé', 'success');
                loadReports();
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showToast(error.message, 'error');
        }
    }

    // Fonctions utilitaires
    function formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function showToast(message, type = 'info') {
        const messageContainer =document.getElementById('messageDeConfirmation');
        messageContainer.innerHTML=message;
        const confirmationModal = document.getElementById('confirmationModal');
        confirmationModal.style.display = 'block';
        // Fermer le modal après 3 secondes
        setTimeout(() => {
            confirmationModal.style.display = 'none';
        }, 3000);
    }
});