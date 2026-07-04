/* ============================================================
   ModularToadAudio — main.js
   Interactive behaviors: PS2 background, clock, navigation,
   start menu, toast notifications, button sounds, mobile nav,
   desktop icons, hero water shader, mascot poke, synth cables
   ============================================================ */

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
    showToast('Boing! 🐸');
  }

  wrapper.addEventListener('click', poke);
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(); }
  });

  wrapper.addEventListener('animationend', (e) => {
    if (e.animationName === 'toadPoke') wrapper.classList.remove('poked');
  });
}

/* ── MODULAR SYNTH CABLES ────────────────────────────────────── */
function initSynthCables() {
  const svg = document.getElementById('synthCables');
  if (!svg) return;

  const mainWin = document.querySelector('.main-window');
  if (!mainWin) return;

  const NS = 'http://www.w3.org/2000/svg';

  // Cable color palette (modular synth cable colors)
  const CABLES = [
    { color: '#ff4444', w: 3.5 },
    { color: '#ffcc00', w: 3 },
    { color: '#44aaff', w: 3 },
    { color: '#ff8800', w: 3 },
    { color: '#cc44ff', w: 2.5 },
    { color: '#44ff88', w: 2.5 },
  ];

  // Create path + jack circle elements for each cable
  const cableEls = CABLES.map(c => {
    const path  = document.createElementNS(NS, 'path');
    const jack1 = document.createElementNS(NS, 'circle');
    const jack2 = document.createElementNS(NS, 'circle');

    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', c.color);
    path.setAttribute('stroke-width', c.w);
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('opacity', '0.65');
    path.style.filter = `drop-shadow(0 0 3px ${c.color}88)`;

    [jack1, jack2].forEach(j => {
      j.setAttribute('r', '5');
      j.setAttribute('fill', c.color);
      j.setAttribute('opacity', '0.8');
      j.style.filter = `drop-shadow(0 0 3px ${c.color})`;
    });

    svg.appendChild(path);
    svg.appendChild(jack1);
    svg.appendChild(jack2);
    return { path, jack1, jack2, color: c.color };
  });

  let mouseX = -9999, mouseY = -9999;
  let t = 0;

  document.addEventListener('mousemove', (e) => {
    const rect = mainWin.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }, { passive: true });

  function getCable(idx) {
    const w = mainWin.offsetWidth;
    const h = mainWin.offsetHeight;

    // Fixed endpoints as % of window — span hero to lower content
    const configs = [
      { x1: w*0.12, y1: 22,  x2: w*0.28, y2: h*0.44 },
      { x1: w*0.38, y1: 18,  x2: w*0.52, y2: h*0.52 },
      { x1: w*0.62, y1: 22,  x2: w*0.72, y2: h*0.60 },
      { x1: w*0.82, y1: 18,  x2: w*0.40, y2: h*0.72 },
      { x1: w*0.22, y1: 20,  x2: w*0.85, y2: h*0.48 },
      { x1: w*0.50, y1: 16,  x2: w*0.15, y2: h*0.65 },
    ];

    const c     = configs[idx];
    const phase = t + idx * 1.05;
    const sway  = Math.sin(phase) * 14;

    // Catenary-like hanging: control points sag below the line
    const midX = (c.x1 + c.x2) / 2;
    const midY = (c.y1 + c.y2) / 2;
    const sag  = Math.min(150, Math.sqrt((c.x2-c.x1)**2 + (c.y2-c.y1)**2) * 0.35);

    const cp1x = c.x1 + (midX - c.x1) * 0.4 + sway;
    const cp1y = c.y1 + sag * 1.1 + Math.sin(phase * 0.7) * 8;
    const cp2x = c.x2 + (midX - c.x2) * 0.4 - sway;
    const cp2y = c.y2 - sag * 0.3 + Math.cos(phase * 0.5) * 6;

    // Cursor repulsion (cables deflect away from mouse)
    const cx = (cp1x + cp2x) / 2;
    const cy = (cp1y + cp2y) / 2;
    const dx = cx - mouseX;
    const dy = cy - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const repulse = Math.max(0, 1 - dist / 90) * 28;
    const rx = (dx / dist) * repulse;
    const ry = (dy / dist) * repulse;

    return {
      d: `M ${c.x1} ${c.y1} C ${cp1x + rx} ${cp1y + ry} ${cp2x + rx} ${cp2y + ry} ${c.x2} ${c.y2}`,
      x1: c.x1, y1: c.y1, x2: c.x2, y2: c.y2,
    };
  }

  function animateCables() {
    t += 0.006;
    const w = mainWin.offsetWidth;
    if (w < 10) { requestAnimationFrame(animateCables); return; }

    cableEls.forEach((el, i) => {
      const c = getCable(i);
      el.path.setAttribute('d', c.d);
      el.jack1.setAttribute('cx', c.x1);
      el.jack1.setAttribute('cy', c.y1);
      el.jack2.setAttribute('cx', c.x2);
      el.jack2.setAttribute('cy', c.y2);
    });

    requestAnimationFrame(animateCables);
  }
  animateCables();
}

