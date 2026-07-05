/* ============================================================
   ModularToadAudio — main.js
   Interactive behaviors: PS2 background, clock, navigation,
   start menu, toast notifications, button sounds, mobile nav,
   desktop icons, hero water shader, mascot poke, carousel
   ============================================================ */

const SITE_ASSETS = Object.freeze({
  mascot:    'images/ModularToadAudio.jpg',
  home:      'images/home/home.png',
  services:  'images/services/services.png',
  portfolio: 'images/portfolio/portfolio.svg',
  pricing:   'images/pricing/pricing.png',
  about:     'images/about/about.png',
  contact:   'images/contact/contact.png',
});

const PAGE_META = Object.freeze({
  'index.html':     { key: 'home',      label: 'Home',      icon: SITE_ASSETS.home       },
  'services.html':  { key: 'services',  label: 'Services',  icon: SITE_ASSETS.services   },
  'portfolio.html': { key: 'portfolio', label: 'Portfolio', icon: SITE_ASSETS.portfolio  },
  'pricing.html':   { key: 'pricing',   label: 'Pricing',   icon: SITE_ASSETS.pricing    },
  'about.html':     { key: 'about',     label: 'About',     icon: SITE_ASSETS.about      },
  'contact.html':   { key: 'contact',   label: 'Contact',   icon: SITE_ASSETS.contact    },
});

function normalisePageHref(href = '') {
  const clean = href.split('#')[0].split('?')[0];
  return clean || 'index.html';
}

function getPageMeta(href = '') {
  return PAGE_META[normalisePageHref(href)] || PAGE_META['index.html'];
}

function createIconImage(url, className) {
  const img = document.createElement('img');
  img.src = url;
  img.alt = '';
  img.className = className;
  img.decoding = 'async';
  img.loading = 'lazy';
  img.onerror = function () { this.style.display = 'none'; };
  return img;
}

function decorateIconChip(node, url, imageClass) {
  if (!node || node.dataset.iconApplied === 'true') return;
  node.textContent = '';
  node.appendChild(createIconImage(url, imageClass));
  node.dataset.iconApplied = 'true';
}

function initSharedBranding() {
  document.querySelectorAll('link[rel~="icon"]').forEach((link) => {
    link.setAttribute('href', SITE_ASSETS.mascot);
  });

  document.querySelectorAll('.brand-logo, .start-logo, .hero-mascot-img, .about-mascot-img').forEach((img) => {
    img.src = SITE_ASSETS.mascot;
  });

  document.querySelectorAll('.nav-item').forEach((item) => {
    if (item.querySelector('.nav-item-icon')) return;
    const meta = getPageMeta(item.getAttribute('href'));
    const iconWrap = document.createElement('span');
    iconWrap.className = 'nav-item-icon';
    iconWrap.setAttribute('aria-hidden', 'true');
    iconWrap.appendChild(createIconImage(meta.icon, 'nav-item-icon-image'));
    item.prepend(iconWrap);
  });

  const titlebarIcon = document.querySelector('.main-window > .window-titlebar .titlebar-icon');
  if (titlebarIcon) {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const meta = getPageMeta(currentFile);
    decorateIconChip(titlebarIcon, meta.icon, 'titlebar-icon-image');
    titlebarIcon.classList.add('titlebar-icon-thumb');
    titlebarIcon.dataset.iconKey = meta.key;
  }
}

/* ── CLOCK ──────────────────────────────────────────────────── */
function updateClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  el.textContent = `${h}:${m}`;
}

