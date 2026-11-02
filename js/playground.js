/* FAAIZ.DEV — Interactive live coding playground.
   Visitor code runs inside a sandboxed iframe (allow-scripts only, no
   same-origin), so it is fully isolated from the portfolio. */
(() => {
  const app = document.getElementById('playground-app');
  if (!app) return;

  const tabs = [...app.querySelectorAll('.pg-tab')];
  const editors = { html: document.getElementById('pg-html'), css: document.getElementById('pg-css'), js: document.getElementById('pg-js') };
  const preview = document.getElementById('pg-preview');
  const consoleLines = document.getElementById('pg-console-lines');
  const statusEl = document.getElementById('pg-status');
  const templateSelect = document.getElementById('pg-template');
  const runBtn = document.getElementById('pg-run');
  const resetBtn = document.getElementById('pg-reset');
  const copyBtn = document.getElementById('pg-copy');
  const clearConsoleBtn = document.getElementById('pg-clear-console');

  const TEMPLATES = {
    starter: {
      name: 'Welcome demo',
      html: `<div class="card">\n  <h1>Hello, Faaiz! 👋</h1>\n  <p>Edit the code on the left and press <b>Run</b>.</p>\n  <button id="go">Click me</button>\n</div>`,
      css: `body {\n  font-family: system-ui, sans-serif;\n  display: grid;\n  place-items: center;\n  min-height: 100vh;\n  margin: 0;\n  background: #001a3d;\n}\n.card {\n  background: #ffffff;\n  color: #001a3d;\n  padding: 32px 38px;\n  border-radius: 18px;\n  text-align: center;\n  box-shadow: 0 0 40px rgba(0, 207, 255, .45);\n}\nbutton {\n  border: 0;\n  border-radius: 999px;\n  padding: 10px 22px;\n  font-weight: 700;\n  color: #fff;\n  background: linear-gradient(115deg, #006eff, #00cfff);\n  cursor: pointer;\n}`,
      js: `let clicks = 0;\nconst btn = document.getElementById('go');\nbtn.addEventListener('click', () => {\n  clicks++;\n  btn.textContent = \`Clicked \${clicks} time\${clicks === 1 ? '' : 's'}\`;\n  console.log('Button clicked', clicks, 'time(s)');\n});`
    },
    dom: {
      name: 'DOM counter',
      html: `<h1 id="value">0</h1>\n<button id="plus">+1</button>\n<button id="minus">-1</button>`,
      css: `body{font-family:system-ui,sans-serif;text-align:center;padding-top:60px;background:#f4f8ff;margin:0}\nh1{font-size:72px;margin:0 0 20px;color:#001a3d}\nbutton{font-size:20px;padding:10px 24px;margin:0 6px;border:0;border-radius:12px;background:#006eff;color:#fff;cursor:pointer}`,
      js: `let n = 0;\nconst v = document.getElementById('value');\nconst set = x => v.textContent = x;\ndocument.getElementById('plus').onclick = () => set(++n);\ndocument.getElementById('minus').onclick = () => set(--n);\nconsole.log('Counter ready — click the buttons.');`
    },
    canvas: {
      name: 'Canvas particles',
      html: `<canvas id="c" width="480" height="300"></canvas>`,
      css: `body{margin:0;display:grid;place-items:center;min-height:100vh;background:#001226}\ncanvas{border:1px solid #00cfff;border-radius:12px;box-shadow:0 0 30px rgba(0,207,255,.4)}`,
      js: `const c = document.getElementById('c'), x = c.getContext('2d');\nconst dots = Array.from({length: 60}, () => ({\n  x: Math.random() * 480, y: Math.random() * 300,\n  vx: (Math.random() - .5) * 2, vy: (Math.random() - .5) * 2\n}));\n(function frame(){\n  x.fillStyle = 'rgba(0,18,38,.25)'; x.fillRect(0, 0, 480, 300);\n  dots.forEach(d => {\n    d.x = (d.x + d.vx + 480) % 480; d.y = (d.y + d.vy + 300) % 300;\n    x.fillStyle = '#00cfff'; x.fillRect(d.x, d.y, 3, 3);\n  });\n  requestAnimationFrame(frame);\n})();\nconsole.log('Particles running.');`
    }
  };

  const state = { active: 'html', template: 'starter' };
  const storeKey = 'faaiz-playground';
  const log = (text, cls = '') => {
    const el = document.createElement('p');
    el.className = `pg-console-line ${cls}`;
    el.textContent = text;
    consoleLines.appendChild(el);
    consoleLines.scrollTop = consoleLines.scrollHeight;
  };

  const save = () => { try { localStorage.setItem(storeKey, JSON.stringify({ template: state.template, code: { html: editors.html.value, css: editors.css.value, js: editors.js.value } })); } catch (_) {} };
  const restore = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
      if (saved && saved.code) {
        Object.keys(editors).forEach(k => { editors[k].value = saved.code[k] || ''; });
        state.template = saved.template || 'starter';
        templateSelect.value = state.template in TEMPLATES ? state.template : 'custom';
        log('Restored your previous code from this browser.', 'info');
        return true;
      }
    } catch (_) {}
    return false;
  };
  const loadTemplate = key => {
    const t = TEMPLATES[key];
    if (!t) return;
    editors.html.value = t.html;
    editors.css.value = t.css;
    editors.js.value = t.js;
    state.template = key;
    templateSelect.value = key;
    save();
    log(`Template loaded: ${t.name}`, 'info');
    run();
  };

  const buildDoc = () => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${editors.css.value}</style></head><body>${editors.html.value}<script>
    (function(){
      const send = (type, args) => { try { parent.postMessage({ __pg: true, type, text: args.map(a => { try { return typeof a === 'string' ? a : JSON.stringify(a); } catch(_) { return String(a); } }).join(' ') }, '*'); } catch(_) {} };
      const origError = console.error;
      console.log = function(){ send('log', [].slice.call(arguments)); };
      console.info = function(){ send('info', [].slice.call(arguments)); };
      console.warn = function(){ send('info', [].slice.call(arguments)); };
      console.error = function(){ send('error', [].slice.call(arguments)); origError && origError.apply(console, arguments); };
      window.onerror = function(msg, src, line, col){ send('error', [msg + ' (line ' + line + ')']); return false; };
      window.addEventListener('unhandledrejection', function(e){ send('error', ['Unhandled promise rejection: ' + e.reason]); });
    })();
  <\/script><script>${editors.js.value}<\/script></body></html>`;

  const run = () => {
    consoleLines.textContent = '';
    preview.srcdoc = buildDoc();
    statusEl.textContent = `Last run ${new Date().toLocaleTimeString()} · ${editors.html.value.length + editors.css.value.length + editors.js.value.length} chars`;
    save();
  };

  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
    Object.keys(editors).forEach(k => editors[k].classList.toggle('is-active', k === tab.dataset.editor));
    state.active = tab.dataset.editor;
    editors[state.active].focus({ preventScroll: true });
  }));

  Object.values(editors).forEach(ed => ed.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: en } = ed;
      ed.value = ed.value.slice(0, s) + '  ' + ed.value.slice(en);
      ed.selectionStart = ed.selectionEnd = s + 2;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
  }));

  runBtn.addEventListener('click', run);
  resetBtn.addEventListener('click', () => loadTemplate(state.template in TEMPLATES ? state.template : 'starter'));
  templateSelect.addEventListener('change', () => loadTemplate(templateSelect.value));
  clearConsoleBtn.addEventListener('click', () => { consoleLines.textContent = ''; });

  copyBtn.addEventListener('click', async () => {
    const text = editors[state.active].value;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = '✓ Copied';
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); copyBtn.textContent = '✓ Copied'; } catch (_) { copyBtn.textContent = 'Press Ctrl+C'; }
      ta.remove();
    }
    window.setTimeout(() => { copyBtn.textContent = 'Copy code'; }, 1400);
  });

  addEventListener('message', e => {
    if (e.data && e.data.__pg) log(e.data.text, e.data.type === 'error' ? 'err' : e.data.type === 'info' ? 'info' : 'ok');
  });

  if (!restore()) loadTemplate('starter'); else run();
})();
