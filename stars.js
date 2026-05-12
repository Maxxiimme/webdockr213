// stars.js - Générateur de fond étoilé animé

class Star {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5;
        this.speed = Math.random() * 0.05;
        this.opacity = Math.random();
    }
    draw() {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    update() {
        // Scintillement aléatoire
        this.opacity += (Math.random() - 0.5) * 0.05;
        if (this.opacity < 0.1) this.opacity = 0.1;
        if (this.opacity > 1) this.opacity = 1;
    }
}

let canvas, ctx, stars = [];

function resize() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

function initStars() {
    canvas = document.getElementById('star-canvas');
    if (!canvas) return; // Sécurité si le canvas n'existe pas sur la page
    ctx = canvas.getContext('2d');
    
    // Adapter à la taille de la fenêtre
    resize();
    
    // Créer les étoiles
    for (let i = 0; i < 200; i++) stars.push(new Star(canvas, ctx));
    
    // Lancer l'animation
    animate();
}

function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => { s.draw(); s.update(); });
    requestAnimationFrame(animate);
}

// Gérer le redimensionnement de la fenêtre
window.addEventListener('resize', resize);

// Lancer l'initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', initStars);