/* ── PS2 BIOS BACKGROUND CANVAS ─────────────────────────────── */
function initPS2Background() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const TOWER_COUNT = 30;
  const towers = [];

  function makeTower(scatterY) {
    const w = (1 + Math.floor(Math.random() * 2)) * 2;
    const h = (2 + Math.floor(Math.random() * 10)) * 4;
    const hue = 160 + Math.floor(Math.random() * 40);
    return {
      x:     Math.floor(Math.random() * W),
      y:     scatterY ? Math.random() * H : H + h,
      w, h,
      speed: 0.25 + Math.random() * 0.55,
      alpha: 0.07 + Math.random() * 0.15,
      hue,
    };
  }

  for (let i = 0; i < TOWER_COUNT; i++) towers.push(makeTower(true));

  const WAVE_COUNT = 6;
  const waves = [];
  for (let i = 0; i < WAVE_COUNT; i++) {
    waves.push({
      y:     Math.random() * H,
      speed: 0.15 + Math.random() * 0.25,
      alpha: 0.04 + Math.random() * 0.06,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    towers.forEach(t => {
      ctx.globalAlpha = t.alpha * 0.28;
      ctx.fillStyle = `hsl(${t.hue}, 85%, 65%)`;
      ctx.fillRect(t.x - 1, Math.floor(t.y) - 1, t.w + 2, t.h + 2);
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = `hsl(${t.hue}, 100%, 72%)`;
      ctx.fillRect(t.x, Math.floor(t.y), t.w, t.h);

      t.y -= t.speed;
      if (t.y + t.h < 0) {
        const fresh = makeTower(false);
        Object.assign(t, fresh);
      }
    });

    waves.forEach(w => {
      ctx.globalAlpha = w.alpha;
      ctx.fillStyle = 'hsl(185, 90%, 68%)';
      ctx.fillRect(0, Math.floor(w.y), W, 1);
      w.y -= w.speed;
      if (w.y < 0) { w.y = H; w.alpha = 0.04 + Math.random() * 0.06; }
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  draw();
}

/* ── HERO WATER RIPPLE SHADER ────────────────────────────────── */
function initHeroWaterShader() {
  const hero   = document.querySelector('.hero');
  const canvas = document.getElementById('heroWater');
  if (!hero || !canvas) return;

  const ctx       = canvas.getContext('2d');
  const SCALE     = 7;
  let W = 0, H = 0, simW = 0, simH = 0;
  let buf1 = null, buf2 = null;
  const simCanvas = document.createElement('canvas');
  const simCtx    = simCanvas.getContext('2d');

  function resize() {
    W    = hero.offsetWidth;
    H    = hero.offsetHeight;
    canvas.width  = W;
    canvas.height = H;
    simW = Math.max(2, Math.floor(W / SCALE));
    simH = Math.max(2, Math.floor(H / SCALE));
    simCanvas.width  = simW;
    simCanvas.height = simH;
    buf1 = new Float32Array(simW * simH);
    buf2 = new Float32Array(simW * simH);
  }

  function addDrop(x, y, r, strength) {
    const sx = Math.floor(x / SCALE);
    const sy = Math.floor(y / SCALE);
    const sr = Math.max(1, Math.ceil(r / SCALE));
    for (let dy = -sr; dy <= sr; dy++) {
      for (let dx = -sr; dx <= sr; dx++) {
        if (dx * dx + dy * dy <= sr * sr) {
          const nx = sx + dx, ny = sy + dy;
          if (nx >= 0 && nx < simW && ny >= 0 && ny < simH) {
            buf1[ny * simW + nx] += strength;
          }
        }
      }
    }
  }

  function step() {
    if (!buf1 || !buf2) return;
    const damp = 0.982;
    for (let y = 1; y < simH - 1; y++) {
      for (let x = 1; x < simW - 1; x++) {
        const i  = y * simW + x;
        buf2[i]  = (buf1[(y - 1) * simW + x] + buf1[(y + 1) * simW + x] +
                    buf1[y * simW + x - 1]   + buf1[y * simW + x + 1]) / 2 - buf2[i];
        buf2[i] *= damp;
      }
    }
    const tmp = buf1; buf1 = buf2; buf2 = tmp;
  }

  function render() {
    if (!buf1) return;
    const imgData = simCtx.createImageData(simW, simH);
    const d       = imgData.data;

    for (let y = 1; y < simH - 1; y++) {
      for (let x = 1; x < simW - 1; x++) {
        const i   = y * simW + x;
        const ddx = buf1[i + 1] - buf1[i - 1];
        const lgt = 128 + ddx * 7;
        const wave = Math.abs(buf1[i]);
        const pi  = i * 4;

        d[pi]     = Math.max(0, Math.min(255, lgt * 0.04 | 0));
        d[pi + 1] = Math.max(0, Math.min(255, (55 + lgt * 0.36) | 0));
        d[pi + 2] = Math.max(0, Math.min(255, (45 + lgt * 0.5)  | 0));
        d[pi + 3] = Math.max(0, Math.min(230, (wave * 18 + 15)  | 0));
      }
    }

    simCtx.putImageData(imgData, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(simCanvas, 0, 0, W, H);
  }

  resize();
  let _rsTimer;
  window.addEventListener('resize', () => {
    clearTimeout(_rsTimer);
    _rsTimer = setTimeout(resize, 200);
  }, { passive: true });

  // Ambient drips
  (function drip() {
    if (W && H) addDrop(Math.random() * W, Math.random() * H, 10, 22);
    setTimeout(drip, 900 + Math.random() * 2400);
  })();

  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    addDrop(e.clientX - r.left, e.clientY - r.top, 6, 50);
  }, { passive: true });

  hero.addEventListener('click', (e) => {
    const r = hero.getBoundingClientRect();
    addDrop(e.clientX - r.left, e.clientY - r.top, 24, 130);
  });

  // Touch support
  hero.addEventListener('touchmove', (e) => {
    const r  = hero.getBoundingClientRect();
    const t  = e.touches[0];
    addDrop(t.clientX - r.left, t.clientY - r.top, 8, 60);
  }, { passive: true });

  function loop() {
    step();
    render();
    requestAnimationFrame(loop);
  }
  loop();
}

/* ── MASCOT POKE ─────────────────────────────────────────────── */
function initMascotPoke() {
  const wrapper = document.getElementById('mascotWrapper');
  if (!wrapper) return;

  function poke() {
    wrapper.classList.remove('poked');
    void wrapper.offsetWidth; // force reflow
    wrapper.classList.add('poked');
    playBlip(380, 0.12, 'sine', 0.09);
    showToast('Logo pulse engaged.');
  }

  wrapper.addEventListener('click', poke);
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(); }
  });

  wrapper.addEventListener('animationend', (e) => {
    if (e.animationName === 'toadPoke') wrapper.classList.remove('poked');
  });
}

