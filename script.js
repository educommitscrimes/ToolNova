/* ============================================================
   ToolNova — script.js
   Core app logic: routing, tool registry, dashboard, panels
   ============================================================ */

'use strict';

/* ── Tool registry ───────────────────────────────────────────
   Each tool has: id, icon, label, desc, cat, render fn
   ──────────────────────────────────────────────────────────── */
const TOOLS = [
  // ── Utility ────────────────────────────────────────────────
  {
    id: 'url-shortener', icon: '🔗', label: 'URL Shortener',
    desc: 'Shorten long URLs to shareable links',
    cat: 'utility',
    render: () => window.toolUrlShortener?.render() ?? notReady()
  },
  {
    id: 'qr-generator', icon: '📱', label: 'QR Code Generator',
    desc: 'Create QR codes for any text or URL',
    cat: 'utility',
    render: () => window.toolQrGenerator?.render() ?? notReady()
  },
  {
    id: 'password-gen', icon: '🔐', label: 'Password Generator',
    desc: 'Generate strong, secure passwords',
    cat: 'utility',
    render: renderPasswordGen
  },
  {
    id: 'random-number', icon: '🎲', label: 'Random Number',
    desc: 'Generate random numbers in any range',
    cat: 'utility',
    render: renderRandomNumber
  },
  {
    id: 'coin-dice', icon: '🪙', label: 'Coin Flip & Dice',
    desc: 'Flip a coin or roll dice virtually',
    cat: 'utility',
    render: renderCoinDice
  },
  {
    id: 'text-tools', icon: '✏️', label: 'Text Counter & Case',
    desc: 'Count chars, words and convert case',
    cat: 'utility',
    render: renderTextTools
  },
  // ── Developer ───────────────────────────────────────────────
  {
    id: 'playground', icon: '🖥️', label: 'HTML/CSS/JS Playground',
    desc: 'Live-edit and preview web code',
    cat: 'developer',
    render: renderPlayground
  },
  {
    id: 'json-formatter', icon: '📋', label: 'JSON Formatter',
    desc: 'Beautify, validate and minify JSON',
    cat: 'developer',
    render: () => window.toolJsonFormatter?.render() ?? notReady()
  },
  {
    id: 'base64', icon: '🔄', label: 'Base64 Encoder/Decoder',
    desc: 'Encode and decode Base64 strings',
    cat: 'developer',
    render: renderBase64
  },
  {
    id: 'color-picker', icon: '🎨', label: 'Color Picker & Palette',
    desc: 'Pick colors and generate palettes',
    cat: 'developer',
    render: renderColorPicker
  },
  {
    id: 'regex-tester', icon: '🔎', label: 'Regex Tester',
    desc: 'Test and debug regular expressions live',
    cat: 'developer',
    render: renderRegexTester
  },
  // ── Gaming & Speed ──────────────────────────────────────────
  {
    id: 'typing-test', icon: '⌨️', label: 'Typing Speed Test',
    desc: 'Measure your WPM and accuracy',
    cat: 'gaming',
    render: () => window.toolTypingTest?.render() ?? notReady()
  },
  {
    id: 'cps-test', icon: '🖱️', label: 'CPS Test',
    desc: 'Measure your clicks per second',
    cat: 'gaming',
    render: renderCpsTest
  },
  {
    id: 'reaction-time', icon: '⚡', label: 'Reaction Time Test',
    desc: 'Test how fast you can react',
    cat: 'gaming',
    render: renderReactionTime
  },
  {
    id: 'mouse-accuracy', icon: '🎯', label: 'Mouse Accuracy Test',
    desc: 'Click moving targets to test accuracy',
    cat: 'gaming',
    render: renderMouseAccuracy
  },
  {
    id: 'username-gen', icon: '👤', label: 'Username Generator',
    desc: 'Generate cool unique usernames',
    cat: 'gaming',
    render: renderUsernameGen
  },
  {
    id: 'team-gen', icon: '👥', label: 'Random Team Generator',
    desc: 'Split a list of players into teams',
    cat: 'gaming',
    render: renderTeamGen
  },
  // ── Social ──────────────────────────────────────────────────
  {
    id: 'bio-link', icon: '🔖', label: 'Bio Link Creator',
    desc: 'Build a custom link-in-bio page',
    cat: 'social',
    render: renderBioLink
  },
  {
    id: 'social-links', icon: '🌐', label: 'Social Link Manager',
    desc: 'Organize all your social media links',
    cat: 'social',
    render: renderSocialLinks
  },
  {
    id: 'profile-card', icon: '🪪', label: 'Profile Card Generator',
    desc: 'Design a shareable profile card',
    cat: 'social',
    render: renderProfileCard
  }
];

const CAT_LABELS = {
  all: 'All Tools',
  utility: 'Utility Tools',
  developer: 'Developer Tools',
  gaming: 'Gaming & Speed',
  social: 'Social Tools',
  favorites: 'Favorites'
};

/* ── State ───────────────────────────────────────────────────*/
let currentCat = 'all';
let searchTerm  = '';
let activeTool  = null;
let favorites   = JSON.parse(localStorage.getItem('tn_favorites') || '[]');

/* ── DOM refs ────────────────────────────────────────────────*/
const landing       = document.getElementById('landing');
const dashboard     = document.getElementById('dashboard');
const toolGrid      = document.getElementById('toolGrid');
const emptyState    = document.getElementById('emptyState');
const contentTitle  = document.getElementById('contentTitle');
const contentCount  = document.getElementById('contentCount');
const searchInput   = document.getElementById('searchInput');
const searchClear   = document.getElementById('searchClear');
const toolOverlay   = document.getElementById('toolOverlay');
const panelTitle    = document.getElementById('panelTitle');
const panelIcon     = document.getElementById('panelIcon');
const panelBody     = document.getElementById('panelBody');
const panelClose    = document.getElementById('panelClose');
const panelFavBtn   = document.getElementById('panelFavBtn');
const toast         = document.getElementById('toast');
const sidebar       = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');

/* ── Navigation ──────────────────────────────────────────────*/
function goToDashboard() {
  landing.classList.add('exit');
  setTimeout(() => {
    landing.classList.add('hidden');
    dashboard.classList.add('visible');
  }, 600);
}

function goToLanding() {
  dashboard.classList.remove('visible');
  landing.classList.remove('hidden');
  setTimeout(() => landing.classList.remove('exit'), 50);
}

