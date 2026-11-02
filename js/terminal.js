/* FAAIZ.DEV — Interactive developer terminal.
   Every command performs its advertised action. History via ↑/↓. */
(() => {
  const output = document.getElementById('terminal-output');
  const form = document.getElementById('terminal-form');
  const input = document.getElementById('terminal-input');
  if (!output || !form || !input) return;

  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const print = (text, cls = 'sys') => {
    const el = document.createElement('p');
    el.className = `terminal-line ${cls}`;
    el.innerHTML = text; // built from escaped values below
    output.appendChild(el);
    output.scrollTop = output.scrollHeight;
  };
  const E = {
    help: () => {
      print('Available commands:', 'ok');
      [
        ['about', 'who Faaiz is'],
        ['skills', 'technologies and tools'],
        ['projects', 'list featured projects'],
        ['open <project>', 'open a case study (e.g. open ihub)'],
        ['github', 'open the GitHub profile'],
        ['resume', 'open the resume page'],
        ['contact', 'how to reach Faaiz'],
        ['socials', 'GitHub + LinkedIn links'],
        ['theme', 'toggle dark / light mode'],
        ['whoami', 'who is asking'],
        ['clear', 'clear the terminal']
      ].forEach(([c, d]) => print(`  <b style="color:#00cfff">${c.padEnd(15, ' ')}</b><span>${d}</span>`));
    },
    about: () => print('Syed Faaiz Bin Shan E Ali — student developer & aspiring web developer. Focus: frontend development, backend learning, interactive web apps, UI and graphic design. <a href="about.html">Read the full journey →</a>'),
    skills: () => {
      print('Frontend   HTML5 · CSS3 · JavaScript · React', 'ok');
      print('Backend    Node.js (learning)');
      print('Database   Supabase · Firebase');
      print('Design     UI Design · Photoshop · Illustrator');
      print('<a href="skills.html">Full toolkit →</a>');
    },
    projects: () => {
      print('Featured projects:', 'ok');
      [['ihub', 'iHub Marketplace'], ['raastago', 'RAASTAGO'], ['aversion', 'Aversion University'], ['travelnest', 'TravelNestAgency'], ['headphone', 'Headphone Website'], ['faaiz-dev', 'FAAIZ.DEV Portfolio']]
        .forEach(([slug, name]) => print(`  <b style="color:#7fe7ff">${name}</b> — run <b>open ${slug}</b>`));
    },
    open: args => {
      const map = { ihub: 'projects/ihub-marketplace.html', 'ihub-marketplace': 'projects/ihub-marketplace.html', raastago: 'projects/raastago.html', aversion: 'projects/aversion-university.html', university: 'projects/aversion-university.html', travelnest: 'projects/travelnest-agency.html', headphone: 'projects/headphone-website.html', 'faaiz-dev': 'projects/faaiz-dev.html', portfolio: 'projects/faaiz-dev.html' };
      const key = (args[0] || '').toLowerCase();
      if (map[key]) { print(`Opening ${key} case study…`, 'ok'); window.setTimeout(() => { window.location.href = map[key]; }, 350); }
      else print(`No case study named “${esc(key || '?')}”. Try: open ihub · raastago · aversion · travelnest · headphone · portfolio`, 'err');
    },
    github: () => { print('Opening github.com/syedfaaizali333-creator …', 'ok'); window.open('https://github.com/syedfaaizali333-creator', '_blank', 'noopener'); },
    resume: () => { print('Opening the resume page — use “Print / Save as PDF” there.', 'ok'); window.setTimeout(() => { window.location.href = 'resume.html'; }, 350); },
    contact: () => print(`Reach Faaiz via the <a href="contact.html">contact form</a>, <a href="https://www.linkedin.com/in/syed-faaiz-bin-shan-e-ali-404792429/" target="_blank" rel="noreferrer">LinkedIn</a> or <a href="https://github.com/syedfaaizali333-creator" target="_blank" rel="noreferrer">GitHub</a>.`),
    socials: () => {
      print('GitHub    <a href="https://github.com/syedfaaizali333-creator" target="_blank" rel="noreferrer">github.com/syedfaaizali333-creator</a>');
      print('LinkedIn  <a href="https://www.linkedin.com/in/syed-faaiz-bin-shan-e-ali-404792429/" target="_blank" rel="noreferrer">syed-faaiz-bin-shan-e-ali</a>');
    },
    theme: () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('faaiz-theme', next); } catch (_) {}
      print(`Theme switched to ${next}.`, 'ok');
    },
    whoami: () => print('guest — but you can change that: hire the developer who built this terminal. 😉'),
    clear: () => { output.textContent = ''; },
    echo: args => print(esc(args.join(' ')) || ''),
    date: () => print(new Date().toString())
  };

  const run = raw => {
    const parts = raw.trim().split(/\s+/);
    const cmd = (parts.shift() || '').toLowerCase();
    if (!cmd) return;
    print(esc(raw), 'cmd');
    if (cmd === 'help') return E.help();
    if (E[cmd]) return E[cmd](parts);
    print(`command not found: ${esc(cmd)} — type <b>help</b> to list commands.`, 'err');
  };

  const history = [];
  let histPos = -1;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const raw = input.value;
    if (!raw.trim()) return;
    history.unshift(raw);
    histPos = -1;
    input.value = '';
    run(raw);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length) { histPos = Math.min(histPos + 1, history.length - 1); input.value = history[histPos]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      histPos = Math.max(histPos - 1, -1);
      input.value = histPos === -1 ? '' : history[histPos];
    }
  });

  print('FAAIZ.DEV terminal — type <b>help</b> to see available commands.', 'ok');
})();
