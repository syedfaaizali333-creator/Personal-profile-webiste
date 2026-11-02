/* FAAIZ.DEV — Real GitHub integration (public API, no key required).
   Displays only data actually returned by api.github.com, with loading,
   error and rate-limit states. Cached for 30 minutes per session. */
(() => {
  const root = document.getElementById('github-section');
  if (!root) return;

  const USER = 'syedfaaizali333-creator';
  const statsEl = document.getElementById('github-stats');
  const gridEl = document.getElementById('github-repos');
  const statusEl = document.getElementById('github-status');

  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = n => n == null ? '—' : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  const cacheKey = 'faaiz-gh-cache';
  const readCache = () => {
    try {
      const hit = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
      if (hit && Date.now() - hit.at < 30 * 60 * 1000) return hit.data;
    } catch (_) {}
    return null;
  };
  const writeCache = data => { try { sessionStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), data })); } catch (_) {} };

  const showError = msg => {
    statusEl.className = 'gh-state error';
    statusEl.innerHTML = `${esc(msg)}<br><a href="https://github.com/${USER}" target="_blank" rel="noreferrer">Open the GitHub profile directly ↗</a>`;
  };

  const ghColor = lang => ({
    JavaScript: '#f1e05a', HTML: '#e34c26', CSS: '#563d7c', TypeScript: '#3178c6',
    Python: '#3572A5', Java: '#b07219', PHP: '#4F5D95', 'Jupyter Notebook': '#DA5B0B'
  }[lang] || '#00cfff');

  const render = ({ user, repos }) => {
    statusEl.hidden = true;
    statsEl.hidden = false;
    statsEl.innerHTML = `
      <span class="gh-chip"><b>${fmt(user.public_repos)}</b> public repos</span>
      <span class="gh-chip"><b>${fmt(user.followers)}</b> followers</span>
      ${user.location ? `<span class="gh-chip">${esc(user.location)}</span>` : ''}
      <span class="gh-chip"><b>@${esc(user.login)}</b> on GitHub</span>`;
    gridEl.hidden = false;
    gridEl.innerHTML = repos.map(r => `
      <article class="gh-repo">
        <div class="gh-repo-top"><h3>${esc(r.name)}</h3>${r.fork ? '<span class="gh-fork">fork</span>' : ''}</div>
        <p>${r.description ? esc(r.description) : '<em>No description provided yet.</em>'}</p>
        <div class="gh-meta">
          <span>★ <b>${fmt(r.stargazers_count)}</b></span>
          <span>⑂ <b>${fmt(r.forks_count)}</b></span>
          ${r.language ? `<span class="gh-lang"><i style="--gh-color:${ghColor(r.language)}"></i>${esc(r.language)}</span>` : ''}
        </div>
        <a class="gh-link" href="${esc(r.html_url)}" target="_blank" rel="noreferrer">View repository ↗</a>
      </article>`).join('');
  };

  const load = async () => {
    const cached = readCache();
    if (cached) return render(cached);
    statusEl.hidden = false;
    statusEl.className = 'gh-state';
    statusEl.textContent = 'Loading live data from the GitHub API…';
    try {
      const [uRes, rRes] = await Promise.all([
        fetch(`https://api.github.com/users/${USER}`),
        fetch(`https://api.github.com/users/${USER}/repos?sort=updated&per_page=6`)
      ]);
      if (uRes.status === 404 || rRes.status === 404) throw new Error('GitHub profile not found.');
      if (uRes.status === 403 || rRes.status === 403) throw new Error('GitHub API rate limit reached — please try again in a few minutes.');
      if (!uRes.ok || !rRes.ok) throw new Error('GitHub is temporarily unreachable.');
      const [user, repos] = await Promise.all([uRes.json(), rRes.json()]);
      const data = { user, repos: Array.isArray(repos) ? repos : [] };
      writeCache(data);
      render(data);
    } catch (err) {
      showError(err && err.message ? err.message : 'Could not load GitHub data right now.');
    }
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); load(); }
    }, { rootMargin: '200px' });
    io.observe(root);
  } else load();
})();