/* ── DESKTOP ICONS ───────────────────────────────────────────── */
function initDesktopIcons() {
  const icons = document.querySelectorAll('.desktop-icon');
  if (!icons.length) return;

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  icons.forEach(icon => {
    const href = normalisePageHref(icon.getAttribute('href') || '');
    const meta = getPageMeta(href);
    const chip = icon.querySelector('.desktop-icon-emoji');
    icon.dataset.iconKey = meta.key;
    if (chip) {
      chip.classList.add('desktop-icon-thumb');
      chip.dataset.iconKey = meta.key;
      decorateIconChip(chip, meta.icon, 'desktop-icon-image');
    }
    if (href === currentFile || (currentFile === '' && href === 'index.html')) {
      icon.classList.add('icon-active');
    }

    icon.addEventListener('mouseenter', () => playBlip(660, 0.025, 'sine', 0.02));

    icon.addEventListener('click', () => {
      icons.forEach(i => i.classList.remove('icon-active'));
      icon.classList.add('icon-active');
      playBlip(880, 0.05, 'square', 0.04);
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.desktop-icon')) {
      const cur = window.location.pathname.split('/').pop() || 'index.html';
      icons.forEach(i => {
        const h = i.getAttribute('href') || '';
        if (h !== cur && !(cur === '' && h === 'index.html')) {
          i.classList.remove('icon-active');
        }
      });
    }
  });
}

/* ── NAVIGATION ─────────────────────────────────────────────── */
function initNavigation() {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-item').forEach(item => {
    const href = normalisePageHref(item.getAttribute('href') || '');
    const match = href === currentFile || (currentFile === '' && href === 'index.html');
    item.classList.toggle('active', match);
  });

  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.textContent = open ? '✕' : '☰';
      toggle.setAttribute('aria-expanded', String(open));
    });

    menu.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.textContent = '☰';
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (menu.classList.contains('open') && !menu.contains(e.target) && e.target !== toggle) {
        menu.classList.remove('open');
        toggle.textContent = '☰';
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* ── BULL TOAD EXPLOSION EASTER EGG ─────────────────────────── */
function triggerBullToadExplosion() {
  if (document.getElementById('bullToadOverlay')) return;

  // ── OVERLAY ──────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'bullToadOverlay';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', zIndex: '999999',
    background: 'transparent', overflow: 'hidden', pointerEvents: 'all',
  });
  document.body.appendChild(overlay);

  // ── CAPTURE ALL VISIBLE ELEMENTS ─────────────────────────────
  const allEls = Array.from(document.querySelectorAll('*')).filter(el => {
    if (el === overlay || overlay.contains(el)) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    const st = window.getComputedStyle(el);
    if (st.visibility === 'hidden' || st.display === 'none' || parseFloat(st.opacity) < 0.05) return false;
    return true;
  });

  // Hide all DOM elements
  const savedStyles = allEls.map(el => ({
    el,
    visibility: el.style.visibility,
    opacity: el.style.opacity,
    transition: el.style.transition,
  }));
  allEls.forEach(el => { el.style.visibility = 'hidden'; });

  // ── SHARD CANVAS ─────────────────────────────────────────────
  const shardCanvas = document.createElement('canvas');
  const W = window.innerWidth, H = window.innerHeight;
  shardCanvas.width = W; shardCanvas.height = H;
  Object.assign(shardCanvas.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%', zIndex: '1',
  });
  overlay.appendChild(shardCanvas);
  const shardCtx = shardCanvas.getContext('2d');

  // ── GENERATE SHARDS FROM EACH ELEMENT ────────────────────────
  const shards = [];
  const CX = W / 2, CY = H / 2;

  function getElementColor(el) {
    const st = window.getComputedStyle(el);
    const bg = st.backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
    const bc = st.borderColor;
    if (bc && bc !== 'rgba(0, 0, 0, 0)') return bc;
    return st.color || '#4488cc';
  }

  allEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) return;
    const color = getElementColor(el);
    const area = rect.width * rect.height;
    const numShards = Math.max(2, Math.min(12, Math.round(area / 4000)));

    for (let i = 0; i < numShards; i++) {
      // Random triangle within element bounding box
      const pts = Array.from({ length: 3 }, () => ({
        x: rect.left + Math.random() * rect.width,
        y: rect.top  + Math.random() * rect.height,
      }));
      const cx = (pts[0].x + pts[1].x + pts[2].x) / 3;
      const cy = (pts[0].y + pts[1].y + pts[2].y) / 3;

      // Velocity radiates outward from page centre + random spin
      const dx = cx - CX, dy = cy - CY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = 4 + Math.random() * 14;
      shards.push({
        pts: pts.map(p => ({ x: p.x - cx, y: p.y - cy })),
        cx, cy,
        vx: (dx / dist) * speed + (Math.random() - 0.5) * 4,
        vy: (dy / dist) * speed + (Math.random() - 0.5) * 4 - 3,
        vr: (Math.random() - 0.5) * 0.25,
        r: 0,
        alpha: 1,
        color,
        gravity: 0.18 + Math.random() * 0.12,
      });
    }

    // Bright spark particles
    const sparks = Math.max(3, Math.min(8, Math.round(area / 8000)));
    for (let i = 0; i < sparks; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd   = 5 + Math.random() * 16;
      shards.push({
        pts: null,
        cx: rect.left + Math.random() * rect.width,
        cy: rect.top  + Math.random() * rect.height,
        size: 2 + Math.random() * 5,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 6,
        vr: 0, r: 0,
        alpha: 1,
        color: `hsl(${Math.random() * 60 + 20},100%,${60 + Math.random() * 30}%)`,
        gravity: 0.25 + Math.random() * 0.15,
      });
    }
  });

  // ── ANIMATE SHARDS ───────────────────────────────────────────
  let explodeStart = null;
  const EXPLODE_HOLD = 1200;   // ms shards fly freely
  const EXPLODE_FADE = 1000;   // ms shards fade out

  function animShards(ts) {
    if (!explodeStart) explodeStart = ts;
    const elapsed = ts - explodeStart;
    shardCtx.clearRect(0, 0, W, H);

    const fadeFraction = Math.max(0, Math.min(1, (elapsed - EXPLODE_HOLD) / EXPLODE_FADE));

    shards.forEach(s => {
      s.cx += s.vx;
      s.cy += s.vy;
      s.vy += s.gravity;
      s.vx *= 0.995;
      s.r  += s.vr;

      const a = s.alpha * (1 - fadeFraction);
      if (a < 0.01) return;

      shardCtx.save();
      shardCtx.globalAlpha = a;
      shardCtx.translate(s.cx, s.cy);
      shardCtx.rotate(s.r);

      if (s.pts) {
        shardCtx.fillStyle = s.color;
        shardCtx.beginPath();
        shardCtx.moveTo(s.pts[0].x, s.pts[0].y);
        shardCtx.lineTo(s.pts[1].x, s.pts[1].y);
        shardCtx.lineTo(s.pts[2].x, s.pts[2].y);
        shardCtx.closePath();
        shardCtx.fill();
        // Electric edge glow
        shardCtx.shadowBlur = 8;
        shardCtx.shadowColor = 'rgba(120,220,255,0.9)';
        shardCtx.strokeStyle = 'rgba(160,230,255,0.7)';
        shardCtx.lineWidth = 0.8;
        shardCtx.stroke();
      } else {
        shardCtx.shadowBlur = 12;
        shardCtx.shadowColor = s.color;
        shardCtx.fillStyle = s.color;
        shardCtx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size);
      }
      shardCtx.restore();
    });

    if (elapsed < EXPLODE_HOLD + EXPLODE_FADE) {
      requestAnimationFrame(animShards);
    }
  }
  requestAnimationFrame(animShards);

  // ── BULLFROG IMAGE ───────────────────────────────────────────
  const frogImg = document.createElement('img');
  frogImg.src = 'images/bullfrog.jpeg';
  frogImg.alt = 'The Bull Toad';
  Object.assign(frogImg.style, {
    position: 'absolute', left: '50%', top: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '55vw', maxHeight: '55vh',
    objectFit: 'contain',
    opacity: '0',
    transition: 'opacity 2s ease-in',
    borderRadius: '8px',
    zIndex: '2',
    boxShadow: '0 0 60px 20px rgba(255,100,0,0.5)',
    filter: 'drop-shadow(0 0 20px rgba(255,120,0,0.8))',
  });
  overlay.appendChild(frogImg);

  // Start frog fade-in shortly after explosion begins
  setTimeout(() => {
    frogImg.style.opacity = '1';

    // Once frog is fully visible, show flame text
    setTimeout(() => {
      const flameCanvas = _createFlameTextCanvas(W, H);
      flameCanvas.style.zIndex = '3';
      overlay.appendChild(flameCanvas);

      // After flame text plays, reform the site
      setTimeout(() => {
        _reformSite(overlay, savedStyles);
      }, 3500);
    }, 2050);
  }, 600);
}

