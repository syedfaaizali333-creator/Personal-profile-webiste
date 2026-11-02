(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const rootEl = document.documentElement;

  /* ============================================================
     Cinematic intro: code initialization -> code builds the
     portrait (particles sampled from the real photograph) ->
     COMPLETE COMPILE -> continuous handoff into the homepage.
     The loader markup ships inside every page; the inline <head>
     script gates it to the first open per browser session.
     ============================================================ */
  let experienceStarted = false;
  const startExperience = () => {
    if (experienceStarted) return;
    experienceStarted = true;
    const reveals = $$('.reveal');
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);} }), {threshold:.12,rootMargin:'0px 0px -25px 0px'});
      reveals.forEach(el => observer.observe(el));
    } else reveals.forEach(el => el.classList.add('is-visible'));
  };

  const introLoader = $('#intro-loader');
  const introPlaying = Boolean(introLoader) && rootEl.dataset.intro === 'on';
  if (introLoader && !introPlaying) introLoader.remove();

  const wait = ms => new Promise(r => window.setTimeout(r, ms));
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const easeInOut = t => (t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2);
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  // Subtle electric-blue glow around the hero portrait (all visit types).
  const heroImg = document.querySelector('.portrait-photo img');
  const heroFrame = heroImg ? heroImg.closest('.portrait-frame') : null;
  if (!introPlaying && heroFrame) heroFrame.classList.add('portrait-landed');

  const runIntro = async () => {
    const fill = $('#intro-bar-fill', introLoader);
    const percent = $('#intro-percent', introLoader);
    const status = $('#intro-status', introLoader);
    const stage = $('.intro-stage', introLoader);
    if (!fill || !percent || !status) { introLoader.remove(); rootEl.dataset.intro = 'off'; startExperience(); return; }

    const isHome = Boolean(heroImg);
    if (!isHome && stage) stage.remove(); // the portrait phase is home-only

    // Start fetching the photograph immediately so it decodes while the
    // terminal types (phase 2 begins with the image already in memory).
    const photoSrc = isHome ? (heroImg.currentSrc || heroImg.src) : '';
    const photo = isHome ? document.createElement('img') : null;
    if (photo) {
      photo.alt = '';
      photo.className = 'intro-portrait';
      photo.src = photoSrc;
      try { photo.decode && photo.decode().catch(() => {}); } catch (_) {}
    }
    const decodePhoto = img => {
      try {
        const pr = img.decode ? img.decode() : Promise.resolve();
        return Promise.race([pr.catch(() => {}), wait(700)]);
      } catch (_) { return Promise.resolve(); }
    };

    const setProgress = v => { const q = clamp01(v); fill.style.transform = `scaleX(${q.toFixed(4)})`; percent.textContent = `${Math.floor(q * 100)}%`; };
    const setStatus = t => { if (status.textContent !== t) status.textContent = t; };

    /* ---- Phase 1: coding initialization ---- */
    const CODE_MS = isHome ? 1600 : 2050;
    setStatus('Initializing');
    await new Promise(done => {
      const t0 = performance.now();
      const frame = now => {
        const t = clamp01((now - t0) / CODE_MS);
        setProgress(easeInOut(t) * (isHome ? .38 : .92));
        setStatus(t < .3 ? 'Initializing' : t < .72 ? 'Loading assets' : isHome ? 'Preparing portrait' : 'Compiling experience');
        t < 1 ? requestAnimationFrame(frame) : done();
      };
      requestAnimationFrame(frame);
    });

    /* ---- Phase 2: code builds the portrait (home only) ---- */
    if (isHome && stage) {
      introLoader.classList.add('is-materializing');
      setStatus('Compiling portrait');
      // Size the stage from the hero photo box so the handoff is seamless.
      const rect = heroImg.getBoundingClientRect();
      const ratio = rect.width > 4 && rect.height > 4 ? rect.height / rect.width : 1.07;
      const maxW = Math.min(rect.width > 4 ? rect.width : 380, innerWidth * .82, 400);
      const maxH = Math.min(innerHeight * .5, 430);
      let w = maxW, h = w * ratio;
      if (h > maxH) { h = maxH; w = h / ratio; }
      w = Math.round(w); h = Math.round(h);
      stage.style.width = `${w}px`;
      stage.style.height = `${h}px`; // expands smoothly (CSS transition), no layout jump
      const canvas = document.createElement('canvas');
      canvas.className = 'intro-canvas';
      const scan = document.createElement('span');
      scan.className = 'intro-scanline';
      stage.append(canvas, photo, scan);
      stage.hidden = false;
      await decodePhoto(photo); // usually instant: fetched during phase 1

      const MATERIAL_MS = 1700;
      await new Promise(done => {
        stage.classList.add('is-active');
        const matStart = performance.now();
        let particlesDone = false;
        // Progress/status driver for this phase.
        const prog = now => {
          if (particlesDone) return;
          const t = clamp01((now - matStart) / MATERIAL_MS);
          setProgress(.38 + .52 * easeInOut(t));
          setStatus(t > .86 ? 'Finalizing' : 'Compiling portrait');
          if (t < 1) requestAnimationFrame(prog);
        };
        requestAnimationFrame(prog);
        // Particle engine: sample the real photograph, converge pixels.
        try {
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('no 2d');
          const dpr = Math.min(devicePixelRatio || 1, 2);
          canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
          ctx.scale(dpr, dpr);
          const G = w < 360 ? 44 : 60;
          const off = document.createElement('canvas');
          off.width = G; off.height = G;
          const octx = off.getContext('2d');
          octx.drawImage(photo, 0, 0, G, G);
          const data = octx.getImageData(0, 0, G, G).data;
          const cellW = w / G, cellH = h / G;
          const parts = [];
          for (let gy = 0; gy < G; gy++) {
            for (let gx = 0; gx < G; gx++) {
              const k = (gy * G + gx) * 4;
              if (data[k + 3] < 40) continue;
              const ang = Math.random() * Math.PI * 2;
              const rad = (.3 + Math.random() * .5) * Math.max(w, h) * .55;
              parts.push({
                tx: gx * cellW + cellW / 2, ty: gy * cellH + cellH / 2,
                sx: w / 2 + Math.cos(ang) * rad, sy: h / 2 + Math.sin(ang) * rad,
                delay: (gy / G) * .5 + Math.random() * .12, // scan downward, top rows first
                r: Math.min(cellW, cellH) * .5 + Math.random() * .4,
                c: `${data[k]},${data[k + 1]},${data[k + 2]}`
              });
            }
          }
          const t0 = performance.now();
          const frame = now => {
            const t = clamp01((now - t0) / MATERIAL_MS);
            ctx.clearRect(0, 0, w, h);
            for (const pt of parts) {
              const p = clamp01((t - pt.delay) / .62);
              if (p <= 0) continue;
              const e = easeOutCubic(p);
              ctx.globalAlpha = p < .85 ? .95 : clamp01((1 - p) * 6.5); // dissolve as the photo takes over
              if (ctx.globalAlpha <= 0.02) continue;
              ctx.fillStyle = `rgb(${pt.c})`;
              ctx.fillRect(pt.sx + (pt.tx - pt.sx) * e - pt.r / 2, pt.sy + (pt.ty - pt.sy) * e - pt.r / 2, pt.r, pt.r);
            }
            ctx.globalAlpha = 1;
            if (t > .48) stage.classList.add('is-emerging'); // real photograph fades in beneath
            if (t < 1) requestAnimationFrame(frame);
            else { ctx.clearRect(0, 0, w, h); particlesDone = true; done(); }
          };
          requestAnimationFrame(frame);
        } catch (_) {
          // Graceful fallback (no canvas / tainted file:// canvas): photo still materializes.
          particlesDone = true;
          window.setTimeout(() => stage.classList.add('is-emerging'), MATERIAL_MS * .4);
          window.setTimeout(() => { setProgress(.9); done(); }, MATERIAL_MS);
        }
      });
      stage.classList.add('is-materialized');
    } else {
      await new Promise(done => {
        const t0 = performance.now();
        const frame = now => {
          const t = clamp01((now - t0) / 450);
          setProgress(.92 + .08 * t);
          t < 1 ? requestAnimationFrame(frame) : done();
        };
        requestAnimationFrame(frame);
      });
    }

    /* ---- Phase 3: COMPLETE COMPILE ---- */
    setProgress(1);
    setStatus('Complete');
    introLoader.classList.add('is-complete');
    await wait(isHome ? 800 : 650);

    /* ---- Phase 4: continuous handoff into the homepage ---- */
    rootEl.dataset.intro = 'done';      // releases the hero entrance animations
    rootEl.classList.add('intro-finished');
    startExperience();
    let clone = null;
    if (isHome && stage && heroFrame) {
      const from = stage.getBoundingClientRect();
      const to = heroImg.getBoundingClientRect();
      if (from.width > 4 && to.width > 4) {
        clone = document.createElement('div');
        clone.className = 'intro-clone';
        clone.setAttribute('aria-hidden', 'true');
        clone.style.width = `${from.width}px`;
        clone.style.height = `${from.height}px`;
        clone.style.left = `${from.left}px`;
        clone.style.top = `${from.top}px`;
        clone.innerHTML = `<img alt="" src="${photoSrc}">`;
        document.body.appendChild(clone);
        stage.style.visibility = 'hidden'; // one image travels, no duplicate flash
        const dx = to.left - from.left, dy = to.top - from.top;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          clone.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${(to.width / from.width).toFixed(4)}, ${(to.height / from.height).toFixed(4)})`;
        }));
      }
    }
    introLoader.classList.add('is-exiting'); // curtain lifts while the clone flies down
    window.setTimeout(() => {
      if (clone) clone.remove();
      if (heroFrame) heroFrame.classList.add('portrait-landed');
      introLoader.remove();
    }, 1000);
  };

  if (introPlaying) runIntro(); else startExperience();

  // The home portrait is an interactive two-sided card: portrait <-> source code.
  const portraitFlip = $('.portrait-flip');
  if (portraitFlip) {
    portraitFlip.addEventListener('click', () => {
      const showingCode = portraitFlip.closest('.code-reveal').classList.toggle('is-code-mode');
      portraitFlip.setAttribute('aria-pressed', String(showingCode));
      portraitFlip.setAttribute('aria-label', showingCode ? 'Show profile photo' : 'Show portfolio code');
    });
  }

  const toggle = $('.menu-toggle');
  const nav = $('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? '×' : '☰'; });
    $$('a', nav).forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); toggle.textContent='☰'; }));
  }
  const progress = $('.progress-bar'), back = $('.back-top');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
    if (back) back.classList.toggle('visible', scrollY > 500);
    const header = $('.navbar'); if(header) header.style.boxShadow = scrollY > 10 ? '0 10px 30px rgba(0,0,0,.12)' : 'none';
  };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
  if (back) back.addEventListener('click', () => scrollTo({top:0,behavior:'smooth'}));
  const filterButtons = $$('.filter-btn');
  filterButtons.forEach(btn => btn.addEventListener('click', () => {
    filterButtons.forEach(b=>b.classList.toggle('active', b===btn));
    const filter = btn.dataset.filter;
    $$('.project-card[data-category]').forEach(card => { card.hidden = !(filter === 'all' || card.dataset.category.split(' ').includes(filter)); });
  }));
  const form = $('#contact-form');
  if(form) form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#name').value.trim(), email = $('#email').value.trim(), message = $('#message').value.trim();
    const status = $('#form-status');
    if(!name || !email || !message){status.textContent='Please fill in all fields.';return;}
    const config = window.FAAIZ_CONFIG || {};
    if(config.SUPABASE_URL && config.SUPABASE_PUBLISHABLE_KEY && window.supabase?.createClient){
      const client = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY);
      const {error} = await client.from('messages').insert([{name,email,message}]);
      if(error){status.textContent='Message could not be sent. Please use the email link instead.';return;}
      status.textContent='Thanks! Your message was sent.';form.reset();return;
    }
    if (config.CONTACT_EMAIL) {
      const subject = encodeURIComponent(`Portfolio message from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      status.textContent='Opening your email app to send the message…';
      location.href = `mailto:${config.CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    } else {
      status.textContent='The form is not connected yet. Please contact me through LinkedIn, or configure Supabase in js/config.js.';
    }
  });
  const year = $('#current-year'); if(year) year.textContent = new Date().getFullYear();

  // Faaiz AI: movable portfolio guide with working quick prompts.
  if (!$('#fz-widget')) {
    const widget = document.createElement('section');
    widget.id = 'fz-widget'; widget.className = 'fz-widget';
    widget.innerHTML = `<button class="fz-launch" type="button" aria-label="Open Faaiz AI portfolio assistant"><span class="fz-spark" aria-hidden="true"><svg viewBox="0 0 48 48" role="img" aria-label="Faaiz AI robot mascot"><defs><linearGradient id="fzBot" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#68e7f5"/><stop offset="1" stop-color="#4b8dff"/></linearGradient></defs><path d="M24 5v6" stroke="#69e4f5" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="4" r="3" fill="#b8f36b"/><rect x="7" y="12" width="34" height="27" rx="10" fill="url(#fzBot)"/><rect x="12" y="18" width="24" height="13" rx="5" fill="#07111f"/><circle cx="18" cy="24" r="2.4" fill="#b8f36b"/><circle cx="30" cy="24" r="2.4" fill="#b8f36b"/><path d="M18 34q6 4 12 0" fill="none" stroke="#07111f" stroke-width="2" stroke-linecap="round"/><path d="M3 23h4M41 23h4" stroke="#68e7f5" stroke-width="3" stroke-linecap="round"/></svg></span><span class="fz-launch-copy"><b>Faaiz AI</b><small>Drag me · Ask about my work</small></span><span class="fz-online"></span></button><div class="fz-panel" hidden><div class="fz-head" title="Drag to move assistant"><span class="fz-avatar" aria-hidden="true"><svg viewBox="0 0 48 48"><rect x="7" y="12" width="34" height="27" rx="10" fill="#4bd7f1"/><rect x="12" y="18" width="24" height="13" rx="5" fill="#07111f"/><circle cx="18" cy="24" r="2.4" fill="#b8f36b"/><circle cx="30" cy="24" r="2.4" fill="#b8f36b"/><path d="M18 34q6 4 12 0" fill="none" stroke="#07111f" stroke-width="2" stroke-linecap="round"/><path d="M24 5v7" stroke="#4bd7f1" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="4" r="3" fill="#b8f36b"/></svg></span><div><b>Faaiz AI</b><small>Portfolio guide · drag this bar to move</small></div><button type="button" class="fz-close" aria-label="Close assistant">×</button></div><div class="fz-messages" aria-live="polite"><div class="fz-message bot">Hi! I’m Faaiz AI. Ask me about Faaiz’s projects, skills, learning journey or contact links.</div><div class="fz-quick"><button type="button" data-fz="projects">Projects</button><button type="button" data-fz="skills">Skills</button><button type="button" data-fz="contact">Contact</button></div></div><form class="fz-form"><input aria-label="Ask Faaiz AI" placeholder="Ask about Faaiz…" maxlength="300" required><button type="submit" aria-label="Send message">↗</button></form><p class="fz-footnote">Answers use information published on this portfolio</p></div>`;
    document.body.appendChild(widget);
    const launch = $('.fz-launch', widget), panel = $('.fz-panel', widget), close = $('.fz-close', widget), messages = $('.fz-messages', widget), input = $('input', widget), formChat = $('.fz-form', widget);
    const openChat = () => { panel.hidden = false; launch.classList.add('is-open'); input.focus({preventScroll:true}); };
    launch.addEventListener('click', () => { if (widget.dataset.dragged === 'yes') { widget.dataset.dragged = 'no'; return; } panel.hidden ? openChat() : (panel.hidden=true, launch.classList.remove('is-open')); });
    close.addEventListener('click', () => { panel.hidden=true; launch.classList.remove('is-open'); });
    // Drag either the mascot button or the panel header; clamp within viewport.
    let drag = null;
    const dragHandles = [launch, $('.fz-head', widget)];
    const placeWidget = (x,y) => {
      const rect = widget.getBoundingClientRect();
      const left = Math.max(8, Math.min(innerWidth - rect.width - 8, x));
      const top = Math.max(8, Math.min(innerHeight - Math.min(rect.height, innerHeight - 16) - 8, y));
      widget.style.left = `${left}px`; widget.style.top = `${top}px`; widget.style.right = 'auto'; widget.style.bottom = 'auto';
    };
    dragHandles.forEach(handle => {
      if (!handle) return;
      handle.addEventListener('pointerdown', e => {
        if (e.target.closest('button') && handle !== launch) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        const rect = widget.getBoundingClientRect();
        drag = {id:e.pointerId, x:e.clientX, y:e.clientY, left:rect.left, top:rect.top, moved:false};
        handle.setPointerCapture?.(e.pointerId);
      });
      handle.addEventListener('pointermove', e => {
        if (!drag || drag.id !== e.pointerId) return;
        const dx=e.clientX-drag.x, dy=e.clientY-drag.y;
        if (Math.abs(dx)+Math.abs(dy)>5) drag.moved=true;
        if (drag.moved) { placeWidget(drag.left+dx, drag.top+dy); widget.classList.add('is-dragging'); }
      });
      const stopDrag = e => { if (!drag || drag.id !== e.pointerId) return; if (drag.moved) widget.dataset.dragged='yes'; drag=null; widget.classList.remove('is-dragging'); };
      handle.addEventListener('pointerup', stopDrag); handle.addEventListener('pointercancel', stopDrag);
    });
    addEventListener('resize', () => { if (widget.style.left) placeWidget(parseFloat(widget.style.left), parseFloat(widget.style.top)||8); });
    document.addEventListener('pointerdown', e => { if (!widget.contains(e.target) && !panel.hidden) { panel.hidden=true; launch.classList.remove('is-open'); } });
    const answers = (q) => {
      const t=q.toLowerCase();
      if (/project|work|portfolio|ihub|raastago|travelnest|headphone|university/.test(t)) return {text:'Faaiz’s featured work includes iHub Marketplace (an iPhone gadgets, repair-services and custom-cover marketplace concept), RAASTAGO (“See the Road Ahead”), Aversion University, TravelNestAgency, and a headphone website. Project details are available in the Projects section.', link:'projects.html', label:'Explore projects'};
      if (/skill|technology|tech stack|tools|language|html|css|javascript|design/.test(t)) return {text:'Faaiz works with HTML, CSS and JavaScript, and is learning further frontend/backend tools. His learning toolkit also includes responsive design, Firebase/Supabase exploration, Git/GitHub, Photoshop and Illustrator. The Skills page separates the main areas.', link:'skills.html', label:'View skills'};
      if (/certificate|certification|w3schools|credential/.test(t)) return {text:'Certificate details are not currently presented as a separate portfolio page. Please refer to the resume for the learning information included there.'};
      if (/study|education|learn|journey|about|student/.test(t)) return {text:'Faaiz is a student and aspiring web developer who learns through practice, coursework and personal projects. He is developing frontend skills while exploring backend development and visual design.', link:'about.html', label:'Read about Faaiz'};
      if (/contact|hire|collaborat|email|linkedin|github|reach/.test(t)) return {text:'For project discussions, collaboration or learning opportunities, use the contact page or connect through LinkedIn and GitHub.', link:'contact.html', label:'Contact Faaiz'};
      if (/resume|cv/.test(t)) return {text:'You can open the resume page to review Faaiz’s current profile summary and available resume information.', link:'resume.html', label:'Open resume'};
      return {text:'I’m Faaiz AI, the portfolio guide. Ask me about projects, skills, learning or contact details—for example, “What projects has Faaiz built?”'};
    };
    const addMessage = (text, type, link) => { const el=document.createElement('div'); el.className=`fz-message ${type}`; el.textContent=text; messages.appendChild(el); if(link){const a=document.createElement('a');a.className='fz-answer-link';a.href=link.link;a.textContent=link.label+' ↗';messages.appendChild(a);} messages.scrollTop=messages.scrollHeight; };
    const ask = (q) => { addMessage(q,'user'); const result=answers(q); addMessage(result.text,'bot',result.link?result:null); };
    formChat.addEventListener('submit', e => {e.preventDefault();const q=input.value.trim();if(!q)return;input.value='';ask(q);});
    $$('.fz-quick button', widget).forEach(b=>b.addEventListener('click',()=>ask(b.dataset.fz)));
  }

  // Persistent appearance preferences: theme (system-aware) and motion intensity.
  const preferenceKey = 'faaiz-preferences';
  let prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(preferenceKey) || '{}') || {}; } catch (_) { prefs = {}; }
  // Dark mode is the default experience; the toggle stores the explicit choice.
  const savedTheme = localStorage.getItem('faaiz-theme') === 'light' ? 'light' : 'dark';
  const applyTheme = choice => {
    rootEl.dataset.theme = choice;
    localStorage.setItem('faaiz-theme', choice);
    prefs.theme = choice; localStorage.setItem(preferenceKey, JSON.stringify(prefs));
    const meta = $('meta[name="theme-color"]'); if (meta) meta.content = choice === 'light' ? '#ffffff' : '#001a3d';
    const btn = $('.theme-toggle');
    if (btn) {
      const label = choice === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    }
  };
  applyTheme(savedTheme);
  rootEl.dataset.motion = prefs.motion || 'cinematic';

  // Header light/dark toggle (sun/moon icon follows the current mode).
  const navInner = $('.nav-inner');
  if (navInner && !$('.theme-toggle', navInner)) {
    const themeBtn = document.createElement('button');
    themeBtn.type = 'button';
    themeBtn.className = 'theme-toggle';
    themeBtn.setAttribute('aria-label', 'Toggle dark / light theme');
    themeBtn.innerHTML = '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M4.8 4.8l1.6 1.6M17.6 17.6l1.6 1.6M19.2 4.8l-1.6 1.6M6.4 17.6l-1.6 1.6"/></svg><svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.6 14.2A8.6 8.6 0 0 1 9.8 3.4a8.6 8.6 0 1 0 10.8 10.8Z"/></svg>';
    const menuBtn = $('.menu-toggle', navInner);
    navInner.insertBefore(themeBtn, menuBtn);
    themeBtn.addEventListener('click', () => applyTheme(rootEl.dataset.theme === 'light' ? 'dark' : 'light'));
    applyTheme(savedTheme);
  }

  /* ============================================================
     Custom cursor — basith.dev-style
     A precise dot locked to the pointer plus a trailing ring that
     follows with eased lag (rAF lerp). The ring grows over links,
     buttons and other interactive elements; both compress while
     pressed. Only activates on fine-pointer devices; touch users
     and reduced-motion visitors keep the native pointer.
     ============================================================ */
  const initCustomCursor = () => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ($('.cursor-ring')) return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.setAttribute('aria-hidden', 'true');
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.setAttribute('aria-hidden', 'true');
    document.body.append(dot, ring);
    rootEl.classList.add('cursor-active');

    let x = innerWidth / 2, y = innerHeight / 2; // exact pointer position
    let ringX = x, ringY = y;                    // eased ring position
    let ringScale = 1, dotScale = 1;
    let ringTarget = 1, dotTarget = 1;
    let hovering = false, pressing = false, shown = false;

    const INTERACTIVE = 'a, button, input, textarea, select, label, summary, [role="button"], .portrait-flip';
    const setTargets = () => {
      ringTarget = pressing ? .8 : hovering ? 1.7 : 1;
      dotTarget = pressing ? .75 : hovering ? .5 : 1;
      ring.classList.toggle('is-hover', hovering);
      dot.classList.toggle('is-hover', hovering);
    };

    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      if (!shown) { shown = true; ringX = x; ringY = y; dot.classList.add('is-visible'); ring.classList.add('is-visible'); }
    }, { passive: true });

    document.addEventListener('pointerover', e => {
      hovering = !!(e.target.closest && e.target.closest(INTERACTIVE));
      setTargets();
    });
    addEventListener('pointerdown', () => { pressing = true; setTargets(); });
    addEventListener('pointerup', () => { pressing = false; setTargets(); });
    addEventListener('pointercancel', () => { pressing = false; setTargets(); });
    document.addEventListener('mouseleave', () => { shown = false; dot.classList.remove('is-visible'); ring.classList.remove('is-visible'); });
    addEventListener('blur', () => { shown = false; dot.classList.remove('is-visible'); ring.classList.remove('is-visible'); });

    const tick = () => {
      ringX += (x - ringX) * .16;   // the ring trails with a soft eased lag
      ringY += (y - ringY) * .16;
      ringScale += (ringTarget - ringScale) * .18;
      dotScale += (dotTarget - dotScale) * .32;
      dot.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${dotScale.toFixed(3)})`;
      ring.style.transform = `translate3d(${ringX.toFixed(1)}px,${ringY.toFixed(1)}px,0) translate(-50%,-50%) scale(${ringScale.toFixed(3)})`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  initCustomCursor();

})();