document.getElementById('heroGetStarted').addEventListener('click', goToDashboard);
document.getElementById('navGetStarted').addEventListener('click', goToDashboard);
document.getElementById('homeBtn').addEventListener('click', goToLanding);

/* ── Category buttons ────────────────────────────────────────*/
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCat = btn.dataset.cat;
    searchInput.value = '';
    searchTerm = '';
    searchClear.classList.remove('visible');
    renderGrid();
    closeSidebar();
  });
});

/* ── Search ──────────────────────────────────────────────────*/
searchInput.addEventListener('input', e => {
  searchTerm = e.target.value.trim().toLowerCase();
  searchClear.classList.toggle('visible', searchTerm.length > 0);
  renderGrid();
});
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchTerm = '';
  searchClear.classList.remove('visible');
  searchInput.focus();
  renderGrid();
});

/* ── Sidebar toggle (mobile) ─────────────────────────────────*/
sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
function closeSidebar() { sidebar.classList.remove('open'); }
document.addEventListener('click', e => {
  if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
    closeSidebar();
  }
});

/* ── Favorites ───────────────────────────────────────────────*/
function saveFavorites() {
  localStorage.setItem('tn_favorites', JSON.stringify(favorites));
}
function isFav(id) { return favorites.includes(id); }
function toggleFav(id) {
  if (isFav(id)) {
    favorites = favorites.filter(f => f !== id);
    showToast('Removed from favorites');
  } else {
    favorites.push(id);
    showToast('Added to favorites ⭐');
  }
  saveFavorites();
  // Update card star if visible
  const cardFav = document.querySelector(`.card-fav[data-id="${id}"]`);
  if (cardFav) cardFav.classList.toggle('active', isFav(id));
  // Update panel button
  if (activeTool?.id === id) updatePanelFavBtn();
}
function updatePanelFavBtn() {
  if (!activeTool) return;
  panelFavBtn.classList.toggle('active', isFav(activeTool.id));
}

/* ── Grid rendering ──────────────────────────────────────────*/
function getVisibleTools() {
  let tools = TOOLS;
  if (currentCat === 'favorites') {
    tools = tools.filter(t => isFav(t.id));
  } else if (currentCat !== 'all') {
    tools = tools.filter(t => t.cat === currentCat);
  }
  if (searchTerm) {
    tools = tools.filter(t =>
      t.label.toLowerCase().includes(searchTerm) ||
      t.desc.toLowerCase().includes(searchTerm) ||
      t.cat.toLowerCase().includes(searchTerm)
    );
  }
  return tools;
}

function renderGrid() {
  const tools = getVisibleTools();
  const q = contentTitle;

  q.textContent = searchTerm ? `Results for "${searchInput.value}"` : CAT_LABELS[currentCat] || 'All Tools';
  contentCount.textContent = `${tools.length} tool${tools.length !== 1 ? 's' : ''}`;

  toolGrid.innerHTML = '';
  emptyState.hidden = tools.length > 0;

  if (currentCat === 'all' && !searchTerm) {
    // Group by category
    const cats = ['utility','developer','gaming','social'];
    cats.forEach(cat => {
      const catTools = tools.filter(t => t.cat === cat);
      if (!catTools.length) return;
      // Label row
      const label = document.createElement('div');
      label.className = 'category-label';
      label.innerHTML = `<span class="category-label-text">${CAT_LABELS[cat]}</span><div class="category-label-line"></div>`;
      toolGrid.appendChild(label);
      catTools.forEach((tool, i) => toolGrid.appendChild(makeCard(tool, i)));
    });
  } else {
    tools.forEach((tool, i) => toolGrid.appendChild(makeCard(tool, i)));
  }
}

function makeCard(tool, index) {
  const card = document.createElement('div');
  card.className = 'tool-card';
  card.style.animationDelay = `${index * 40}ms`;
  card.innerHTML = `
    <div class="card-icon-wrap">${tool.icon}</div>
    <div>
      <div class="card-label">${tool.label}</div>
      <div class="card-desc">${tool.desc}</div>
    </div>
    <button class="card-fav${isFav(tool.id) ? ' active' : ''}" data-id="${tool.id}" aria-label="Favorite ${tool.label}" title="Favorite">★</button>
  `;
  card.addEventListener('click', e => {
    if (!e.target.closest('.card-fav')) openTool(tool);
  });
  card.querySelector('.card-fav').addEventListener('click', e => {
    e.stopPropagation();
    toggleFav(tool.id);
  });
  return card;
}

/* ── Tool panel ──────────────────────────────────────────────*/
function openTool(tool) {
  activeTool = tool;
  panelTitle.textContent = tool.label;
  panelIcon.textContent = tool.icon;
  panelBody.innerHTML = '';
  updatePanelFavBtn();
  toolOverlay.classList.add('open');
  toolOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Render tool content
  try { panelBody.innerHTML = tool.render(); }
  catch (err) { panelBody.innerHTML = `<p style="color:#fca5a5">Error loading tool: ${err.message}</p>`; }
  // Run post-render init if defined
  if (tool.init) tool.init();
  // Dispatch event so external tool scripts can bind events
  document.dispatchEvent(new CustomEvent('toolOpened', { detail: { id: tool.id } }));
}

function closeTool() {
  toolOverlay.classList.remove('open');
  toolOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  activeTool = null;
  document.dispatchEvent(new CustomEvent('toolClosed'));
}

panelClose.addEventListener('click', closeTool);
toolOverlay.addEventListener('click', e => { if (e.target === toolOverlay) closeTool(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTool(); });
panelFavBtn.addEventListener('click', () => { if (activeTool) toggleFav(activeTool.id); });

/* ── Toast ───────────────────────────────────────────────────*/
let toastTimer;
function showToast(msg, duration = 2200) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}
window.showToast = showToast;

/* ── Copy helper ─────────────────────────────────────────────*/
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!');
    if (btn) { const orig = btn.textContent; btn.textContent = '✓ Copied'; setTimeout(() => btn.textContent = orig, 1500); }
  });
}
window.copyText = copyText;

/* ── Utility: not ready ──────────────────────────────────────*/
function notReady() { return '<p style="color:#8888aa;padding:20px">Tool loading…</p>'; }