/* ── PROCEDURAL FIRE TEXT SHADER ────────────────────────────── */
function _createFlameTextCanvas(W, H) {
  const canvas = document.createElement('canvas');
  const SCALE = 3;
  const fw = Math.ceil(W / SCALE);
  const fh = Math.ceil(Math.min(H * 0.4, 240) / SCALE);
  canvas.width  = W;
  canvas.height = fh * SCALE;
  Object.assign(canvas.style, {
    position: 'absolute',
    left: '0',
    bottom: '8%',
    width: '100%',
    height: `${fh * SCALE}px`,
  });

  const ctx = canvas.getContext('2d');

  // Render text mask at low res
  const textCanvas = document.createElement('canvas');
  textCanvas.width  = fw;
  textCanvas.height = fh;
  const tctx = textCanvas.getContext('2d');
  tctx.fillStyle = '#000';
  tctx.fillRect(0, 0, fw, fh);
  tctx.fillStyle = '#fff';
  const fontSize = Math.max(8, Math.floor(fh * 0.38));
  tctx.font = `bold ${fontSize}px "Oxanium", "Arial Black", sans-serif`;
  tctx.textAlign = 'center';
  tctx.textBaseline = 'middle';

  // Wrap long text if needed
  const line1 = 'YOU HAVE AWOKEN';
  const line2 = 'THE BULL TOAD';
  tctx.fillText(line1, fw / 2, fh * 0.35);
  tctx.fillText(line2, fw / 2, fh * 0.72);

  const tdata = tctx.getImageData(0, 0, fw, fh).data;
  const mask  = new Uint8Array(fw * fh);
  for (let i = 0; i < fw * fh; i++) mask[i] = tdata[i * 4] > 60 ? 1 : 0;

  // Fire simulation buffers
  let fire    = new Float32Array(fw * fh);
  let fireBuf = new Float32Array(fw * fh);

  // Temporary small canvas for putImageData
  const tmpC = document.createElement('canvas');
  tmpC.width  = fw;
  tmpC.height = fh;
  const tmpCtx = tmpC.getContext('2d');

  let frame = 0;
  let running = true;

  function step() {
    if (!running) return;

    // Seed heat at text pixels each frame (bottom-up fire source)
    for (let i = 0; i < fw * fh; i++) {
      if (mask[i]) fire[i] = Math.min(255, fire[i] + 30 + Math.random() * 80);
    }

    // Cool & diffuse upward (y=0 is top)
    for (let y = 0; y < fh - 1; y++) {
      for (let x = 0; x < fw; x++) {
        const c  = fire[(y + 1) * fw + x];
        const l  = fire[(y + 1) * fw + Math.max(0, x - 1)];
        const r2 = fire[(y + 1) * fw + Math.min(fw - 1, x + 1)];
        const u  = y + 2 < fh ? fire[(y + 2) * fw + x] : c;
        fireBuf[y * fw + x] = ((c + l + r2 + u) * 0.245) * 0.97;
      }
    }
    // Bottom row stays seeded
    for (let x = 0; x < fw; x++) {
      fireBuf[(fh - 1) * fw + x] = fire[(fh - 1) * fw + x] * 0.97;
    }
    [fire, fireBuf] = [fireBuf, fire];

    // Draw palette: black → red → orange → yellow → white
    const imgData = tmpCtx.createImageData(fw, fh);
    const d = imgData.data;
    for (let i = 0; i < fw * fh; i++) {
      const v = fire[i];
      let rr = 0, gg = 0, bb = 0, aa = 0;
      if (v > 0) {
        rr = Math.min(255, v * 3.5);
        gg = Math.min(255, Math.max(0, v * 2.2 - 80));
        bb = Math.min(255, Math.max(0, v * 1.5 - 160));
        aa = Math.min(255, v * 2.5);
        // Add flicker noise
        const noise = (Math.random() - 0.5) * 18;
        rr = Math.min(255, Math.max(0, rr + noise));
        gg = Math.min(255, Math.max(0, gg + noise * 0.5));
      }
      d[i * 4 + 0] = rr;
      d[i * 4 + 1] = gg;
      d[i * 4 + 2] = bb;
      d[i * 4 + 3] = aa;
    }
    tmpCtx.putImageData(imgData, 0, 0);

    ctx.clearRect(0, 0, W, fh * SCALE);
    // Draw scaled-up fire (pixelated look)
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tmpC, 0, 0, W, fh * SCALE);

    // Draw text label on top (sharp, with ember glow)
    ctx.save();
    ctx.shadowBlur = 20 + Math.sin(frame * 0.15) * 8;
    ctx.shadowColor = `hsl(${30 + Math.sin(frame * 0.1) * 15},100%,55%)`;
    const dispFontSize = Math.max(16, Math.floor(fh * SCALE * 0.38));
    ctx.font = `bold ${dispFontSize}px "Oxanium", "Arial Black", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Flaming gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, fh * SCALE);
    grad.addColorStop(0,   '#fffbe0');
    grad.addColorStop(0.3, '#ffdd00');
    grad.addColorStop(0.6, '#ff6a00');
    grad.addColorStop(1,   '#cc1a00');
    ctx.fillStyle = grad;
    ctx.fillText(line1, W / 2, fh * SCALE * 0.35);
    ctx.fillText(line2, W / 2, fh * SCALE * 0.72);
    ctx.restore();

    frame++;
    requestAnimationFrame(step);
  }

  step();

  // Expose stop method for cleanup
  canvas._stopFire = () => { running = false; };
  return canvas;
}

/* ── SITE REFORM ────────────────────────────────────────────── */
function _reformSite(overlay, savedStyles) {
  // Stop any fire shader
  overlay.querySelectorAll('canvas').forEach(c => { if (c._stopFire) c._stopFire(); });

  // Fade out overlay
  overlay.style.transition = 'opacity 0.8s ease-out';
  overlay.style.opacity = '0';

  // Restore elements with a staggered fade-in
  savedStyles.forEach(({ el, visibility, opacity, transition }, i) => {
    el.style.visibility = visibility;
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.6s ease-in';
    setTimeout(() => {
      el.style.opacity = opacity || '';
      setTimeout(() => {
        el.style.transition = transition;
      }, 700);
    }, 50 + (i % 20) * 15);
  });

  setTimeout(() => {
    overlay.remove();
  }, 900);
}

/* ── WIN98 TITLE-BAR BUTTONS (decorative easter eggs) ───────── */
function initWindowButtons() {
  const minimize = document.querySelector('.titlebar-btn.minimize');
  const maximize = document.querySelector('.titlebar-btn.maximize');
  const close    = document.querySelector('.titlebar-btn.close');

  if (minimize) {
    minimize.title = "Classic window control";
    minimize.addEventListener('click', () => showToast('Minimize is disabled in this layout.'));
  }
  if (maximize) {
    maximize.title = "Already maximized!";
    maximize.addEventListener('click', () => showToast("Window is already full-screen!"));
  }
  if (close) {
    close.title = "DO NOT PRESS";
    close.addEventListener('click', triggerBullToadExplosion);
  }
}

/* ── PIXEL TOAST NOTIFICATION ───────────────────────────────── */
function showToast(message, duration = 2600) {
  const existing = document.getElementById('pixelToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'pixelToast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  Object.assign(toast.style, {
    position:   'fixed',
    bottom:     '48px',
    right:      '14px',
    background: '#1a2218',
    border:     '2px solid',
    borderColor:'#3a5040 #070c08 #070c08 #3a5040',
    padding:    '8px 14px',
    fontFamily: '"MS Sans Serif", Arial, sans-serif',
    fontSize:   '12px',
    color:      '#b8d4bc',
    zIndex:     '9999',
    boxShadow:  '2px 2px 0 #040604',
    maxWidth:   '260px',
    lineHeight: '1.5',
    animation:  'windowOpen .1s ease-out',
  });
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

/* ── START MENU ─────────────────────────────────────────────── */
function initStartMenu() {
  const startBtn = document.getElementById('startBtn');
  if (!startBtn) return;

  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const existing = document.getElementById('startMenu');
    if (existing) { existing.remove(); return; }

    const menu = document.createElement('nav');
    menu.id = 'startMenu';
    menu.setAttribute('role', 'menu');
    Object.assign(menu.style, {
      position:   'fixed',
      bottom:     '44px',
      left:       '0',
      background: '#1a2218',
      border:     '2px solid',
      borderColor:'#3a5040 #070c08 #070c08 #3a5040',
      boxShadow:  '3px 3px 0 #040604',
      zIndex:     '9999',
      minWidth:   '248px',
      fontFamily: '"MS Sans Serif", Arial, sans-serif',
      fontSize:   '12px',
      animation:  'windowOpen .1s ease-out',
      display:    'flex',
    });

    const sidebar = document.createElement('div');
    Object.assign(sidebar.style, {
      background: 'linear-gradient(to top, #000080 0%, #1084d0 100%)',
      width:      '30px',
      display:    'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding:    '10px 0',
      flexShrink: '0',
    });
    const sideText = document.createElement('span');
    Object.assign(sideText.style, {
      color:       'rgba(255,255,255,.25)',
      fontSize:    '10px',
      fontWeight:  'bold',
      writingMode: 'vertical-rl',
      transform:   'rotate(180deg)',
      letterSpacing: '1.6px',
      lineHeight:  '1.2',
      userSelect:  'none',
      fontFamily:  '"MS Sans Serif", Arial, sans-serif',
    });
    sideText.textContent = 'ModularToadAudio';
    sidebar.appendChild(sideText);
    menu.appendChild(sidebar);

    const col = document.createElement('div');
    col.style.flex = '1';

    const header = document.createElement('div');
    Object.assign(header.style, {
      background:   'linear-gradient(to bottom, #000080, #1084d0)',
      color:        '#fff',
      padding:      '12px 14px',
      display:      'flex',
      alignItems:   'center',
      gap:          '10px',
      borderBottom: '1px solid #000060',
    });
    header.innerHTML = `<img src="${SITE_ASSETS.mascot}" alt="" style="width:24px;height:24px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,.35)">`
      + '<span style="font-size:13px;font-weight:bold;line-height:1.3">Modular Toad<br>'
      + '<small style="font-size:10px;opacity:.8;font-weight:normal">Audio</small></span>';
    col.appendChild(header);

    const pages = [
      { icon: SITE_ASSETS.home,      label: 'Home',      href: 'index.html'     },
      { icon: SITE_ASSETS.services,  label: 'Services',  href: 'services.html'  },
      { icon: SITE_ASSETS.portfolio, label: 'Portfolio', href: 'portfolio.html' },
      { icon: SITE_ASSETS.pricing,   label: 'Pricing',   href: 'pricing.html'   },
      { icon: SITE_ASSETS.about,     label: 'About',     href: 'about.html'     },
      { icon: SITE_ASSETS.contact,   label: 'Contact',   href: 'contact.html'   },
    ];

    pages.forEach(page => {
      const link = document.createElement('a');
      link.href = page.href;
      link.setAttribute('role', 'menuitem');
      Object.assign(link.style, {
        display:        'flex',
        alignItems:     'center',
        gap:            '12px',
        padding:        '10px 16px',
        color:          '#b8d4bc',
        textDecoration: 'none',
        borderBottom:   '1px solid #253025',
        transition:     'background .05s, color .05s',
      });
      link.innerHTML = `<span style="width:18px;height:18px;border-radius:5px;overflow:hidden;display:inline-flex;box-shadow:0 0 0 1px rgba(255,255,255,.16)"><img src="${page.icon}" alt="" style="width:100%;height:100%;object-fit:cover"></span>${page.label}`;
      link.addEventListener('mouseenter', () => {
        link.style.background = '#000080';
        link.style.color      = '#fff';
        playBlip(660, 0.03, 'square', 0.03);
      });
      link.addEventListener('mouseleave', () => {
        link.style.background = '';
        link.style.color      = '#b8d4bc';
      });
      col.appendChild(link);
    });

    menu.appendChild(col);
    document.body.appendChild(menu);

    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 20);
  });
}

/* ── RETRO SOUND EFFECTS (Web Audio API) ────────────────────── */
let _audioCtx = null;

function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}

function playBlip(freq = 880, dur = 0.045, type = 'square', vol = 0.05) {
  try {
    const ctx  = getAudioCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch (_) { /* audio unavailable */ }
}

function initButtonSounds() {
  document.addEventListener('pointerdown', function bootstrap() {
    document.querySelectorAll('.btn, .btn-secondary, .btn-primary, .nav-item').forEach(el => {
      el.addEventListener('pointerdown', () => playBlip(660, 0.04));
    });
    document.removeEventListener('pointerdown', bootstrap);
  }, { once: true });
}

/* ── CONTACT FORM HANDLING ──────────────────────────────────── */
function initContactForm() {
  // The contact form uses a mailto: action and submits natively via the
  // browser's email client — no JavaScript handling required.
}

/* ── SERVICE CARD HOVER SOUND ───────────────────────────────── */
function initServiceCardSounds() {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => playBlip(990, 0.025, 'sine', 0.03));
  });
}

/* ── PAGE ENTRY ANIMATION RESET ─────────────────────────────── */
function initPageAnimation() {
  const win = document.querySelector('.main-window');
  if (win) {
    win.style.animationName = 'none';
    requestAnimationFrame(() => {
      win.style.animationName = 'windowOpen';
    });
  }
}

/* ── RANDOM HOMEPAGE CTA BLURB ───────────────────────────────── */
function initRandomCtaBlurb() {
  const ctaHeading = document.querySelector('#cta-heading.random-cta-text');
  if (!ctaHeading) return;
  const blurbs = [
    'Ready for Toad?',
    "Oh, it's Chumby Time",
    'Let Me Ruin Your Music',
    'BEHOLD THE WIZARD',
    "Let's get creative",
    'What If We Shared Lilly Pads 🐸',
    "Uh oh, there's a frog in my mix?!",
    'Who Put This Toad In My Mix?',
    "LΞT'S GΞT MODULAR",
    'Go For Chumby',
    'Better Call Chumby',
  ];
  const randomIndex = Math.floor(Math.random() * blurbs.length);
  ctaHeading.textContent = blurbs[randomIndex];
}

/* ── BOOT SEQUENCE TYPING (hero title only) ─────────────────── */
function initBootSequence() {
  const heroTitle = document.getElementById('heroTitle');
  if (!heroTitle) return;
  const fullText = heroTitle.textContent.trim();
  heroTitle.textContent = '';
  heroTitle.classList.add('blink-cursor');

  let i = 0;
  const interval = setInterval(() => {
    heroTitle.textContent += fullText[i];
    i++;
    if (i >= fullText.length) {
      clearInterval(interval);
      heroTitle.classList.remove('blink-cursor');
    }
  }, 60);
}


/* ── HOMEPAGE PORTFOLIO CAROUSEL ───────────────────────────── */
async function initPortfolioPreviewCarousel() {
  const carousel = document.getElementById('portfolioPreviewCarousel');
  const track = document.getElementById('portfolioPreviewTrack');
  if (!carousel || !track) return;

  const status = document.createElement('p');
  status.id = 'portfolioPreviewStatus';
  status.className = 'portfolio-preview-status';
  status.setAttribute('aria-live', 'polite');
  carousel.appendChild(status);

  const prettyCategory = (category = '') => {
    const map = {
      all: 'All',
      'mix-master': 'Mix & Master',
      submission: 'Submission',
    };
    return map[category] || category.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getVideoId = (src = '') => {
    const match = src.match(/embed\/([^?&/]+)/);
    return match ? match[1] : '';
  };

  const slugify = (value = '') => value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const swapIndex = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[swapIndex]] = [copy[swapIndex], copy[i]];
    }
    return copy;
  };

  try {
    const res = await fetch('portfolio.html', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load portfolio');
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const cards = Array.from(doc.querySelectorAll('#portfolioGrid .portfolio-item'));

    const items = cards.map((card, idx) => {
      const title = card.querySelector('.titlebar-title')?.textContent?.trim() || `Submission ${idx + 1}`;
      const category = card.dataset.category || 'submission';
      const iframe = card.querySelector('iframe');
      const src = iframe?.getAttribute('src') || '';
      const videoId = getVideoId(src);
      const summary = card.querySelector('div[style*="font-size:11px"]')?.textContent?.replace(/\s+/g, ' ').trim()
        || `${prettyCategory(category)} showcase`;
      const cover = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
      const anchorId = card.id || slugify(title) || `submission-${idx + 1}`;
      const destination = `portfolio.html#${anchorId}`;
      return { title, category, src, videoId, summary, cover, destination };
    }).filter(item => item.title);

    if (!items.length) {
      track.innerHTML = '<p class="portfolio-preview-empty">Portfolio submissions will appear here automatically.</p>';
      status.textContent = 'Portfolio preview unavailable.';
      return;
    }

    const previewItems = shuffle(items).slice(0, Math.min(3, items.length));

    track.innerHTML = previewItems.map((item, idx) => `
      <a class="portfolio-preview-slide window" href="${item.destination}" aria-label="Open ${item.title} in the portfolio">
        <div class="portfolio-preview-cover"${item.cover ? ` style="background-image:linear-gradient(180deg, rgba(5, 9, 19, 0.08), rgba(5, 9, 19, 0.92)), url('${item.cover}')"` : ''}>
          <span class="portfolio-preview-chip">${prettyCategory(item.category)}</span>
          <span class="portfolio-preview-count">${String(idx + 1).padStart(2, '0')}</span>
        </div>
        <div class="portfolio-preview-body">
          <h3 class="portfolio-preview-title">${item.title}</h3>
          <p class="portfolio-preview-summary">${item.summary}</p>
          <div class="portfolio-preview-actions">
            <span class="btn btn-secondary portfolio-preview-link">Open in Portfolio</span>
            ${item.videoId ? `<span class="btn btn-primary portfolio-preview-link">Jump to Track</span>` : ''}
          </div>
        </div>
      </a>
    `).join('');
    status.textContent = `${previewItems.length} random portfolio picks loaded.`;
  } catch (_) {
    track.innerHTML = '<p class="portfolio-preview-empty">Portfolio preview is temporarily unavailable.</p>';
    status.textContent = 'Portfolio preview unavailable.';
  }
}

/* ── INIT ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const inits = [
    () => { updateClock(); setInterval(updateClock, 1000); },
    initSharedBranding,
    initPS2Background,
    initHeroWaterShader,
    initMascotPoke,
    initNavigation,
    initDesktopIcons,
    initWindowButtons,
    initStartMenu,
    initButtonSounds,
    initContactForm,
    initServiceCardSounds,
    initPageAnimation,
    initRandomCtaBlurb,
    initBootSequence,
    initPortfolioPreviewCarousel,
  ];
  inits.forEach(fn => {
    try { fn(); } catch (err) { console.error(fn.name, err); }
  });
});
