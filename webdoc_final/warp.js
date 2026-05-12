// warp.js - Transition supra-luminique

(function () {

  // Overlay de transition
  const overlay = document.createElement('div');
  overlay.id = 'warp-overlay';
  overlay.innerHTML = `
    <canvas id="warp-canvas"></canvas>
    <div id="warp-flash"></div>
  `;
  document.body.appendChild(overlay);

  // Styles injectés
  const style = document.createElement('style');
  style.textContent = `
    #warp-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
    }
    #warp-overlay.active {
      pointer-events: all;
    }
    #warp-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      background: #000;
    }
    #warp-flash {
      position: absolute;
      inset: 0;
      background: white;
      opacity: 0;
      transition: none;
    }
  `;
  document.head.appendChild(style);

  const warpCanvas = document.getElementById('warp-canvas');
  const warpCtx = warpCanvas.getContext('2d');
  const flash = document.getElementById('warp-flash');

  let animFrame = null;
  let startTime = null;
  let destination = null;
  const DURATION = 1600; // ms total de l'animation

  // Particules de warp (étoiles qui s'étirent)
  const particles = [];
  const PARTICLE_COUNT = 300;

  function initParticles() {
    particles.length = 0;
    const cx = warpCanvas.width / 2;
    const cy = warpCanvas.height / 2;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.hypot(cx, cy) * 0.6 + 20;
      particles.push({
        angle,
        dist,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        speed: Math.random() * 3 + 1.5,
        length: Math.random() * 2 + 1,
        brightness: Math.random() * 0.5 + 0.5,
      });
    }
  }

  function drawWarp(progress) {
    const W = warpCanvas.width;
    const H = warpCanvas.height;
    const cx = W / 2;
    const cy = H / 2;

    // Phase 1 (0→0.6) : accélération - étoiles s'étirent
    // Phase 2 (0.6→1) : flash + disparition

    // Fond qui s'assombrit puis se blanchit
    let bgAlpha;
    if (progress < 0.6) {
      bgAlpha = 0.25 + progress * 0.2; // traînes de plus en plus longues
    } else {
      bgAlpha = 0.05;
    }

    warpCtx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
    warpCtx.fillRect(0, 0, W, H);

    const speedMult = progress < 0.6
      ? easeIn(progress / 0.6) * 15
      : 15 + easeIn((progress - 0.6) / 0.4) * 60;

    const trailMult = progress < 0.6
      ? 1 + easeIn(progress / 0.6) * 8
      : 9 + easeIn((progress - 0.6) / 0.4) * 40;

    particles.forEach(p => {
      // Déplacement radial depuis le centre
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / dist;
      const ny = dy / dist;

      p.x += nx * p.speed * speedMult;
      p.y += ny * p.speed * speedMult;

      // Recycle si hors écran
      if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 30 + 5;
        p.x = cx + Math.cos(angle) * r;
        p.y = cy + Math.sin(angle) * r;
        p.speed = Math.random() * 3 + 1.5;
      }

      // Traîne
      const tailLength = p.length * trailMult;
      const tailX = p.x - nx * tailLength;
      const tailY = p.y - ny * tailLength;

      const bright = p.brightness;
      let color;
      if (progress < 0.4) {
        color = `rgba(255, 255, 255, ${bright})`;
      } else if (progress < 0.7) {
        const t = (progress - 0.4) / 0.3;
        const r = Math.round(255);
        const g = Math.round(255 - t * 80);
        const b = Math.round(255 - t * 40);
        color = `rgba(${r}, ${g}, ${b}, ${bright})`;
      } else {
        color = `rgba(220, 240, 255, ${bright})`;
      }

      const grad = warpCtx.createLinearGradient(tailX, tailY, p.x, p.y);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, color);

      warpCtx.beginPath();
      warpCtx.moveTo(tailX, tailY);
      warpCtx.lineTo(p.x, p.y);
      warpCtx.strokeStyle = grad;
      warpCtx.lineWidth = 1.5;
      warpCtx.stroke();
    });

    // Flash lumineux sur la fin
    if (progress > 0.75) {
      const fp = (progress - 0.75) / 0.25;
      const alpha = easeIn(fp) * 0.9;
      warpCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      warpCtx.fillRect(0, 0, W, H);
    }
  }

  function easeIn(t) {
    return t * t * t;
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function resizeWarpCanvas() {
    warpCanvas.width = window.innerWidth;
    warpCanvas.height = window.innerHeight;
  }

  function startWarp(href) {
    destination = href;
    overlay.style.opacity = '1';
    overlay.classList.add('active');
    resizeWarpCanvas();
    initParticles();
    startTime = null;

    function tick(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / DURATION, 1);

      drawWarp(progress);

      if (progress < 1) {
        animFrame = requestAnimationFrame(tick);
      } else {
        // Navigue vers la destination
        window.location.href = destination;
      }
    }

    animFrame = requestAnimationFrame(tick);
  }

  // Intercepter tous les clics sur les .node
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a.node').forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        startWarp(href);
      });
    });
  });

  window.addEventListener('resize', resizeWarpCanvas);

})();
