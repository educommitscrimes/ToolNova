/* ============================================================
   ToolNova — tools/json-formatter.js
   JSON Formatter: beautify, minify, validate, and explore JSON
   ============================================================ */

(function () {
  'use strict';

  function render() {
    return `
      <div class="form-group">
        <label class="tool-label">JSON Input</label>
        <textarea class="tool-textarea" id="jsonInput" placeholder='Paste your JSON here…' style="min-height:160px">{
  "name": "ToolNova",
  "version": "1.0",
  "tools": 30,
  "free": true,
  "features": ["fast", "modern", "no-login"]
}</textarea>
      </div>

      <div class="btn-row">
        <button class="btn-primary"  onclick="jsonFormat()">✨ Beautify</button>
        <button class="btn-secondary" onclick="jsonMinify()">⚡ Minify</button>
        <button class="btn-secondary" onclick="jsonValidate()">✅ Validate</button>
        <button class="btn-secondary" onclick="jsonClear()">🗑 Clear</button>
      </div>

      <div id="jsonStatus" style="margin-top:12px"></div>

      <div class="form-group" style="margin-top:16px">
        <label class="tool-label">Output</label>
        <textarea class="tool-textarea" id="jsonOutput" readonly placeholder="Output appears here…" style="min-height:160px"></textarea>
      </div>

      <div class="btn-row">
        <button class="copy-btn" onclick="copyText(document.getElementById('jsonOutput').value, this)">📋 Copy output</button>
        <button class="btn-secondary" onclick="jsonSwap()">⇅ Output → Input</button>
      </div>

      <div id="jsonStats" style="margin-top:16px"></div>
    `;
  }

  /* Shared helpers */
  function setStatus(msg, type = '') {
    const el = document.getElementById('jsonStatus');
    if (!el) return;
    el.innerHTML = `<div class="result-box ${type}" style="margin:0">${msg}</div>`;
  }

  function setStats(obj) {
    const el = document.getElementById('jsonStats');
    if (!el) return;
    const keys  = countKeys(obj);
    const depth = maxDepth(obj);
    el.innerHTML = `
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div class="typing-stat"><div class="typing-stat-val">${keys}</div><div class="typing-stat-key">Keys</div></div>
        <div class="typing-stat"><div class="typing-stat-val">${depth}</div><div class="typing-stat-key">Max depth</div></div>
        <div class="typing-stat"><div class="typing-stat-val">${Array.isArray(obj) ? obj.length : '—'}</div><div class="typing-stat-key">Array items</div></div>
        <div class="typing-stat"><div class="typing-stat-val">${typeof obj}</div><div class="typing-stat-key">Root type</div></div>
      </div>
    `;
  }

  function countKeys(obj, count = 0) {
    if (obj && typeof obj === 'object') {
      const keys = Object.keys(obj);
      count += keys.length;
      keys.forEach(k => { count = countKeys(obj[k], count); });
    }
    return count;
  }

  function maxDepth(obj, d = 0) {
    if (!obj || typeof obj !== 'object') return d;
    return Math.max(...Object.values(obj).map(v => maxDepth(v, d + 1)), d);
  }

  /* Actions */
  window.jsonFormat = function () {
    const raw = document.getElementById('jsonInput').value.trim();
    if (!raw) { showToast('Paste some JSON first'); return; }
    try {
      const parsed = JSON.parse(raw);
      document.getElementById('jsonOutput').value = JSON.stringify(parsed, null, 2);
      setStatus('✓ Valid JSON — formatted successfully', 'success');
      setStats(parsed);
    } catch (e) {
      document.getElementById('jsonOutput').value = '';
      setStatus('✗ Invalid JSON: ' + e.message, 'error');
      document.getElementById('jsonStats').innerHTML = '';
    }
  };

  window.jsonMinify = function () {
    const raw = document.getElementById('jsonInput').value.trim();
    if (!raw) { showToast('Paste some JSON first'); return; }
    try {
      const parsed = JSON.parse(raw);
      document.getElementById('jsonOutput').value = JSON.stringify(parsed);
      setStatus('✓ JSON minified successfully', 'success');
      setStats(parsed);
    } catch (e) {
      setStatus('✗ Invalid JSON: ' + e.message, 'error');
    }
  };

  window.jsonValidate = function () {
    const raw = document.getElementById('jsonInput').value.trim();
    if (!raw) { showToast('Paste some JSON first'); return; }
    try {
      const parsed = JSON.parse(raw);
      setStatus('✓ Valid JSON!', 'success');
      setStats(parsed);
    } catch (e) {
      setStatus('✗ Invalid JSON: ' + e.message, 'error');
      document.getElementById('jsonStats').innerHTML = '';
    }
  };

  window.jsonClear = function () {
    document.getElementById('jsonInput').value  = '';
    document.getElementById('jsonOutput').value = '';
    document.getElementById('jsonStatus').innerHTML = '';
    document.getElementById('jsonStats').innerHTML  = '';
  };

  window.jsonSwap = function () {
    const out = document.getElementById('jsonOutput').value;
    if (!out) { showToast('No output to swap'); return; }
    document.getElementById('jsonInput').value  = out;
    document.getElementById('jsonOutput').value = '';
    showToast('Output moved to input');
  };

  /* Register */
  window.toolJsonFormatter = { render };
})();
