/* ============================================================
   ModularToadAudio — main.js
   Interactive behaviors: PS2 background, clock, navigation,
   start menu, toast notifications, button sounds, mobile nav,
   desktop icons, hero water shader, mascot poke, carousel
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
    minimize.title = "Classic window control";
    minimize.addEventListener('click', () => showToast('Minimize is disabled in this layout.'));
  }
  if (maximize) {
    maximize.title = "Already maximized!";
    maximize.addEventListener('click', () => showToast("Window is already full-screen!"));
  }
  if (close) {
    close.title = "Close is disabled here";
    close.addEventListener('click', () => showToast("This window remains active."));
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
    header.innerHTML = '<img src="https://f4.bcbits.com/img/0038520380_10.jpg" alt="" style="width:20px;height:20px;object-fit:cover;border-radius:2px">'
      + '<span style="font-size:13px;font-weight:bold;line-height:1.3">Modular Toad<br>'
      + '<small style="font-size:10px;opacity:.8;font-weight:normal">Audio</small></span>';
    col.appendChild(header);

    const pages = [
      { icon: 'HM', label: 'Home',      href: 'index.html'    },
      { icon: 'SV', label: 'Services',  href: 'services.html' },
      { icon: 'PF', label: 'Portfolio', href: 'portfolio.html' },
      { icon: 'PR', label: 'Pricing',   href: 'pricing.html'  },
      { icon: 'AB', label: 'About',     href: 'about.html'    },
      { icon: 'CT', label: 'Contact',   href: 'contact.html'  },
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
      btn.textContent = 'Sending…';
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


/* ── HOMEPAGE PORTFOLIO CAROUSEL ───────────────────────────── */
async function initPortfolioPreviewCarousel() {
  const track = document.getElementById('portfolioPreviewTrack');
  const prev  = document.getElementById('portfolioPrev');
  const next  = document.getElementById('portfolioNext');
  if (!track || !prev || !next) return;

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
      return { title, category, src };
    }).filter(item => item.title);

    if (!items.length) {
      track.innerHTML = '<p class="portfolio-preview-empty">Portfolio submissions will appear here automatically.</p>';
      prev.disabled = true;
      next.disabled = true;
      return;
    }

    let index = 0;
    const render = () => {
      const item = items[index];
      const media = item.src
        ? `<div class="video-container"><iframe src="${item.src}" title="${item.title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
        : '<div class="portfolio-preview-empty">Media preview unavailable for this submission.</div>';

      track.innerHTML = `
        <article class="portfolio-preview-card window">
          <div class="window-titlebar">
            <span class="titlebar-icon">PF</span>
            <span class="titlebar-title">${item.title}</span>
          </div>
          ${media}
          <div class="portfolio-preview-meta">Category: ${item.category}</div>
        </article>`;
    };

    prev.addEventListener('click', () => {
      index = (index - 1 + items.length) % items.length;
      render();
    });

    next.addEventListener('click', () => {
      index = (index + 1) % items.length;
      render();
    });

    render();
  } catch (_) {
    track.innerHTML = '<p class="portfolio-preview-empty">Portfolio preview is temporarily unavailable.</p>';
    prev.disabled = true;
    next.disabled = true;
  }
}

/* ── INIT ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);

  initPS2Background();
  initHeroWaterShader();
  initMascotPoke();
  initNavigation();
  initDesktopIcons();
  initWindowButtons();
  initStartMenu();
  initButtonSounds();
  initContactForm();
  initServiceCardSounds();
  initPageAnimation();
  initBootSequence();
  initPortfolioPreviewCarousel();
});