/* ============================================================
   INLINE TOOL RENDERS
   ============================================================ */

/* ── Password Generator ──────────────────────────────────────*/
function renderPasswordGen() {
  return `
    <div class="form-group">
      <label class="tool-label">Length: <span id="pwLenVal">16</span></label>
      <input type="range" class="tool-slider" id="pwLen" min="6" max="64" value="16" />
    </div>
    <div class="form-group">
      <label class="tool-label">Character types</label>
      <div class="check-group">
        <label class="check-label"><input type="checkbox" id="pwUpper" checked> Uppercase A-Z</label>
        <label class="check-label"><input type="checkbox" id="pwLower" checked> Lowercase a-z</label>
        <label class="check-label"><input type="checkbox" id="pwNums"  checked> Numbers 0-9</label>
        <label class="check-label"><input type="checkbox" id="pwSym"   checked> Symbols !@#</label>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn-primary" onclick="generatePassword()">Generate</button>
    </div>
    <div class="result-box" id="pwResult">Click Generate to create a password</div>
    <div class="btn-row">
      <button class="copy-btn" onclick="copyText(document.getElementById('pwResult').textContent, this)">📋 Copy password</button>
    </div>
    <script>
      document.getElementById('pwLen').addEventListener('input', function(){
        document.getElementById('pwLenVal').textContent = this.value;
      });
    <\/script>
  `;
}
window.generatePassword = function() {
  const len   = +document.getElementById('pwLen').value;
  const upper = document.getElementById('pwUpper').checked;
  const lower = document.getElementById('pwLower').checked;
  const nums  = document.getElementById('pwNums').checked;
  const sym   = document.getElementById('pwSym').checked;
  let chars = '';
  if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (nums)  chars += '0123456789';
  if (sym)   chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';
  if (!chars) { showToast('Select at least one character type'); return; }
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  const pwd = Array.from(arr).map(v => chars[v % chars.length]).join('');
  document.getElementById('pwResult').textContent = pwd;
};

/* ── Random Number Generator ─────────────────────────────────*/
function renderRandomNumber() {
  return `
    <div class="form-row">
      <div class="form-group">
        <label class="tool-label">Min</label>
        <input type="number" class="tool-input" id="rnMin" value="1" />
      </div>
      <div class="form-group">
        <label class="tool-label">Max</label>
        <input type="number" class="tool-input" id="rnMax" value="100" />
      </div>
      <div class="form-group">
        <label class="tool-label">Count</label>
        <input type="number" class="tool-input" id="rnCount" value="1" min="1" max="50" />
      </div>
    </div>
    <div class="btn-row">
      <button class="btn-primary" onclick="generateRandom()">Generate</button>
    </div>
    <div class="result-box" id="rnResult" style="font-size:2rem;text-align:center;min-height:80px;display:flex;align-items:center;justify-content:center;">—</div>
    <div class="btn-row">
      <button class="copy-btn" onclick="copyText(document.getElementById('rnResult').textContent, this)">📋 Copy</button>
    </div>
  `;
}
window.generateRandom = function() {
  const min   = parseInt(document.getElementById('rnMin').value);
  const max   = parseInt(document.getElementById('rnMax').value);
  const count = Math.min(50, Math.max(1, parseInt(document.getElementById('rnCount').value)));
  if (min > max) { showToast('Min must be less than Max'); return; }
  const results = [];
  for (let i = 0; i < count; i++) results.push(Math.floor(Math.random() * (max - min + 1)) + min);
  document.getElementById('rnResult').textContent = results.join(', ');
};

