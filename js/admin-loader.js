// js/admin-loader.js
// Chargeur de contenu dynamique pour Netlify CMS

class APDContentLoader {
    constructor() {
        this.basePath = './data';
        this.currentArticle = null;
    }

    // Initialiser tout le contenu
    async init() {
        try {
            await Promise.all([
                this.loadBlogPosts(),
                this.loadTeamMembers(),
                this.loadGallery(),
                this.loadPlanAction()
            ]);
            
            console.log('✅ Tous les contenus chargés avec succès');
        } catch (error) {
            console.error('❌ Erreur lors du chargement du contenu:', error);
        }
    }

    // ==================== BLOG ====================
    async loadBlogPosts() {
        try {
            const response = await fetch(`${this.basePath}/blog/index.json`);
            if (!response.ok) throw new Error('Fichier blog non trouvé');
            
            const posts = await response.json();
            this.renderBlogPosts(posts);
        } catch (error) {
            console.error('Erreur chargement blog:', error);
            this.showErrorMessage('blog-grid', 'Impossible de charger les articles');
        }
    }

    renderBlogPosts(posts) {
        const blogGrid = document.getElementById('blog-grid');
        if (!blogGrid) return;

        if (!posts || posts.length === 0) {
            blogGrid.innerHTML = `
                <div class="no-content-message">
                    <p>📝 Aucun article publié pour le moment</p>
                    <p><small><a href="/admin/">Rédiger le premier article</a></small></p>
                </div>
            `;
            return;
        }

        // Trier par date (du plus récent au plus ancien)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        blogGrid.innerHTML = posts.map(post => `
            <div class="blog-card" onclick="contentLoader.showArticle('${post.slug}')">
                <div class="blog-image">${post.icon || '📄'}</div>
                <div class="blog-content">
                    <p class="blog-date">${this.formatDate(post.date)}</p>
                    <h3>${post.title}</h3>
                    <p class="blog-excerpt">${post.excerpt || 'Cliquez pour lire la suite...'}</p>
                    <span class="read-more">Lire plus →</span>
                </div>
            </div>
        `).join('');
    }

    async showArticle(slug) {
        try {
            const response = await fetch(`${this.basePath}/blog/${slug}.json`);
            if (!response.ok) throw new Error('Article non trouvé');
            
            const article = await response.json();
            this.renderArticle(article);
        } catch (error) {
            console.error('Erreur chargement article:', error);
            alert('Article non trouvé');
        }
    }

    renderArticle(article) {
        // Mettre à jour les éléments de la page d'article
        document.getElementById('article-icon').textContent = article.icon || '📄';
        document.getElementById('article-title').textContent = article.title;
        document.getElementById('article-date').textContent = `📅 ${this.formatDate(article.date)}`;
        document.getElementById('article-category').textContent = `🏷️ ${article.category || 'Général'}`;
        
        // Convertir le markdown en HTML (version simplifiée)
        const content = this.markdownToHtml(article.body);
        document.getElementById('article-content').innerHTML = content;
        
        // Afficher la page d'article
        this.showPage('article');
    }

    // ==================== ÉQUIPE ====================
    async loadTeamMembers() {
        try {
            const response = await fetch(`${this.basePath}/team/index.json`);
            if (!response.ok) throw new Error('Fichier équipe non trouvé');
            
            const members = await response.json();
            this.renderTeamMembers(members);
        } catch (error) {
            console.error('Erreur chargement équipe:', error);
            this.showErrorMessage('team-executive', 'Impossible de charger les membres');
        }
    }

    // Dans la fonction renderTeamMembers, remplacez la partie team-avatar par :
renderTeamMembers(members) {
    const executiveGrid = document.getElementById('team-executive');
    const regionalGrid = document.getElementById('regional-delegates');
    
    if (!executiveGrid) return;

    if (!members || members.length === 0) {
        executiveGrid.innerHTML = `
            <div class="no-content-message">
                <p>👥 Aucun membre d'équipe enregistré</p>
                <p><small><a href="/admin/">Ajouter des membres</a></small></p>
            </div>
        `;
        return;
    }

    // Filtrer les membres par rôle
    const executives = members.filter(m => !m.region || m.role.includes('Délégué'));
    const regionals = members.filter(m => m.region);

    // Rendre le bureau exécutif
    executives.sort((a, b) => (a.order || 999) - (b.order || 999));
    
    executiveGrid.innerHTML = executives.map(member => `
        <div class="team-member ${member.role === 'Président' ? 'team-highlight' : ''}">
            <div class="team-avatar">
                ${member.photo ? 
                    `<img src="${member.photo}" alt="${member.name}" class="team-photo" />` : 
                    `<span class="team-avatar-fallback">${member.avatar || '👤'}</span>`
                }
            </div>
            <h3>${member.name}</h3>
            <p class="team-role">${member.role}</p>
            <p class="team-profession">${member.profession || ''}</p>
            ${member.phone ? `
            <div class="team-contact">
                <div class="team-contact-item">📞 ${member.phone}</div>
                ${member.email ? `<div class="team-contact-item">✉️ ${member.email}</div>` : ''}
                ${member.region ? `<div class="team-contact-item">📍 ${member.region}</div>` : ''}
            </div>
            ` : ''}
        </div>
    `).join('');

    // Rendre les délégués régionaux (avec photos aussi)
    if (regionalGrid) {
        regionalGrid.innerHTML = regionals.map(delegate => `
            <div class="delegate-card">
                ${delegate.photo ? `
                    <div style="text-align: center; margin-bottom: 1rem;">
                        <img src="${delegate.photo}" alt="${delegate.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #ff9800;" />
                    </div>
                ` : ''}
                <h4>📍 ${delegate.region}</h4>
                <p><strong>${delegate.name}</strong></p>
                <p style="color: #ff9800;">${delegate.role || 'Délégué régional'}</p>
                <p>${delegate.profession || ''}</p>
                ${delegate.phone ? `<p>📞 ${delegate.phone}</p>` : ''}
            </div>
        `).join('');
    }
}

    // ==================== GALERIE ====================
    async loadGallery() {
        try {
            const response = await fetch(`${this.basePath}/gallery/index.json`);
            if (!response.ok) throw new Error('Fichier galerie non trouvé');
            
            const photos = await response.json();
            this.renderGallery(photos);
        } catch (error) {
            console.error('Erreur chargement galerie:', error);
            this.showErrorMessage('gallery-grid', 'Impossible de charger la galerie');
        }
    }

    renderGallery(photos) {
        const galleryGrid = document.getElementById('gallery-grid');
        if (!galleryGrid) return;

        if (!photos || photos.length === 0) {
            galleryGrid.innerHTML = `
                <div class="no-content-message">
                    <p>📸 Aucune photo dans la galerie</p>
                    <p><small><a href="/admin/">Ajouter des photos</a></small></p>
                </div>
            `;
            return;
        }

        // Trier par date (du plus récent au plus ancien)
        photos.sort((a, b) => new Date(b.date) - new Date(a.date));

        galleryGrid.innerHTML = photos.map(photo => `
            <div class="gallery-item" data-category="${(photo.categories || ['tous']).join(' ')}" onclick="contentLoader.openGalleryModal('${photo.slug}')">
                <div class="gallery-image">
                    <span class="gallery-image-icon">${photo.icon || '📷'}</span>
                </div>
                <div class="gallery-info">
                    <p class="gallery-date">${this.formatDate(photo.date)}</p>
                    <h3>${photo.title}</h3>
                    <p class="gallery-description">${photo.description || 'Cliquez pour plus de détails...'}</p>
                    <span class="gallery-tag">${(photo.categories || ['Général'])[0]}</span>
                </div>
            </div>
        `).join('');

        // Stocker les données de la galerie pour les modals
        this.galleryData = photos;
    }

    async openGalleryModal(slug) {
        try {
            const response = await fetch(`${this.basePath}/gallery/${slug}.json`);
            if (!response.ok) throw new Error('Photo non trouvée');
            
            const photo = await response.json();
            this.renderGalleryModal(photo);
        } catch (error) {
            console.error('Erreur chargement photo:', error);
            
            // Fallback: utiliser les données chargées précédemment
            const photo = this.galleryData?.find(p => p.slug === slug);
            if (photo) {
                this.renderGalleryModal(photo);
            } else {
                alert('Photo non trouvée');
            }
        }
    }

    renderGalleryModal(photo) {
        document.getElementById('modalTitle').textContent = photo.title;
        document.getElementById('modalDate').textContent = this.formatDate(photo.date);
        document.getElementById('modalIcon').textContent = photo.icon || '📷';
        
        // Convertir le markdown en HTML pour la description
        const description = this.markdownToHtml(photo.body || photo.description || '');
        document.getElementById('modalDescription').innerHTML = description;

        // Afficher le modal
        const modal = document.getElementById('photoModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // ==================== PLAN D'ACTION ====================
    async loadPlanAction() {
        try {
            const response = await fetch(`${this.basePath}/plan/index.json`);
            if (!response.ok) throw new Error('Fichier plan non trouvé');
            
            const events = await response.json();
            this.renderPlanAction(events);
        } catch (error) {
            console.error('Erreur chargement plan:', error);
            this.showErrorMessage('timeline', 'Impossible de charger le plan d\'action');
        }
    }

    renderPlanAction(events) {
        const timeline = document.getElementById('timeline');
        if (!timeline) return;

        if (!events || events.length === 0) {
            timeline.innerHTML = `
                <div class="no-content-message">
                    <p>📅 Aucun événement planifié</p>
                    <p><small><a href="/admin/">Ajouter des événements</a></small></p>
                </div>
            `;
            return;
        }

        // Trier par date
        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        timeline.innerHTML = events.map((event, index) => `
            <div class="timeline-item">
                <div class="timeline-marker">${event.icon || '📅'}</div>
                <div class="timeline-content">
                    <span class="timeline-date">${this.formatDate(event.date)}</span>
                    <h3>${event.title}</h3>
                    <p>${event.description || ''}</p>
                    ${event.details ? `
                    <div class="event-details">
                        ${this.markdownToHtml(event.details)}
                    </div>
                    ` : ''}
                    ${event.location ? `<div class="timeline-location">📍 ${event.location}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    // ==================== UTILITAIRES ====================
    
    // Formatage des dates
    formatDate(dateString) {
        if (!dateString) return 'Date non spécifiée';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    // Conversion Markdown vers HTML (version simplifiée)
    markdownToHtml(markdown) {
        if (!markdown) return '';
        
        return markdown
            // Titres
            .replace(/^### (.*$)/gim, '<h4>$1</h4>')
            .replace(/^## (.*$)/gim, '<h3>$1</h3>')
            .replace(/^# (.*$)/gim, '<h2>$1</h2>')
            
            // Gras et italique
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            
            // Listes
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
            
            // Retours à la ligne
            .replace(/\n/gim, '<br>')
            
            // Nettoyage des balises multiples
            .replace(/<ul>\s*<ul>/gim, '<ul>')
            .replace(/<\/ul>\s*<\/ul>/gim, '</ul>');
    }

    // Affichage des messages d'erreur
    showErrorMessage(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="error-message">
                    <p>❌ ${message}</p>
                </div>
            `;
        }
    }

