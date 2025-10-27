// Fonctions pour charger le contenu dynamique
class APDContentLoader {
    constructor() {
        this.basePath = './data';
    }

    // Charger les articles de blog
    async loadBlogPosts() {
        try {
            const response = await fetch(`${this.basePath}/blog/index.json`);
            const posts = await response.json();
            this.renderBlogPosts(posts);
        } catch (error) {
            console.error('Erreur chargement blog:', error);
        }
    }

    // Charger les membres de l'équipe
    async loadTeamMembers() {
        try {
            const response = await fetch(`${this.basePath}/team/index.json`);
            const members = await response.json();
            this.renderTeamMembers(members);
        } catch (error) {
            console.error('Erreur chargement équipe:', error);
        }
    }

    // Charger la galerie
    async loadGallery() {
        try {
            const response = await fetch(`${this.basePath}/gallery/index.json`);
            const photos = await response.json();
            this.renderGallery(photos);
        } catch (error) {
            console.error('Erreur chargement galerie:', error);
        }
    }

    // Charger le plan d'action
    async loadPlanAction() {
        try {
            const response = await fetch(`${this.basePath}/plan/index.json`);
            const events = await response.json();
            this.renderPlanAction(events);
        } catch (error) {
            console.error('Erreur chargement plan:', error);
        }
    }

    // Rendu des articles de blog
    renderBlogPosts(posts) {
        const blogGrid = document.querySelector('.blog-grid');
        if (!blogGrid) return;

        blogGrid.innerHTML = posts.map(post => `
            <div class="blog-card" onclick="showArticle('${post.slug}')">
                <div class="blog-image">${post.icon}</div>
                <div class="blog-content">
                    <p class="blog-date">${this.formatDate(post.date)}</p>
                    <h3>${post.title}</h3>
                    <p class="blog-excerpt">${post.excerpt}</p>
                    <span class="read-more">Lire plus →</span>
                </div>
            </div>
        `).join('');
    }

    // Rendu des membres de l'équipe
    renderTeamMembers(members) {
        const teamGrid = document.querySelector('.team-grid');
        if (!teamGrid) return;

        // Trier par ordre d'affichage
        members.sort((a, b) => (a.order || 0) - (b.order || 0));

        teamGrid.innerHTML = members.map(member => `
            <div class="team-member ${member.role === 'Président' ? 'team-highlight' : ''}">
                <div class="team-avatar">${member.avatar}</div>
                <h3>${member.name}</h3>
                <p class="team-role">${member.role}</p>
                <p class="team-profession">${member.profession}</p>
                ${member.phone ? `<div class="team-contact">
                    <div class="team-contact-item">📞 ${member.phone}</div>
                    ${member.email ? `<div class="team-contact-item">✉️ ${member.email}</div>` : ''}
                </div>` : ''}
            </div>
        `).join('');
    }

    // Rendu de la galerie
    renderGallery(photos) {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = photos.map(photo => `
            <div class="gallery-item" data-category="${photo.categories.join(' ')}" onclick="openModal('${photo.slug}')">
                <div class="gallery-image">
                    <span class="gallery-image-icon">${photo.icon}</span>
                </div>
                <div class="gallery-info">
                    <p class="gallery-date">${this.formatDate(photo.date)}</p>
                    <h3>${photo.title}</h3>
                    <p class="gallery-description">${photo.description}</p>
                    <span class="gallery-tag">${photo.categories[0]}</span>
                </div>
            </div>
        `).join('');
    }

    // Rendu du plan d'action
    renderPlanAction(events) {
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;

        // Trier par date
        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        timeline.innerHTML = events.map((event, index) => `
            <div class="timeline-item">
                <div class="timeline-marker">${event.icon}</div>
                <div class="timeline-content">
                    <span class="timeline-date">${this.formatDate(event.date)}</span>
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    ${event.details ? `
                    <div class="event-details">
                        ${event.details}
                    </div>
                    ` : ''}
                    <div class="timeline-location">📍 ${event.location}</div>
                </div>
            </div>
        `).join('');
    }

    // Formatage des dates
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // Initialiser tout le contenu
    async init() {
        await Promise.all([
            this.loadBlogPosts(),
            this.loadTeamMembers(),
            this.loadGallery(),
            this.loadPlanAction()
        ]);
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    const loader = new APDContentLoader();
    loader.init();
});