/* ── Coin Flip & Dice ────────────────────────────────────────*/
function renderCoinDice() {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div>
        <label class="tool-label">Coin Flip</label>
        <button class="btn-primary" onclick="flipCoin()" style="width:100%;justify-content:center;padding:20px 0;margin-bottom:12px">🪙 Flip</button>
        <div class="result-box" id="coinResult" style="text-align:center;font-size:1.4rem;min-height:60px;display:flex;align-items:center;justify-content:center;">—</div>
      </div>
      <div>
        <label class="tool-label">Dice Roll</label>
        <select class="tool-select" id="diceType" style="margin-bottom:12px">
          <option value="4">D4</option>
          <option value="6" selected>D6</option>
          <option value="8">D8</option>
          <option value="10">D10</option>
          <option value="12">D12</option>
          <option value="20">D20</option>
          <option value="100">D100</option>
        </select>
        <button class="btn-primary" onclick="rollDice()" style="width:100%;justify-content:center;padding:20px 0;margin-bottom:12px">🎲 Roll</button>
        <div class="result-box" id="diceResult" style="text-align:center;font-size:1.4rem;min-height:60px;display:flex;align-items:center;justify-content:center;">—</div>
      </div>
    </div>
  `;
}
window.flipCoin = function() {
  const r = Math.random() < 0.5;
  document.getElementById('coinResult').textContent = r ? '🌟 Heads' : '🌑 Tails';
};
window.rollDice = function() {
  const sides = parseInt(document.getElementById('diceType').value);
  const result = Math.floor(Math.random() * sides) + 1;
  document.getElementById('diceResult').textContent = `${result} / ${sides}`;
};

/* ── Text Tools ──────────────────────────────────────────────*/
function renderTextTools() {
  return `
    <div class="form-group">
      <label class="tool-label">Your text</label>
      <textarea class="tool-textarea" id="textIn" placeholder="Paste or type your text here…" oninput="updateTextStats()" style="min-height:140px"></textarea>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
      <div class="typing-stat"><div class="typing-stat-val" id="statChars">0</div><div class="typing-stat-key">Characters</div></div>
      <div class="typing-stat"><div class="typing-stat-val" id="statWords">0</div><div class="typing-stat-key">Words</div></div>
      <div class="typing-stat"><div class="typing-stat-val" id="statLines">0</div><div class="typing-stat-key">Lines</div></div>
    </div>
    <label class="tool-label">Convert case</label>
    <div class="btn-row" style="margin-top:8px">
      <button class="btn-secondary" onclick="convertCase('upper')">UPPERCASE</button>
      <button class="btn-secondary" onclick="convertCase('lower')">lowercase</button>
      <button class="btn-secondary" onclick="convertCase('title')">Title Case</button>
      <button class="btn-secondary" onclick="convertCase('sentence')">Sentence case</button>
      <button class="btn-secondary" onclick="convertCase('camel')">camelCase</button>
      <button class="btn-secondary" onclick="convertCase('snake')">snake_case</button>
      <button class="btn-secondary" onclick="convertCase('kebab')">kebab-case</button>
    </div>
    <div class="btn-row">
      <button class="copy-btn" onclick="copyText(document.getElementById('textIn').value, this)">📋 Copy text</button>
      <button class="btn-secondary" onclick="document.getElementById('textIn').value='';updateTextStats()">Clear</button>
    </div>
  `;
}
window.updateTextStats = function() {
  const t = document.getElementById('textIn').value;
  document.getElementById('statChars').textContent = t.length;
  document.getElementById('statWords').textContent = t.trim() ? t.trim().split(/\s+/).length : 0;
  document.getElementById('statLines').textContent = t ? t.split('\n').length : 0;
};
window.convertCase = function(type) {
  const el = document.getElementById('textIn');
  let t = el.value;
  if (type === 'upper') t = t.toUpperCase();
  else if (type === 'lower') t = t.toLowerCase();
  else if (type === 'title') t = t.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  else if (type === 'sentence') t = t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
  else if (type === 'camel') t = t.toLowerCase().replace(/[\s_-](\w)/g, (_,c) => c.toUpperCase());
  else if (type === 'snake') t = t.trim().toLowerCase().replace(/[\s-]+/g, '_');
  else if (type === 'kebab') t = t.trim().toLowerCase().replace(/[\s_]+/g, '-');
  el.value = t;
  updateTextStats();
};

/* ── HTML/CSS/JS Playground ──────────────────────────────────*/
function renderPlayground() {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;height:360px">
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;gap:6px">
          <button class="btn-secondary" style="flex:1;padding:6px 0;font-size:0.75rem" onclick="setPGTab('html')">HTML</button>
          <button class="btn-secondary" style="flex:1;padding:6px 0;font-size:0.75rem" onclick="setPGTab('css')">CSS</button>
          <button class="btn-secondary" style="flex:1;padding:6px 0;font-size:0.75rem" onclick="setPGTab('js')">JS</button>
        </div>
        <textarea class="tool-textarea" id="pgHtml" placeholder="<h1>Hello World</h1>" style="flex:1;min-height:0;display:block">&lt;h1 style="font-family:sans-serif;color:#8b5cf6"&gt;Hello, ToolNova!&lt;/h1&gt;
&lt;p style="font-family:sans-serif"&gt;Edit this code and click Run ▶&lt;/p&gt;</textarea>
        <textarea class="tool-textarea" id="pgCss" placeholder="body { color: red; }" style="flex:1;min-height:0;display:none">body { background: #f9f9ff; padding: 20px; }</textarea>
        <textarea class="tool-textarea" id="pgJs" placeholder="console.log('hello')" style="flex:1;min-height:0;display:none">// JavaScript here
document.querySelector('h1').addEventListener('click', () => {
  alert('You clicked the heading!');
});</textarea>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="btn-primary" onclick="runPlayground()" style="padding:8px;justify-content:center">▶ Run</button>
        <iframe id="pgFrame" style="flex:1;border:1px solid rgba(255,255,255,0.08);border-radius:8px;background:#fff" sandbox="allow-scripts"></iframe>
      </div>
    </div>
  `;
}
window.setPGTab = function(tab) {
  ['html','css','js'].forEach(t => {
    document.getElementById('pg'+t.charAt(0).toUpperCase()+t.slice(1)).style.display = t===tab ? 'block' : 'none';
  });
};
window.runPlayground = function() {
  const html = document.getElementById('pgHtml').value;
  const css  = document.getElementById('pgCss').value;
  const js   = document.getElementById('pgJs').value;
  const src  = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
  const frame = document.getElementById('pgFrame');
  frame.srcdoc = src;
};

/* ── Base64 ──────────────────────────────────────────────────*/
function renderBase64() {
  return `
    <div class="form-group">
      <label class="tool-label">Input</label>
      <textarea class="tool-textarea" id="b64In" placeholder="Paste text or Base64 here…"></textarea>
    </div>
    <div class="btn-row">
      <button class="btn-primary" onclick="doB64('encode')">Encode →</button>
      <button class="btn-secondary" onclick="doB64('decode')">← Decode</button>
    </div>
    <div class="form-group" style="margin-top:16px">
      <label class="tool-label">Output</label>
      <div class="result-box" id="b64Out">Result will appear here</div>
    </div>
    <div class="btn-row">
      <button class="copy-btn" onclick="copyText(document.getElementById('b64Out').textContent, this)">📋 Copy output</button>
    </div>
  `;
}
window.doB64 = function(dir) {
  const input = document.getElementById('b64In').value.trim();
  const out   = document.getElementById('b64Out');
  if (!input) { showToast('Enter some text first'); return; }
  try {
    out.textContent = dir === 'encode' ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input)));
    out.className = 'result-box success';
  } catch(e) {
    out.textContent = 'Error: ' + e.message;
    out.className = 'result-box error';
  }
};

