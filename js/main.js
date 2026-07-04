/* ============================================================
   ModularToadAudio — main.js
   Interactive behaviors: PS2 background, clock, navigation,
   start menu, toast notifications, button sounds, mobile nav,
   desktop icons
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

  // Tower blocks — pixel-snapped widths/heights, slow upward drift
  const TOWER_COUNT = 30;
  const towers = [];

  function makeTower(scatterY) {
    const w = (1 + Math.floor(Math.random() * 2)) * 2;           // 2 or 4 px
    const h = (2 + Math.floor(Math.random() * 10)) * 4;          // 8–44 px
    const hue = 160 + Math.floor(Math.random() * 40);             // 160–200 (teal-cyan-blue)
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

  // Horizontal wave lines (PS2 ripple effect)
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

    // Draw tower blocks
    towers.forEach(t => {
      // Glow halo
      ctx.globalAlpha = t.alpha * 0.28;
      ctx.fillStyle = `hsl(${t.hue}, 85%, 65%)`;
      ctx.fillRect(t.x - 1, Math.floor(t.y) - 1, t.w + 2, t.h + 2);
      // Core block
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = `hsl(${t.hue}, 100%, 72%)`;
      ctx.fillRect(t.x, Math.floor(t.y), t.w, t.h);

      t.y -= t.speed;
      if (t.y + t.h < 0) {
        const fresh = makeTower(false);
        Object.assign(t, fresh);
      }
    });

    // Draw horizontal wave lines
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

  // Deselect on desktop background click
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

    // Close mobile menu on link click
    menu.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.textContent = '☰';
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
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
    background: '#c0c0c0',
    border:     '2px solid',
    borderColor:'#fff #808080 #808080 #fff',
    padding:    '8px 14px',
    fontFamily: '"MS Sans Serif", Arial, sans-serif',
    fontSize:   '12px',
    zIndex:     '9999',
    boxShadow:  '2px 2px 0 #404040',
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
      background: '#c0c0c0',
      border:     '2px solid',
      borderColor:'#fff #808080 #808080 #fff',
      boxShadow:  '3px 3px 0 #404040',
      zIndex:     '9999',
      minWidth:   '220px',
      fontFamily: '"MS Sans Serif", Arial, sans-serif',
      fontSize:   '12px',
      animation:  'windowOpen .1s ease-out',
      display:    'flex',
    });

    // Win98-style vertical sidebar strip
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

    // Menu content column
    const col = document.createElement('div');
    col.style.flex = '1';

    // Header strip
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
    header.innerHTML = '<span style="font-size:20px">🐸</span>'
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
        color:          '#000',
        textDecoration: 'none',
        borderBottom:   '1px solid #d4d0c8',
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
        link.style.color      = '#000';
      });
      col.appendChild(link);
    });

    menu.appendChild(col);
    document.body.appendChild(menu);

    // Close when clicking outside
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
  // Attach after first user gesture so AudioContext is allowed
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

  // File input display
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

  // Loading state on submit
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
