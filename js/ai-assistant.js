/* FAAIZ.DEV — AI portfolio assistant.
   Grounded in verified portfolio information only. English + Roman Urdu.
   Optional secure hook: set FAAIZ_CONFIG.AI_ENDPOINT to a server-side
   proxy (see api/assistant.js) — API keys stay on the server, never here.
   Falls back to the built-in knowledge base if the service is unavailable. */
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const rootEl = document.documentElement;
  if ($('#fz-widget')) return;

  /* -------- verified knowledge base (mirrors site content) -------- */
  const KB = {
    name: 'Syed Faaiz Bin Shan E Ali',
    title: 'student developer & aspiring web developer',
    focus: 'frontend development, backend learning, interactive web apps, UI design and graphic design',
    skills: 'HTML5, CSS3, JavaScript and React on the frontend; Node.js on the backend; Supabase and Firebase for databases; UI design with Adobe Photoshop and Illustrator',
    js: 'Faaiz uses JavaScript to build interactive interfaces — this portfolio itself (loader animation, custom cursor, terminal, playground) is vanilla JavaScript. He is currently strengthening React.',
    contact: 'via the contact page form, LinkedIn or GitHub',
    projects: [
      { name: 'iHub Marketplace', desc: 'an iPhone-focused marketplace concept bringing products, repair services and custom covers into one experience', tech: 'HTML, CSS, JavaScript, Firebase', link: 'projects/ihub-marketplace.html' },
      { name: 'RAASTAGO', desc: '“See the Road Ahead” — a Pakistan road-information project focused on traffic, routes and road problems', tech: 'HTML, CSS, JavaScript', link: 'projects/raastago.html' },
      { name: 'Aversion University', desc: 'a multi-page university website focused on semantic HTML and responsive Flexbox structure', tech: 'HTML5, CSS3, Flexbox', link: 'projects/aversion-university.html' },
      { name: 'TravelNestAgency', desc: 'a travel-agency website exploring destination presentation and travel-focused page structure', tech: 'HTML, CSS, JavaScript', link: 'projects/travelnest-agency.html' },
      { name: 'Headphone Website', desc: 'a product website concept with the tagline “Feel Every Beat” and a bold visual direction', tech: 'HTML, CSS, JavaScript, UI design', link: 'projects/headphone-website.html' },
      { name: 'FAAIZ.DEV Portfolio', desc: 'this portfolio — a cinematic loader, custom cursor, live coding playground and developer terminal, all in vanilla JS', tech: 'HTML, CSS, JavaScript, Supabase', link: 'projects/faaiz-dev.html' }
    ]
  };

  const URDU = /(kya|kaise|kyun|kyu|hai|hy|hain|batao|bata|batayen|salam|assalam|asalam|shukriya|acha|theek|kahan|kab|kaun|kon|dikhao|dikha|chahiye|samajh|nahi|haan|urdu|apna|aap|tum|mera|sab|ach[aá])/i;
  const isUrdu = q => URDU.test(q);

  const findProject = q => KB.projects.find(p => p.name.toLowerCase().split(' ').some(w => w.length > 3 && q.includes(w.toLowerCase())) || q.includes(p.name.toLowerCase().replace(/\s/g, '')));

  const answerLocal = raw => {
    const q = raw.toLowerCase();
    const urdu = isUrdu(q);
    const p = findProject(q);
    const L = (en, ru) => (urdu ? ru : en);
    if (p) return {
      text: L(`${p.name} — ${p.desc}. Built with ${p.tech}.`, `${p.name} — ${p.desc}. Is mein ${p.tech} use hua hai.`),
      link: p.link, label: L('Read the case study', 'Case study parhein')
    };
    if (/skill|technolog|stack|tool|html|css|javascript|react|node|design|photoshop|illustrator|haarat/.test(q)) return {
      text: L(`Faaiz works with ${KB.skills}. He presents his skills honestly — learning in public, no invented percentages.`, `Faaiz ke paas ${KB.skills} hain. Wo skills ko imandaari se present karte hain — baghair banaye percentages ke.`),
      link: 'skills.html', label: L('View skills', 'Skills dekhein')
    };
    if (/javascript|js\b/.test(q)) return {
      text: KB.js, link: 'playground.html', label: L('Try the live playground', 'Playground azmayein')
    };
    if (/best|favourite|favorite|top|recommend|suggest|kaun sa/.test(q)) return {
      text: L('Start with iHub Marketplace (the most complete build: products, services and a Firebase database) and RAASTAGO (a strong information-architecture concept). The portfolio itself shows interactive-engineering skills.', 'iHub Marketplace (sab se mukammal build) aur RAASTAGO (behtareen information structure) dekhein. Khud portfolio interactive engineering ka misaal hai.'),
      link: 'projects.html', label: L('Browse projects', 'Projects dekhein')
    };
    if (/project|work|portfolio|build/.test(q)) return {
      text: L(`Faaiz has built ${KB.projects.length} featured projects: ${KB.projects.map(x => x.name).join(', ')}. Which one should I explain?`, `Faaiz ne ${KB.projects.length} projects banaye hain: ${KB.projects.map(x => x.name).join(', ')}. Kaunsa detail mein batata hoon?`),
      link: 'projects.html', label: L('Explore projects', 'Projects explore karein')
    };
    if (/journey|learn|study|education|student|about|who|kaun/.test(q)) return {
      text: L(`${KB.name} is a ${KB.title}. Focus: ${KB.focus}. The journey started with HTML & CSS, moved into JavaScript, and continues with React, Node.js and databases — learning by building.`, `${KB.name} ek student developer hain. Focus: ${KB.focus}. Safar HTML/CSS se shuru hua, ab JavaScript, React aur databases par kaam jaari hai — banate hue seekhte hain.`),
      link: 'about.html', label: L('Read the journey', 'Safar parhein')
    };
    if (/resume|cv/.test(q)) return {
      text: L('The resume page has a print-ready summary you can save as PDF in one click.', 'Resume page par print-ready summary hai — ek click mein PDF ban sakti hai.'),
      link: 'resume.html', label: L('Open resume', 'Resume kholein')
    };
    if (/contact|email|hire|collaborat|reach|linkedin|github|rabta/.test(q)) return {
      text: L(`You can reach Faaiz ${KB.contact}.`, `Faaiz se rabta ${KB.contact} mumkin hai.`),
      link: 'contact.html', label: L('Contact Faaiz', 'Rabta karein')
    };
    if (/playground|terminal|code|cursor|loader/.test(q)) return {
      text: L('This site is hand-built: a cinematic code-to-portrait loader, a basith-style custom cursor, a live coding playground and this assistant — vanilla JS only.', 'Ye site haath se bani hai: cinematic loader, custom cursor, live coding playground aur ye assistant — sab vanilla JS mein.'),
      link: 'playground.html', label: L('Open the playground', 'Playground kholein')
    };
    if (/salam|hello|hi\b|hey|assalam/.test(q)) return {
      text: L('Hello! I’m Faaiz AI. Ask me about Faaiz’s projects, skills, learning journey or contact links — English ya Roman Urdu mein.', 'Salam! Main Faaiz AI hoon. Projects, skills ya rabte ke baare mein poochein — English ya Roman Urdu mein.'),
      link: null
    };
    return {
      text: L('I’m Faaiz AI, the portfolio guide. Try: “What technologies does Faaiz use?”, “Tell me about his best projects”, “Explain iHub Marketplace” or “How can I contact him?”', 'Main Faaiz AI hoon. Poochein: “Faaiz kaunsi technologies use karte hain?”, “Best projects batao” ya “Rabta kaise karein?”'),
      link: null
    };
  };

  /* Optional secure AI hook: POSTs to a server-side proxy. No keys here. */
  const askServer = async (message, lang) => {
    const cfg = window.FAAIZ_CONFIG || {};
    if (!cfg.AI_ENDPOINT) return null;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12000);
      const res = await fetch(cfg.AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, lang }),
        signal: ctrl.signal
      });
      clearTimeout(timer);
      if (!res.ok) return null;
      const data = await res.json();
      const text = data && (data.reply || data.text || data.message);
      return typeof text === 'string' && text.trim() ? { text: text.trim(), link: data.link || null, label: data.label || null } : null;
    } catch (_) { return null; } // graceful: fall back to the local knowledge base
  };

  /* ------------------------------ widget UI ------------------------------ */
  const widget = document.createElement('section');
  widget.id = 'fz-widget';
  widget.className = 'fz-widget';
  widget.innerHTML = `<button class="fz-launch" type="button" aria-label="Open Faaiz AI portfolio assistant"><span class="fz-spark" aria-hidden="true"><svg viewBox="0 0 48 48" role="img" aria-label="Faaiz AI robot mascot"><defs><linearGradient id="fzBot" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#00cfff"/><stop offset="1" stop-color="#006eff"/></linearGradient></defs><path d="M24 5v6" stroke="#00cfff" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="4" r="3" fill="#00cfff"/><rect x="7" y="12" width="34" height="27" rx="10" fill="url(#fzBot)"/><rect x="12" y="18" width="24" height="13" rx="5" fill="#001a3d"/><circle cx="18" cy="24" r="2.4" fill="#7fe7ff"/><circle cx="30" cy="24" r="2.4" fill="#7fe7ff"/><path d="M18 34q6 4 12 0" fill="none" stroke="#001a3d" stroke-width="2" stroke-linecap="round"/><path d="M3 23h4M41 23h4" stroke="#00cfff" stroke-width="3" stroke-linecap="round"/></svg></span><span class="fz-launch-copy"><b>Faaiz AI</b><small>Drag me · Ask about my work</small></span><span class="fz-online"></span></button><div class="fz-panel" hidden><div class="fz-head" title="Drag to move assistant"><span class="fz-avatar" aria-hidden="true"><svg viewBox="0 0 48 48"><rect x="7" y="12" width="34" height="27" rx="10" fill="#00cfff"/><rect x="12" y="18" width="24" height="13" rx="5" fill="#001a3d"/><circle cx="18" cy="24" r="2.4" fill="#7fe7ff"/><circle cx="30" cy="24" r="2.4" fill="#7fe7ff"/><path d="M18 34q6 4 12 0" fill="none" stroke="#001a3d" stroke-width="2" stroke-linecap="round"/><path d="M24 5v7" stroke="#00cfff" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="4" r="3" fill="#7fe7ff"/></svg></span><div><b>Faaiz AI</b><small>Portfolio guide · drag this bar to move</small></div><button type="button" class="fz-close" aria-label="Close assistant">×</button></div><div class="fz-messages" aria-live="polite"></div><form class="fz-form"><input aria-label="Ask Faaiz AI" placeholder="Ask about Faaiz… (English / Roman Urdu)" maxlength="300" required><button type="submit" aria-label="Send message">↗</button></form><p class="fz-footnote">Answers are grounded in information published on this portfolio</p></div>`;
  document.body.appendChild(widget);

  const launch = $('.fz-launch', widget), panel = $('.fz-panel', widget), close = $('.fz-close', widget),
    messages = $('.fz-messages', widget), input = $('input', widget), formChat = $('.fz-form', widget);

  const SUGGESTED = [
    { q: 'What technologies does Faaiz use?', ru: 'Faaiz kaunsi technologies use karte hain?' },
    { q: 'Tell me about his best projects', ru: 'Best projects batao' },
    { q: 'Explain iHub Marketplace', ru: 'iHub Marketplace samjhao' },
    { q: 'How can I contact him?', ru: 'Rabta kaise karein?' }
  ];

  const addSuggest = () => {
    const wrap = document.createElement('div');
    wrap.className = 'fz-suggest';
    SUGGESTED.forEach(s => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = isUrdu(input.value) || widget.dataset.lang === 'urdu' ? s.ru : s.q;
      b.addEventListener('click', () => ask(s.q));
      wrap.appendChild(b);
    });
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  };

  const addMessage = (text, type, link) => {
    const el = document.createElement('div');
    el.className = `fz-message ${type}`;
    el.textContent = text;
    messages.appendChild(el);
    if (link) {
      const a = document.createElement('a');
      a.className = 'fz-answer-link';
      a.href = link.link;
      a.textContent = (link.label || 'Open') + ' ↗';
      messages.appendChild(a);
    }
    messages.scrollTop = messages.scrollHeight;
  };

  const addTyping = () => {
    const el = document.createElement('div');
    el.className = 'fz-message bot fz-typing';
    el.setAttribute('aria-label', 'Assistant is typing');
    el.innerHTML = '<i></i><i></i><i></i>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  };

  const greeting = () => {
    addMessage('Hi! I’m Faaiz AI — ask me about Faaiz’s projects, skills and learning journey. English ya Roman Urdu, dono chalenge.', 'bot');
    addSuggest();
  };

  let busy = false;
  const ask = async q => {
    if (!q || busy) return;
    busy = true;
    widget.dataset.lang = isUrdu(q) ? 'urdu' : 'english';
    addMessage(q, 'user');
    input.value = '';
    const typing = addTyping();
    const served = (await askServer(q, widget.dataset.lang)) || answerLocal(q);
    await new Promise(r => setTimeout(r, 450 + Math.random() * 350)); // natural pace
    typing.remove();
    addMessage(served.text, 'bot', served.link ? served : null);
    busy = false;
  };

  const openChat = () => { panel.hidden = false; launch.classList.add('is-open'); if (!messages.children.length) greeting(); input.focus({ preventScroll: true }); };
  launch.addEventListener('click', () => { if (widget.dataset.dragged === 'yes') { widget.dataset.dragged = 'no'; return; } panel.hidden ? openChat() : (panel.hidden = true, launch.classList.remove('is-open')); });
  close.addEventListener('click', () => { panel.hidden = true; launch.classList.remove('is-open'); });

  formChat.addEventListener('submit', e => { e.preventDefault(); const q = input.value.trim(); if (q) ask(q); });

  /* drag (mascot button or panel header), clamped to viewport */
  let drag = null;
  const dragHandles = [launch, $('.fz-head', widget)];
  const placeWidget = (x, y) => {
    const rect = widget.getBoundingClientRect();
    const left = Math.max(8, Math.min(innerWidth - rect.width - 8, x));
    const top = Math.max(8, Math.min(innerHeight - Math.min(rect.height, innerHeight - 16) - 8, y));
    widget.style.left = `${left}px`; widget.style.top = `${top}px`;
    widget.style.right = 'auto'; widget.style.bottom = 'auto';
  };
  dragHandles.forEach(handle => {
    if (!handle) return;
    handle.addEventListener('pointerdown', e => {
      if (e.target.closest('button') && handle !== launch) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const rect = widget.getBoundingClientRect();
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, left: rect.left, top: rect.top, moved: false };
      handle.setPointerCapture && handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', e => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
      if (drag.moved) { placeWidget(drag.left + dx, drag.top + dy); widget.classList.add('is-dragging'); }
    });
    const stopDrag = e => { if (!drag || drag.id !== e.pointerId) return; if (drag.moved) widget.dataset.dragged = 'yes'; drag = null; widget.classList.remove('is-dragging'); };
    handle.addEventListener('pointerup', stopDrag);
    handle.addEventListener('pointercancel', stopDrag);
  });
  addEventListener('resize', () => { if (widget.style.left) placeWidget(parseFloat(widget.style.left), parseFloat(widget.style.top) || 8); });
  document.addEventListener('pointerdown', e => { if (!widget.contains(e.target) && !panel.hidden) { panel.hidden = true; launch.classList.remove('is-open'); } });
})();