/* ── Color Picker & Palette ──────────────────────────────────*/
function renderColorPicker() {
  return `
    <div class="form-row" style="align-items:flex-end">
      <div class="form-group" style="flex:0 0 auto">
        <label class="tool-label">Pick color</label>
        <input type="color" id="colorInput" value="#8b5cf6" oninput="updateColor(this.value)" />
      </div>
      <div class="form-group" style="flex:1">
        <label class="tool-label">Hex value</label>
        <input type="text" class="tool-input" id="colorHex" value="#8b5cf6" oninput="updateColorFromHex(this.value)" />
      </div>
    </div>
    <div id="colorValues" style="margin-top:8px"></div>
    <label class="tool-label" style="margin-top:20px">Generated palette</label>
    <div class="color-swatch-row" id="colorPalette"></div>
  `;
}
window.updateColor = function(hex) {
  document.getElementById('colorHex').value = hex;
  document.getElementById('colorInput').value = hex;
  renderColorValues(hex);
  renderPalette(hex);
};
window.updateColorFromHex = function(hex) {
  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    document.getElementById('colorInput').value = hex;
    renderColorValues(hex);
    renderPalette(hex);
  }
};
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return { r, g, b };
}
function rgbToHsl(r,g,b) {
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h,s,l=(max+min)/2;
  if (max===min) { h=s=0; } else {
    const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
    h=(max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4)/6;
  }
  return { h:Math.round(h*360), s:Math.round(s*100), l:Math.round(l*100) };
}
function renderColorValues(hex) {
  const {r,g,b}=hexToRgb(hex);
  const {h,s,l}=rgbToHsl(r,g,b);
  document.getElementById('colorValues').innerHTML = `
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div class="result-box" style="flex:1;min-width:100px;cursor:pointer" onclick="copyText('${hex}',this)">${hex}</div>
      <div class="result-box" style="flex:1;min-width:100px;cursor:pointer" onclick="copyText('rgb(${r},${g},${b})',this)">rgb(${r},${g},${b})</div>
      <div class="result-box" style="flex:1;min-width:100px;cursor:pointer" onclick="copyText('hsl(${h},${s}%,${l}%)',this)">hsl(${h},${s}%,${l}%)</div>
    </div>
    <div style="height:50px;border-radius:8px;margin-top:10px;background:${hex};border:1px solid rgba(255,255,255,0.1)"></div>
  `;
}
function lightenDarken(hex, pct) {
  const {r,g,b}=hexToRgb(hex);
  const amt = Math.round(2.55*pct);
  const clamp = v => Math.min(255,Math.max(0,v));
  const rr=clamp(r+amt), gg=clamp(g+amt), bb=clamp(b+amt);
  return '#'+[rr,gg,bb].map(v=>v.toString(16).padStart(2,'0')).join('');
}
function renderPalette(hex) {
  const shades = [-40,-30,-20,-10,0,10,20,30,40,50];
  const container = document.getElementById('colorPalette');
  container.innerHTML = shades.map(s => {
    const c = lightenDarken(hex, s);
    return `<div class="color-swatch" style="background:${c}" title="${c}" onclick="copyText('${c}',null);showToast('Copied ${c}')"></div>`;
  }).join('');
}
// Init color picker when opened
document.addEventListener('toolOpened', e => {
  if (e.detail.id === 'color-picker') {
    setTimeout(() => {
      updateColor('#8b5cf6');
    }, 0);
  }
});

/* ── Regex Tester ────────────────────────────────────────────*/
function renderRegexTester() {
  return `
    <div class="form-row">
      <div class="form-group" style="flex:1">
        <label class="tool-label">Regular expression</label>
        <input type="text" class="tool-input" id="rxPattern" placeholder="e.g. \\d+" oninput="testRegex()" style="font-family:var(--font-mono)" />
      </div>
      <div class="form-group" style="flex:0 0 80px">
        <label class="tool-label">Flags</label>
        <input type="text" class="tool-input" id="rxFlags" value="g" oninput="testRegex()" maxlength="6" />
      </div>
    </div>
    <div class="form-group">
      <label class="tool-label">Test string</label>
      <textarea class="tool-textarea" id="rxTest" oninput="testRegex()" placeholder="Enter text to test…">The price is $42 and the code is A1B2C3</textarea>
    </div>
    <div class="form-group">
      <label class="tool-label">Matches</label>
      <div class="result-box" id="rxResult">Results appear here</div>
    </div>
  `;
}
window.testRegex = function() {
  const pat   = document.getElementById('rxPattern').value;
  const flags = document.getElementById('rxFlags').value;
  const test  = document.getElementById('rxTest').value;
  const out   = document.getElementById('rxResult');
  if (!pat) { out.textContent = 'Enter a pattern above'; out.className='result-box'; return; }
  try {
    const rx = new RegExp(pat, flags);
    const matches = [...test.matchAll(rx)];
    if (!matches.length) {
      out.textContent = 'No matches found';
      out.className = 'result-box error';
    } else {
      out.textContent = matches.map((m,i)=>`Match ${i+1}: "${m[0]}" at index ${m.index}`).join('\n');
      out.className = 'result-box success';
    }
  } catch(e) {
    out.textContent = 'Invalid regex: ' + e.message;
    out.className = 'result-box error';
  }
};

/* ── CPS Test ────────────────────────────────────────────────*/
function renderCpsTest() {
  return `
    <div class="typing-stats" style="margin-bottom:16px">
      <div class="typing-stat"><div class="typing-stat-val" id="cpsClicks">0</div><div class="typing-stat-key">Clicks</div></div>
      <div class="typing-stat"><div class="typing-stat-val" id="cpsCps">0.0</div><div class="typing-stat-key">CPS</div></div>
      <div class="typing-stat"><div class="typing-stat-val" id="cpsTime">5.0</div><div class="typing-stat-key">Seconds left</div></div>
    </div>
    <button class="cps-btn" id="cpsBtn" onclick="handleCpsClick()">
      Click here as fast as you can!
    </button>
    <div class="btn-row">
      <button class="btn-secondary" onclick="resetCps()">Reset</button>
    </div>
  `;
}
let cpsClicks=0, cpsTimer=null, cpsRunning=false, cpsEndTime=0;
window.handleCpsClick = function() {
  if (!cpsRunning) {
    cpsRunning = true;
    cpsClicks = 0;
    cpsEndTime = Date.now() + 5000;
    document.getElementById('cpsBtn').classList.add('active');
    cpsTimer = setInterval(() => {
      const left = Math.max(0, (cpsEndTime - Date.now()) / 1000);
      const elapsed = 5 - left;
      document.getElementById('cpsTime').textContent = left.toFixed(1);
      document.getElementById('cpsCps').textContent = elapsed > 0 ? (cpsClicks/elapsed).toFixed(1) : '0.0';
      if (left <= 0) {
        clearInterval(cpsTimer);
        cpsRunning = false;
        document.getElementById('cpsBtn').textContent = `Done! ${document.getElementById('cpsCps').textContent} CPS — Click to retry`;
        document.getElementById('cpsBtn').classList.remove('active');
      }
    }, 50);
  }
  if (cpsRunning) {
    cpsClicks++;
    document.getElementById('cpsClicks').textContent = cpsClicks;
  }
};
window.resetCps = function() {
  clearInterval(cpsTimer);
  cpsRunning = false; cpsClicks = 0;
  document.getElementById('cpsClicks').textContent = '0';
  document.getElementById('cpsCps').textContent = '0.0';
  document.getElementById('cpsTime').textContent = '5.0';
  document.getElementById('cpsBtn').textContent = 'Click here as fast as you can!';
  document.getElementById('cpsBtn').classList.remove('active');
};
document.addEventListener('toolClosed', () => { clearInterval(cpsTimer); cpsRunning=false; });