/* ── DESKTOP ICONS ───────────────────────────────────────────── */
function initDesktopIcons() {
  const icons = document.querySelectorAll('.desktop-icon');
  if (!icons.length) return;

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  icons.forEach(icon => {
    const href = icon.getAttribute('href') || '';
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
    const href = item.getAttribute('href') || '';
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

/* ── WIN98 TITLE-BAR BUTTONS (decorative easter eggs) ───────── */
function initWindowButtons() {
  const minimize = document.querySelector('.titlebar-btn.minimize');
  const maximize = document.querySelector('.titlebar-btn.maximize');
  const close    = document.querySelector('.titlebar-btn.close');

  if (minimize) {
    minimize.title = "Nice try 🐸";
    minimize.addEventListener('click', () => showToast("You can't minimize a toad! 🐸"));
  }
  if (maximize) {
    maximize.title = "Already maximized!";
    maximize.addEventListener('click', () => showToast("Window is already full-screen!"));
  }
  if (close) {
    close.title = "The toad stays! 🐸";
    close.addEventListener('click', () => showToast("The toad refuses to close. 🐸"));
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
      minWidth:   '220px',
      fontFamily: '"MS Sans Serif", Arial, sans-serif',
      fontSize:   '12px',
      animation:  'windowOpen .1s ease-out',
      display:    'flex',
    });

    const sidebar = document.createElement('div');
    Object.assign(sidebar.style, {
      background: 'linear-gradient(to top, #000080 0%, #1084d0 100%)',
      width:      '22px',
      display:    'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      padding:    '6px 0',
      flexShrink: '0',
    });
    const sideText = document.createElement('span');
    Object.assign(sideText.style, {
      color:       'rgba(255,255,255,.25)',
      fontSize:    '11px',
      fontWeight:  'bold',
      writingMode: 'vertical-rl',
      transform:   'rotate(180deg)',
      letterSpacing: '1px',
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
      padding:      '10px 12px',
      display:      'flex',
      alignItems:   'center',
      gap:          '8px',
      borderBottom: '1px solid #000060',
    });
    header.innerHTML = '<svg style="width:20px;height:20px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="9" r="4" fill="#52b788"/><circle cx="24" cy="9" r="4" fill="#52b788"/><circle cx="8" cy="9" r="2" fill="#000"/><circle cx="24" cy="9" r="2" fill="#000"/><ellipse cx="16" cy="19" rx="10.5" ry="8.5" fill="#52b788"/><ellipse cx="16" cy="20" rx="6.5" ry="5.5" fill="#95d5b2"/><path d="M11 23 Q16 26.5 21 23" stroke="#1b4332" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>'
      + '<span style="font-size:13px;font-weight:bold;line-height:1.3">Modular Toad<br>'
      + '<small style="font-size:10px;opacity:.8;font-weight:normal">Audio</small></span>';
    col.appendChild(header);

    const pages = [
      { icon: '🏠', label: 'Home',      href: 'index.html'    },
      { icon: '🎚️', label: 'Services',  href: 'services.html' },
      { icon: '🎬', label: 'Portfolio', href: 'portfolio.html' },
      { icon: '💰', label: 'Pricing',   href: 'pricing.html'  },
      { icon: '🐸', label: 'About',     href: 'about.html'    },
      { icon: '📧', label: 'Contact',   href: 'contact.html'  },
    ];

    pages.forEach(page => {
      const link = document.createElement('a');
      link.href = page.href;
      link.setAttribute('role', 'menuitem');
      Object.assign(link.style, {
        display:        'flex',
        alignItems:     'center',
        gap:            '10px',
        padding:        '8px 14px',
        color:          '#b8d4bc',
        textDecoration: 'none',
        borderBottom:   '1px solid #253025',
        transition:     'background .05s, color .05s',
      });
      link.innerHTML = `<span style="font-size:15px">${page.icon}</span>${page.label}`;
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
  const form = document.getElementById('contactForm');
  if (!form) return;

  const fileInput = document.getElementById('audioFile');
  const fileName  = document.getElementById('fileName');
  if (fileInput && fileName) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        const names = Array.from(fileInput.files).map(f => f.name).join(', ');
        fileName.textContent = names;
      } else {
        fileName.textContent = 'No file chosen';
      }
    });
  }

  form.addEventListener('submit', () => {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = '📨 Sending…';
      btn.disabled    = true;
    }
  });
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

/* ── INIT ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);

  initPS2Background();
  initHeroWaterShader();
  initMascotPoke();
  initSynthCables();
  initNavigation();
  initDesktopIcons();
  initWindowButtons();
  initStartMenu();
  initButtonSounds();
  initContactForm();
  initServiceCardSounds();
  initPageAnimation();
  initBootSequence();
});
