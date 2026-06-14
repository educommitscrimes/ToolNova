/* ============================================================
   ToolNova — tools/qr-generator.js
   QR Code Generator using a lightweight inline implementation
   ============================================================ */

(function() {
  'use strict';

  function render() {
    return `
      <div class="form-group">
        <label class="tool-label">Text or URL</label>
        <textarea class="tool-textarea" id="qrInput" placeholder="https://example.com or any text…" style="min-height:80px">https://toolnova.app</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="tool-label">Size (px)</label>
          <select class="tool-select" id="qrSize">
            <option value="128">128</option>
            <option value="200" selected>200</option>
            <option value="300">300</option>
            <option value="400">400</option>
          </select>
        </div>
        <div class="form-group">
          <label class="tool-label">Error correction</label>
          <select class="tool-select" id="qrEcc">
            <option value="L">Low (L)</option>
            <option value="M" selected>Medium (M)</option>
            <option value="Q">Quartile (Q)</option>
            <option value="H">High (H)</option>
          </select>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn-primary" onclick="generateQR()">Generate QR Code</button>
      </div>
      <div id="qrOutput"></div>
      <div class="btn-row" id="qrActions" style="display:none;margin-top:8px">
        <button class="copy-btn" onclick="downloadQR()">⬇ Download PNG</button>
      </div>
    `;
  }

  // Minimal QR code generator using Google Chart API (no external JS lib needed)
  window.generateQR = function() {
    const text = document.getElementById('qrInput').value.trim();
    const size = document.getElementById('qrSize').value;
    const ecc  = document.getElementById('qrEcc').value;

    if (!text) { showToast('Enter some text or URL first'); return; }

    const output = document.getElementById('qrOutput');
    const actions = document.getElementById('qrActions');

    // Use Google Chart API for QR generation
    const encoded = encodeURIComponent(text);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&ecc=${ecc}&data=${encoded}&color=000000&bgcolor=ffffff&margin=2`;

    output.innerHTML = `
      <div style="display:flex;justify-content:center;margin-top:20px">
        <div style="position:relative">
          <img id="qrImg" src="${url}" alt="QR Code" width="${size}" height="${size}"
            style="border-radius:8px;border:6px solid white;display:block;background:#fff"
            onload="document.getElementById('qrActions').style.display='flex'"
            onerror="this.parentElement.innerHTML='<div class=result-box error>Could not generate QR code — check your connection</div>'"
          />
        </div>
      </div>
    `;
    actions.style.display = 'none';
  };

  window.downloadQR = function() {
    const img = document.getElementById('qrImg');
    if (!img) return;
    const a = document.createElement('a');
    a.href = img.src;
    a.download = 'qrcode.png';
    a.target = '_blank';
    a.click();
    showToast('QR code downloading…');
  };

  // Register tool
  window.toolQrGenerator = { render };
})();