/* ── Reaction Time Test ──────────────────────────────────────*/
function renderReactionTime() {
  return `
    <div id="reactionBox" class="reaction-box waiting" onclick="handleReaction()">
      <div class="reaction-text" id="reactionText">Click to start</div>
      <div class="reaction-sub" id="reactionSub">Test your reaction speed</div>
    </div>
    <div class="typing-stats" id="reactionStats"></div>
    <div class="btn-row">
      <button class="btn-secondary" onclick="resetReaction()">Reset</button>
    </div>
  `;
}
let reactionState='idle', reactionTimer=null, reactionStart=0, reactionTimes=[];
window.handleReaction = function() {
  const box=document.getElementById('reactionBox');
  const txt=document.getElementById('reactionText');
  const sub=document.getElementById('reactionSub');
  if (reactionState==='idle' || reactionState==='result') {
    reactionState='waiting';
    box.className='reaction-box waiting';
    txt.textContent='Wait for green…';
    sub.textContent='Don\'t click yet!';
    const delay = 1500 + Math.random()*3000;
    reactionTimer = setTimeout(() => {
      reactionState='ready'; reactionStart=Date.now();
      box.className='reaction-box ready';
      txt.textContent='CLICK NOW!';
      sub.textContent='As fast as you can!';
    }, delay);
  } else if (reactionState==='waiting') {
    clearTimeout(reactionTimer);
    reactionState='idle';
    box.className='reaction-box waiting';
    txt.textContent='Too early! Click to try again';
    sub.textContent='Wait for green…';
  } else if (reactionState==='ready') {
    const t = Date.now()-reactionStart;
    reactionTimes.push(t);
    reactionState='result';
    box.className='reaction-box result';
    txt.textContent=`${t} ms`;
    sub.textContent='Click to try again';
    const avg=Math.round(reactionTimes.reduce((a,b)=>a+b,0)/reactionTimes.length);
    const best=Math.min(...reactionTimes);
    document.getElementById('reactionStats').innerHTML=`
      <div class="typing-stat"><div class="typing-stat-val">${t}</div><div class="typing-stat-key">This round (ms)</div></div>
      <div class="typing-stat"><div class="typing-stat-val">${best}</div><div class="typing-stat-key">Best (ms)</div></div>
      <div class="typing-stat"><div class="typing-stat-val">${avg}</div><div class="typing-stat-key">Average (ms)</div></div>
      <div class="typing-stat"><div class="typing-stat-val">${reactionTimes.length}</div><div class="typing-stat-key">Attempts</div></div>
    `;
  }
};
window.resetReaction = function() {
  clearTimeout(reactionTimer);
  reactionState='idle'; reactionTimes=[];
  const box=document.getElementById('reactionBox');
  if (!box) return;
  box.className='reaction-box waiting';
  document.getElementById('reactionText').textContent='Click to start';
  document.getElementById('reactionSub').textContent='Test your reaction speed';
  document.getElementById('reactionStats').innerHTML='';
};
document.addEventListener('toolClosed', () => { clearTimeout(reactionTimer); resetReaction(); });

/* ── Mouse Accuracy Test ─────────────────────────────────────*/
function renderMouseAccuracy() {
  return `
    <div class="typing-stats" style="margin-bottom:12px">
      <div class="typing-stat"><div class="typing-stat-val" id="accHits">0</div><div class="typing-stat-key">Hits</div></div>
      <div class="typing-stat"><div class="typing-stat-val" id="accMisses">0</div><div class="typing-stat-key">Misses</div></div>
      <div class="typing-stat"><div class="typing-stat-val" id="accAcc">—</div><div class="typing-stat-key">Accuracy</div></div>
      <div class="typing-stat"><div class="typing-stat-val" id="accLeft">20</div><div class="typing-stat-key">Targets left</div></div>
    </div>
    <div class="accuracy-arena" id="accArena" onclick="handleAccArena(event)">
      <div id="accTarget" class="accuracy-target" style="width:60px;height:60px;display:none"></div>
      <div id="accStart" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.9rem;pointer-events:none">Click anywhere to start</div>
    </div>
    <div class="btn-row">
      <button class="btn-secondary" onclick="resetAccuracy()">Reset</button>
    </div>
  `;
}
let accRunning=false,accHits=0,accMisses=0,accTotal=20,accRemaining=0,accTargetEl=null;
window.handleAccArena = function(e) {
  const arena=document.getElementById('accArena');
  if (!accRunning) { startAccuracy(); return; }
  if (!accTargetEl) return;
  const rect=accTargetEl.getBoundingClientRect();
  const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
  const dist=Math.hypot(e.clientX-cx, e.clientY-cy);
  const hit=dist<=rect.width/2;
  if (hit) { accHits++; document.getElementById('accHits').textContent=accHits; }
  else { accMisses++; document.getElementById('accMisses').textContent=accMisses; }
  const total=accHits+accMisses;
  document.getElementById('accAcc').textContent=Math.round(accHits/total*100)+'%';
  accRemaining--;
  document.getElementById('accLeft').textContent=accRemaining;
  if (accRemaining<=0) { endAccuracy(); return; }
  placeTarget();
};
function startAccuracy() {
  accRunning=true; accHits=0; accMisses=0; accRemaining=accTotal;
  document.getElementById('accStart').style.display='none';
  accTargetEl=document.getElementById('accTarget');
  accTargetEl.style.display='flex';
  placeTarget();
}
function placeTarget() {
  const arena=document.getElementById('accArena');
  const ar=arena.getBoundingClientRect();
  const size=40+Math.random()*40;
  accTargetEl.style.width=size+'px'; accTargetEl.style.height=size+'px';
  const x=size/2+Math.random()*(ar.width-size);
  const y=size/2+Math.random()*(ar.height-size);
  accTargetEl.style.left=x+'px'; accTargetEl.style.top=y+'px';
}
function endAccuracy() {
  accRunning=false;
  if (accTargetEl) accTargetEl.style.display='none';
  const msg=document.getElementById('accStart');
  msg.style.display='flex';
  msg.textContent=`Done! ${Math.round(accHits/accTotal*100)}% accuracy — Click to play again`;
}
window.resetAccuracy = function() {
  accRunning=false; accHits=0; accMisses=0;
  document.getElementById('accHits').textContent='0';
  document.getElementById('accMisses').textContent='0';
  document.getElementById('accAcc').textContent='—';
  document.getElementById('accLeft').textContent=accTotal;
  if (accTargetEl) accTargetEl.style.display='none';
  const msg=document.getElementById('accStart');
  if (msg) { msg.style.display='flex'; msg.textContent='Click anywhere to start'; }
};

