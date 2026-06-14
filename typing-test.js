/* ============================================================
   ToolNova — tools/typing-test.js
   Typing Speed Test: WPM, accuracy, live highlighting
   ============================================================ */

(function () {
  'use strict';

  const QUOTES = [
    "The quick brown fox jumps over the lazy dog near the riverbank on a warm summer afternoon.",
    "Programming is the art of telling another human what one wants the computer to do in precise and unambiguous terms.",
    "The best way to predict the future is to invent it, one line of code at a time.",
    "In the middle of every difficulty lies opportunity waiting to be discovered by those who persist.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts above all.",
    "Design is not just what it looks like and feels like. Design is how it works in the real world.",
    "Any sufficiently advanced technology is indistinguishable from magic according to Arthur C. Clarke.",
    "The only way to do great work is to love what you do and never stop learning new skills.",
    "Simplicity is the ultimate sophistication, as Leonardo da Vinci once wisely observed centuries ago.",
    "To iterate is human, to recurse divine — and to ship working code is the highest calling.",
  ];

  /* State */
  let words       = [];
  let wordIndex   = 0;
  let charIndex   = 0;
  let startTime   = null;
  let timerInterval = null;
  let testDuration  = 60;
  let timeLeft      = 60;
  let totalTyped    = 0;
  let correctTyped  = 0;
  let errors        = 0;
  let testActive    = false;
  let testFinished  = false;

  /* ── Render ────────────────────────────────────────────────*/
  function render() {
    return `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap">
        <label class="tool-label" style="margin:0">Duration:</label>
        <div style="display:flex;gap:6px">
          <button class="btn-secondary tt-dur active" data-dur="15"  onclick="setTypingDuration(15,this)"  style="padding:6px 14px;font-size:0.8rem">15s</button>
          <button class="btn-secondary tt-dur"        data-dur="30"  onclick="setTypingDuration(30,this)"  style="padding:6px 14px;font-size:0.8rem">30s</button>
          <button class="btn-secondary tt-dur"        data-dur="60"  onclick="setTypingDuration(60,this)"  style="padding:6px 14px;font-size:0.8rem">60s</button>
          <button class="btn-secondary tt-dur"        data-dur="120" onclick="setTypingDuration(120,this)" style="padding:6px 14px;font-size:0.8rem">120s</button>
        </div>
        <div style="margin-left:auto;font-family:var(--font-mono);color:var(--purple);font-size:1.1rem;font-weight:700" id="ttTimer">15s</div>
      </div>

      <div class="typing-stats" style="margin-bottom:16px">
        <div class="typing-stat"><div class="typing-stat-val" id="ttWpm">0</div><div class="typing-stat-key">WPM</div></div>
        <div class="typing-stat"><div class="typing-stat-val" id="ttAcc">100%</div><div class="typing-stat-key">Accuracy</div></div>
        <div class="typing-stat"><div class="typing-stat-val" id="ttErr">0</div><div class="typing-stat-key">Errors</div></div>
        <div class="typing-stat"><div class="typing-stat-val" id="ttWords">0</div><div class="typing-stat-key">Words</div></div>
      </div>

      <div class="typing-display" id="ttDisplay" onclick="document.getElementById('ttInput').focus()"></div>

      <input class="typing-input" id="ttInput" type="text"
        placeholder="Click here and start typing…"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
        oninput="handleTypingInput(event)"
        onkeydown="handleTypingKeydown(event)"
      />

      <div class="btn-row">
        <button class="btn-secondary" onclick="resetTypingTest()">↺ Restart</button>
        <button class="btn-secondary" onclick="newTypingQuote()">New quote</button>
      </div>

      <div id="ttResult" style="margin-top:16px"></div>
    `;
  }

  /* ── Init test ─────────────────────────────────────────────*/
  function initTest(dur) {
    testDuration = dur || testDuration;
    timeLeft     = testDuration;
    wordIndex    = 0;
    charIndex    = 0;
    startTime    = null;
    totalTyped   = 0;
    correctTyped = 0;
    errors       = 0;
    testActive   = false;
    testFinished = false;
    clearInterval(timerInterval);

    // Pick a random quote and split into chars
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    words = quote.split('');

    renderDisplay();
    resetStats();

    const timerEl = document.getElementById('ttTimer');
    if (timerEl) timerEl.textContent = testDuration + 's';

    const inp = document.getElementById('ttInput');
    if (inp) { inp.value = ''; inp.disabled = false; inp.placeholder = 'Click here and start typing…'; }

    const res = document.getElementById('ttResult');
    if (res) res.innerHTML = '';
  }

  function renderDisplay() {
    const display = document.getElementById('ttDisplay');
    if (!display) return;
    display.innerHTML = words.map((ch, i) => {
      let cls = 'typing-char';
      if (i < charIndex) cls += ' correct';
      if (i === charIndex) cls += ' current';
      const escaped = ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch === '&' ? '&amp;' : ch === ' ' ? '&nbsp;' : ch;
      return `<span class="${cls}" data-i="${i}">${escaped}</span>`;
    }).join('');
  }

  function resetStats() {
    ['ttWpm','ttAcc','ttErr','ttWords'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = id === 'ttAcc' ? '100%' : '0';
    });
  }

  /* ── Duration button ────────────────────────────────────────*/
  window.setTypingDuration = function(dur, btn) {
    document.querySelectorAll('.tt-dur').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    initTest(dur);
  };

  window.newTypingQuote = function() { initTest(); };
  window.resetTypingTest = function() { initTest(); };

  /* ── Timer ──────────────────────────────────────────────────*/
  function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
      timeLeft = Math.max(0, testDuration - Math.floor((Date.now() - startTime) / 1000));
      const timerEl = document.getElementById('ttTimer');
      if (timerEl) timerEl.textContent = timeLeft + 's';
      updateLiveStats();
      if (timeLeft <= 0) finishTest();
    }, 200);
  }

  /* ── Input handling ─────────────────────────────────────────*/
  window.handleTypingInput = function(e) {
    const inp = document.getElementById('ttInput');
    if (!inp || testFinished) return;
    const val = inp.value;
    if (!val) return;

    if (!testActive) {
      testActive = true;
      startTimer();
    }

    // Process each character typed
    const ch = val[val.length - 1]; // last typed char
    inp.value = '';

    if (charIndex < words.length) {
      totalTyped++;
      if (ch === words[charIndex]) {
        correctTyped++;
      } else {
        errors++;
      }
      charIndex++;
      renderDisplay();
    }

    // Finished all chars
    if (charIndex >= words.length) finishTest();
    updateLiveStats();
  };

  window.handleTypingKeydown = function(e) {
    // Backspace to go back one char
    if (e.key === 'Backspace' && charIndex > 0 && !testFinished) {
      charIndex--;
      totalTyped = Math.max(0, totalTyped - 1);
      renderDisplay();
      e.preventDefault();
    }
  };

  /* ── Stats ──────────────────────────────────────────────────*/
  function updateLiveStats() {
    const elapsed = startTime ? (Date.now() - startTime) / 60000 : 0;
    const wpm     = elapsed > 0 ? Math.round((correctTyped / 5) / elapsed) : 0;
    const acc     = totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 100;
    const wordsDone = Math.floor(charIndex / 5);

    const wpmEl  = document.getElementById('ttWpm');
    const accEl  = document.getElementById('ttAcc');
    const errEl  = document.getElementById('ttErr');
    const wrdEl  = document.getElementById('ttWords');

    if (wpmEl)  wpmEl.textContent  = wpm;
    if (accEl)  accEl.textContent  = acc + '%';
    if (errEl)  errEl.textContent  = errors;
    if (wrdEl)  wrdEl.textContent  = wordsDone;
  }

  /* ── Finish ─────────────────────────────────────────────────*/
  function finishTest() {
    clearInterval(timerInterval);
    testFinished = true;
    testActive   = false;

    const inp = document.getElementById('ttInput');
    if (inp) { inp.disabled = true; inp.placeholder = 'Test complete!'; }

    const elapsed  = startTime ? (Date.now() - startTime) / 60000 : testDuration / 60;
    const wpm      = Math.round((correctTyped / 5) / elapsed);
    const acc      = totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 100;
    const grade    = wpm >= 80 ? '🏆 Excellent!' : wpm >= 60 ? '⭐ Great!' : wpm >= 40 ? '👍 Good' : '📈 Keep practicing!';

    // Save best
    const best = parseInt(localStorage.getItem('tn_typing_best') || '0');
    if (wpm > best) localStorage.setItem('tn_typing_best', wpm);
    const bestWpm = Math.max(wpm, best);

    const res = document.getElementById('ttResult');
    if (res) res.innerHTML = `
      <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:12px;padding:20px;text-align:center">
        <div style="font-size:1.5rem;margin-bottom:8px">${grade}</div>
        <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:16px">
          <div class="typing-stat"><div class="typing-stat-val">${wpm}</div><div class="typing-stat-key">WPM</div></div>
          <div class="typing-stat"><div class="typing-stat-val">${acc}%</div><div class="typing-stat-key">Accuracy</div></div>
          <div class="typing-stat"><div class="typing-stat-val">${errors}</div><div class="typing-stat-key">Errors</div></div>
          <div class="typing-stat"><div class="typing-stat-val">${bestWpm}</div><div class="typing-stat-key">Best WPM</div></div>
        </div>
        <button class="btn-primary" onclick="resetTypingTest()" style="margin:0 auto">Try again</button>
      </div>
    `;
  }

  /* ── Listen for tool open ───────────────────────────────────*/
  document.addEventListener('toolOpened', e => {
    if (e.detail.id === 'typing-test') {
      setTimeout(() => initTest(15), 50);
    }
  });

  document.addEventListener('toolClosed', () => {
    clearInterval(timerInterval);
    testActive = false;
    testFinished = false;
  });

  /* Register */
  window.toolTypingTest = { render };
})();
