/* ============================================================
   ToolNova — tools/url-shortener.js
   URL Shortener: creates readable short links stored locally
   ============================================================ */

(function() {
  'use strict';

  // Simple in-page link store (persists via localStorage)
  const STORE_KEY = 'tn_short_links';

  function getLinks() {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
  }

  function saveLinks(links) {
    localStorage.setItem(STORE_KEY, JSON.stringify(links));
  }

  function genCode(len = 5) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(v => chars[v % chars.length]).join('');
  }

  function renderHistory(links) {
    const entries = Object.entries(links).reverse().slice(0, 8);
    if (!entries.length) return '<p style="color:var(--text-muted);font-size:0.85rem;margin-top:16px">No links shortened yet.</p>';
    return `
      <div class="form-group" style="margin-top:20px">
        <label class="tool-label">Recent links</label>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
          ${entries.map(([code, data]) => {
            const shortUrl = `${window.location.origin}/#${code}`;
            return `
              <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                <div style="flex:1;min-width:0">
                  <div style="color:#c4b5fd;font-family:var(--font-mono);font-size:0.8rem;margin-bottom:2px">${shortUrl}</div>
                  <div style="color:var(--text-muted);font-size:0.75rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${data.original}</div>
                </div>
                <button class="copy-btn" style="flex-shrink:0" onclick="copyText('${shortUrl}',this)">📋 Copy</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function render() {
    const links = getLinks();
    return `
      <div class="form-group">
        <label class="tool-label">Long URL</label>
        <input type="url" class="tool-input" id="urlInput" placeholder="https://very-long-website-url.com/with/lots/of/path" />
      </div>
      <div class="form-row">
        <div class="form-group" style="flex:1">
          <label class="tool-label">Custom alias (optional)</label>
          <input type="text" class="tool-input" id="urlAlias" placeholder="my-link" maxlength="20" />
        </div>
      </div>
      <div class="btn-row">
        <button class="btn-primary" onclick="shortenUrl()">Shorten URL</button>
      </div>
      <div id="urlResult"></div>
      <div id="urlHistory">${renderHistory(links)}</div>
    `;
  }

  window.shortenUrl = function() {
    const input = document.getElementById('urlInput').value.trim();
    const alias = document.getElementById('urlAlias').value.trim().replace(/\s+/g,'-').toLowerCase();
    const resultEl = document.getElementById('urlResult');

    if (!input) { showToast('Please enter a URL'); return; }

    // Basic URL validation
    let url;
    try {
      url = new URL(input.startsWith('http') ? input : 'https://' + input);
    } catch(e) {
      resultEl.innerHTML = '<div class="result-box error">Invalid URL — please include https://</div>';
      return;
    }

    const links = getLinks();
    const code = alias || genCode();

    if (alias && links[alias]) {
      resultEl.innerHTML = '<div class="result-box error">Alias already taken — try a different one</div>';
      return;
    }

    links[code] = { original: url.href, created: Date.now() };
    saveLinks(links);

    const short = `${window.location.origin}/#${code}`;
    resultEl.innerHTML = `
      <div class="result-box success" style="margin-top:16px">
        <div style="margin-bottom:8px;font-size:0.8rem;color:var(--text-muted)">Shortened URL:</div>
        <div style="font-size:1.1rem;margin-bottom:12px">${short}</div>
        <button class="copy-btn" onclick="copyText('${short}',this)">📋 Copy link</button>
      </div>
    `;
    document.getElementById('urlInput').value = '';
    document.getElementById('urlAlias').value = '';
    document.getElementById('urlHistory').innerHTML = renderHistory(getLinks());
  };

  // Register tool
  window.toolUrlShortener = { render };
})();