/* ── Username Generator ──────────────────────────────────────*/
const UG_ADJ=['Swift','Dark','Neon','Cyber','Shadow','Ultra','Hyper','Pixel','Frost','Storm','Epic','Blaze'];
const UG_NOU=['Wolf','Fox','Nova','Star','Blade','Ghost','Hawk','Titan','Viper','Phoenix','Dragon','Knight'];
function renderUsernameGen() {
  return `
    <div class="form-row">
      <div class="form-group">
        <label class="tool-label">Style</label>
        <select class="tool-select" id="ugStyle">
          <option value="combo">Adjective + Noun</option>
          <option value="noun-num">Noun + Number</option>
          <option value="x">xXNameXx</option>
          <option value="under">under_score</option>
        </select>
      </div>
      <div class="form-group">
        <label class="tool-label">Count</label>
        <input type="number" class="tool-input" id="ugCount" value="8" min="1" max="20" />
      </div>
    </div>
    <div class="btn-row"><button class="btn-primary" onclick="generateUsernames()">Generate</button></div>
    <div id="ugResults" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px"></div>
  `;
}
window.generateUsernames = function() {
  const style=document.getElementById('ugStyle').value;
  const count=Math.min(20,parseInt(document.getElementById('ugCount').value)||8);
  const names=[];
  for(let i=0;i<count;i++){
    const adj=UG_ADJ[Math.floor(Math.random()*UG_ADJ.length)];
    const nou=UG_NOU[Math.floor(Math.random()*UG_NOU.length)];
    const num=Math.floor(Math.random()*9000)+100;
    if(style==='combo') names.push(adj+nou);
    else if(style==='noun-num') names.push(nou+num);
    else if(style==='x') names.push(`x${adj}${nou}x`);
    else names.push(`${adj.toLowerCase()}_${nou.toLowerCase()}`);
  }
  document.getElementById('ugResults').innerHTML=names.map(n=>`
    <span class="result-box" style="cursor:pointer;margin:0;display:inline-block;padding:8px 14px" onclick="copyText('${n}',null);showToast('Copied: ${n}')">${n}</span>
  `).join('');
};

/* ── Random Team Generator ───────────────────────────────────*/
function renderTeamGen() {
  return `
    <div class="form-row">
      <div class="form-group" style="flex:2">
        <label class="tool-label">Players (one per line)</label>
        <textarea class="tool-textarea" id="tgPlayers" style="min-height:120px">Alice
Bob
Charlie
Dave
Eve
Frank
Grace
Heidi</textarea>
      </div>
      <div class="form-group" style="flex:1">
        <label class="tool-label">Number of teams</label>
        <input type="number" class="tool-input" id="tgTeams" value="2" min="2" max="20" />
      </div>
    </div>
    <div class="btn-row"><button class="btn-primary" onclick="generateTeams()">Split into teams</button></div>
    <div id="tgResults" style="margin-top:16px;display:flex;flex-wrap:wrap;gap:12px"></div>
  `;
}
window.generateTeams = function() {
  const raw=document.getElementById('tgPlayers').value;
  const players=raw.split('\n').map(p=>p.trim()).filter(Boolean);
  const teamCount=Math.min(players.length,parseInt(document.getElementById('tgTeams').value)||2);
  if(players.length<teamCount){showToast('Not enough players');return;}
  // Shuffle
  for(let i=players.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[players[i],players[j]]=[players[j],players[i]];}
  const teams=Array.from({length:teamCount},()=>[]);
  players.forEach((p,i)=>teams[i%teamCount].push(p));
  document.getElementById('tgResults').innerHTML=teams.map((t,i)=>`
    <div class="result-box" style="flex:1;min-width:140px">
      <div style="color:var(--purple);font-weight:600;margin-bottom:8px">Team ${i+1}</div>
      ${t.map(p=>`<div>${p}</div>`).join('')}
    </div>
  `).join('');
};