    // Navigation entre pages
    showPage(pageId) {
        // Cacher toutes les pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Afficher la page sélectionnée
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Scroll vers le haut
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Fermer le menu mobile si ouvert
        if (window.innerWidth <= 992) {
            const nav = document.getElementById('mainNav');
            if (nav) nav.classList.remove('active');
        }
    }

    // Fermer le modal
    closeModal() {
        const modal = document.getElementById('photoModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
}

// ==================== INITIALISATION ====================

// Créer une instance globale
const contentLoader = new APDContentLoader();

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    contentLoader.init();
    
    // Gérer la fermeture du modal avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            contentLoader.closeModal();
        }
    });
    
    // Gérer la fermeture du modal en cliquant à l'extérieur
    const modal = document.getElementById('photoModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                contentLoader.closeModal();
            }
        });
    }
});

// ==================== FONCTIONS GLOBALES ====================

// Fonction de filtre de galerie (à appeler depuis HTML)
function filterGallery(category) {
    const items = document.querySelectorAll('.gallery-item');
    const buttons = document.querySelectorAll('.filter-btn');
    
    // Mettre à jour le bouton actif
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filtrer les éléments
    items.forEach(item => {
        if (category === 'tous') {
            item.classList.remove('hidden');
        } else {
            const categories = item.getAttribute('data-category');
            if (categories && categories.includes(category)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        }
    });
}

// Fonction pour fermer le modal (à appeler depuis HTML)
function closeModal() {
    contentLoader.closeModal();
}

// Exposer les fonctions globales
window.contentLoader = contentLoader;
window.filterGallery = filterGallery;
window.closeModal = closeModal;