// crewmate.js - Le petit astronaute qui dérive dans l'espace

document.addEventListener('DOMContentLoaded', () => {

  const img = document.createElement('img');
  img.src = 'crewmate.png';
  img.id = 'crewmate';
  img.alt = 'crewmate';

  const style = document.createElement('style');
  style.textContent = `
    #crewmate {
      position: fixed;
      width: 80px;
      image-rendering: pixelated;
      z-index: 5;
      pointer-events: none;
      opacity: 0;
      transition: opacity 2s ease;
      filter: drop-shadow(0 0 6px rgba(100, 180, 255, 0.4));
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(img);

  // Paramètres de dérive
  const state = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,       // rotation actuelle (deg)
    targetAngle: 0, // rotation cible
    wobble: 0,      // oscillation douce
    wobbleSpeed: 0,
    scale: 1,
    flipped: false,
  };

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  function randomStart() {
    // Spawn sur un bord aléatoire
    const side = Math.floor(Math.random() * 4);
    const margin = 100;
    if (side === 0) { state.x = -100; state.y = Math.random() * H(); }       // gauche
    else if (side === 1) { state.x = W() + 100; state.y = Math.random() * H(); } // droite
    else if (side === 2) { state.x = Math.random() * W(); state.y = -100; }   // haut
    else { state.x = Math.random() * W(); state.y = H() + 100; }              // bas

    // Vitesse lente et douce
    const speed = 0.25 + Math.random() * 0.35;
    const angle = Math.random() * Math.PI * 2;
    state.vx = Math.cos(angle) * speed;
    state.vy = Math.sin(angle) * speed;

    // Légère rotation de départ
    state.angle = Math.random() * 360;
    state.targetAngle = state.angle + (Math.random() - 0.5) * 40;
    state.wobbleSpeed = 0.008 + Math.random() * 0.006;
    state.wobble = Math.random() * Math.PI * 2;
    state.scale = 0.85 + Math.random() * 0.3;
    state.flipped = Math.random() > 0.5;

    img.style.opacity = '0';
    setTimeout(() => { img.style.opacity = '0.85'; }, 100);
  }

  function isOutOfBounds() {
    const margin = 150;
    return (
      state.x < -margin || state.x > W() + margin ||
      state.y < -margin || state.y > H() + margin
    );
  }

  let lastSpawn = 0;
  const SPAWN_INTERVAL = 18000; // Réapparaît toutes les ~18s

  function tick(ts) {
    // Premier spawn après 3 secondes
    if (lastSpawn === 0 && ts > 3000) {
      randomStart();
      lastSpawn = ts;
    }

    // Re-spawn si sorti de l'écran et délai écoulé
    if (lastSpawn > 0 && isOutOfBounds()) {
      img.style.opacity = '0';
      if (ts - lastSpawn > SPAWN_INTERVAL) {
        randomStart();
        lastSpawn = ts;
      }
    }

    // Déplacement
    state.x += state.vx;
    state.y += state.vy;

    // Oscillation douce (comme en apesanteur)
    state.wobble += state.wobbleSpeed;
    const wobbleAngle = Math.sin(state.wobble) * 8;

    // Rotation qui tend doucement vers la cible
    state.angle += (state.targetAngle - state.angle) * 0.002;
    if (Math.abs(state.targetAngle - state.angle) < 0.5) {
      state.targetAngle = state.angle + (Math.random() - 0.5) * 60;
    }

    const finalAngle = state.angle + wobbleAngle;
    const scaleX = state.flipped ? -state.scale : state.scale;

    img.style.left = `${state.x - 40}px`;
    img.style.top  = `${state.y - 40}px`;
    img.style.transform = `rotate(${finalAngle}deg) scaleX(${scaleX / state.scale}) scale(${state.scale})`;

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
});