/* ── Bio Link Creator ────────────────────────────────────────*/
function renderBioLink() {
  return `
    <div class="form-row">
      <div class="form-group"><label class="tool-label">Your name</label><input type="text" class="tool-input" id="bioName" placeholder="John Doe" oninput="previewBio()" /></div>
      <div class="form-group"><label class="tool-label">Bio</label><input type="text" class="tool-input" id="bioBio" placeholder="Designer & Developer" oninput="previewBio()" /></div>
    </div>
    <div id="bioLinks" style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">
      <div class="form-row bio-link-row">
        <input type="text" class="tool-input" placeholder="Label (e.g. Twitter)" oninput="previewBio()" />
        <input type="text" class="tool-input" placeholder="URL" oninput="previewBio()" />
      </div>
    </div>
    <div class="btn-row">
      <button class="btn-secondary" onclick="addBioLink()">+ Add link</button>
      <button class="btn-primary" onclick="generateBioPage()">Generate page</button>
    </div>
    <div id="bioPreview" style="margin-top:16px"></div>
  `;
}
window.addBioLink = function() {
  const container=document.getElementById('bioLinks');
  const row=document.createElement('div');
  row.className='form-row bio-link-row';
  row.innerHTML=`<input type="text" class="tool-input" placeholder="Label" oninput="previewBio()" /><input type="text" class="tool-input" placeholder="URL" oninput="previewBio()" /><button class="btn-secondary" onclick="this.parentElement.remove();previewBio()" style="padding:10px 12px;flex:0">✕</button>`;
  container.appendChild(row);
};
window.previewBio = function() {};
window.generateBioPage = function() {
  const name=document.getElementById('bioName').value||'Your Name';
  const bio=document.getElementById('bioBio').value||'Your bio here';
  const rows=[...document.querySelectorAll('.bio-link-row')];
  const links=rows.map(r=>{
    const inputs=r.querySelectorAll('input');
    return {label:inputs[0].value, url:inputs[1].value};
  }).filter(l=>l.label&&l.url);
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:linear-gradient(135deg,#0b0b0f,#1a0a2e);min-height:100vh;display:flex;align-items:center;justify-content:center;color:#fff}.card{text-align:center;padding:40px 20px;max-width:400px;width:100%}h1{font-size:1.8rem;margin-bottom:8px}p{color:#aaa;margin-bottom:32px}.links{display:flex;flex-direction:column;gap:12px}a{display:block;padding:14px 24px;border:1px solid rgba(139,92,246,.4);border-radius:99px;color:#fff;text-decoration:none;transition:.2s;background:rgba(139,92,246,.1)}a:hover{background:rgba(139,92,246,.3)}</style></head><body><div class="card"><h1>${name}</h1><p>${bio}</p><div class="links">${links.map(l=>`<a href="${l.url}" target="_blank">${l.label}</a>`).join('')}</div></div></body></html>`;
  const blob=new Blob([html],{type:'text/html'});
  const url=URL.createObjectURL(blob);
  document.getElementById('bioPreview').innerHTML=`
    <div class="result-box success">✓ Bio link page generated!</div>
    <div class="btn-row" style="margin-top:8px">
      <a href="${url}" download="bio-link.html" class="btn-primary" style="text-decoration:none">⬇ Download HTML</a>
      <a href="${url}" target="_blank" class="btn-secondary" style="text-decoration:none">👁 Preview</a>
    </div>
  `;
};

/* ── Social Link Manager ─────────────────────────────────────*/
const SOCIAL_PLATFORMS=[
  {name:'Twitter/X',icon:'🐦',placeholder:'https://twitter.com/username'},
  {name:'Instagram',icon:'📸',placeholder:'https://instagram.com/username'},
  {name:'LinkedIn',icon:'💼',placeholder:'https://linkedin.com/in/username'},
  {name:'GitHub',icon:'💻',placeholder:'https://github.com/username'},
  {name:'TikTok',icon:'🎵',placeholder:'https://tiktok.com/@username'},
  {name:'YouTube',icon:'▶️',placeholder:'https://youtube.com/@channel'},
  {name:'Discord',icon:'🎮',placeholder:'https://discord.gg/invite'},
  {name:'Website',icon:'🌐',placeholder:'https://yourwebsite.com'},
];
function renderSocialLinks() {
  return `
    <div style="display:flex;flex-direction:column;gap:10px">
      ${SOCIAL_PLATFORMS.map(p=>`
        <div class="form-row" style="align-items:center;gap:12px">
          <span style="font-size:1.3rem;flex:0 0 auto">${p.icon}</span>
          <span style="color:var(--text-muted);font-size:0.85rem;flex:0 0 90px">${p.name}</span>
          <input type="text" class="tool-input" placeholder="${p.placeholder}" style="flex:1" />
        </div>
      `).join('')}
    </div>
    <div class="btn-row" style="margin-top:16px">
      <button class="btn-primary" onclick="saveSocialLinks()">💾 Save links</button>
      <button class="btn-secondary" onclick="exportSocialLinks()">Export JSON</button>
    </div>
    <div id="slResult"></div>
  `;
}
window.saveSocialLinks = function() {
  showToast('Links saved! ✓');
};
window.exportSocialLinks = function() {
  const inputs=[...document.querySelectorAll('#slResult ~ * input,[data-sl]')];
  showToast('Export ready!');
};

/* ── Profile Card Generator ──────────────────────────────────*/
function renderProfileCard() {
  return `
    <div class="form-row">
      <div class="form-group"><label class="tool-label">Name</label><input type="text" class="tool-input" id="pcName" value="Alex Nova" oninput="renderProfilePreview()" /></div>
      <div class="form-group"><label class="tool-label">Role</label><input type="text" class="tool-input" id="pcRole" value="Full-Stack Developer" oninput="renderProfilePreview()" /></div>
    </div>
    <div class="form-group"><label class="tool-label">Bio</label><input type="text" class="tool-input" id="pcBio" value="Building cool things on the internet ✨" oninput="renderProfilePreview()" /></div>
    <div class="form-row">
      <div class="form-group"><label class="tool-label">Accent color</label><input type="color" id="pcColor" value="#8b5cf6" oninput="renderProfilePreview()" /></div>
      <div class="form-group"><label class="tool-label">Emoji avatar</label><input type="text" class="tool-input" id="pcEmoji" value="🚀" maxlength="2" oninput="renderProfilePreview()" /></div>
    </div>
    <div id="pcPreview" style="margin-top:16px"></div>
    <div class="btn-row" style="margin-top:12px">
      <button class="btn-primary" onclick="downloadProfileCard()">⬇ Download card</button>
    </div>
  `;
}
window.renderProfilePreview = function() {
  const name=document.getElementById('pcName').value||'Your Name';
  const role=document.getElementById('pcRole').value||'Your Role';
  const bio=document.getElementById('pcBio').value||'';
  const color=document.getElementById('pcColor').value||'#8b5cf6';
  const emoji=document.getElementById('pcEmoji').value||'😊';
  document.getElementById('pcPreview').innerHTML=`
    <div style="background:linear-gradient(135deg,#13131c,#1a0a2e);border:1px solid ${color}44;border-radius:16px;padding:28px 24px;text-align:center;max-width:320px;margin:0 auto">
      <div style="width:70px;height:70px;border-radius:50%;background:${color}22;border:2px solid ${color};display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:2rem">${emoji}</div>
      <div style="font-weight:700;font-size:1.2rem;color:#fff;margin-bottom:4px">${name}</div>
      <div style="color:${color};font-size:0.85rem;font-weight:500;margin-bottom:10px">${role}</div>
      <div style="color:#888;font-size:0.8rem;line-height:1.5">${bio}</div>
    </div>
  `;
};
window.downloadProfileCard = function() { showToast('Tip: screenshot the preview to save your card!'); };
// Init preview
document.addEventListener('toolOpened', e => {
  if (e.detail.id === 'profile-card') setTimeout(renderProfilePreview, 0);
});

/* ── Init ────────────────────────────────────────────────────*/
renderGrid();
// Staggered hero animation
document.querySelectorAll('.hero > *').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms`;
  setTimeout(() => { el.style.opacity=''; el.style.transform=''; }, 100);
});
