/* ============================================================
   ModularToadAudio — main.js
   Interactive behaviors: clock, navigation, start menu,
   toast notifications, button sounds, mobile nav
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
      left:       '8px',
      background: '#c0c0c0',
      border:     '2px solid',
      borderColor:'#fff #808080 #808080 #fff',
      boxShadow:  '3px 3px 0 #404040',
      zIndex:     '9999',
      minWidth:   '210px',
      fontFamily: '"MS Sans Serif", Arial, sans-serif',
      fontSize:   '12px',
      animation:  'windowOpen .1s ease-out',
    });

    // Header strip
    const header = document.createElement('div');
    Object.assign(header.style, {
      background: 'linear-gradient(to bottom, #000080, #1084d0)',
      color:      '#fff',
      padding:    '10px 10px',
      display:    'flex',
      alignItems: 'center',
      gap:        '8px',
      borderBottom: '1px solid #000060',
    });
    header.innerHTML = '<span style="font-size:20px">🐸</span>'
      + '<span style="font-size:13px;font-weight:bold;line-height:1.3">Modular Toad<br>'
      + '<small style="font-size:10px;opacity:.8;font-weight:normal">Audio</small></span>';
    menu.appendChild(header);

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
        display:       'flex',
        alignItems:    'center',
        gap:           '10px',
        padding:       '8px 14px',
        color:         '#000',
        textDecoration:'none',
        borderBottom:  '1px solid #d4d0c8',
        transition:    'background .05s, color .05s',
      });
      link.innerHTML = `<span style="font-size:15px">${page.icon}</span>${page.label}`;
      link.addEventListener('mouseenter', () => {
        link.style.background = '#000080';
        link.style.color      = '#fff';
      });
      link.addEventListener('mouseleave', () => {
        link.style.background = '';
        link.style.color      = '#000';
      });
      menu.appendChild(link);
    });

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
  setInterval(updateClock, 30000);

  initNavigation();
  initWindowButtons();
  initStartMenu();
  initButtonSounds();
  initContactForm();
  initServiceCardSounds();
  initPageAnimation();
  initBootSequence();
});
