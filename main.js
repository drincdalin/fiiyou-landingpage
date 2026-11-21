// fiiyou landing page. No frameworks, no trackers, no build step.
// Jobs: the mobile menu, the sample profile, donation details (with a copy button) and the contributors list from GitHub.

/* ---------- 1. mobile menu ---------- */
(function menu() {
  const btn = document.getElementById('menu-btn');
  const nav = document.getElementById('menu');
  const label = document.getElementById('menu-label');
  const icon = btn && btn.querySelector('use');
  if (!btn || !nav || !label || !icon) return;
  const set = (open) => { nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); label.textContent = open ? 'Close' : 'Menu'; icon.setAttribute('href', open ? '#ph-x' : '#ph-list'); };
  btn.addEventListener('click', () => set(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  window.matchMedia('(min-width: 880px)').addEventListener('change', () => set(false));
})();

/* ---------- 1b. the sample profile: colours and layout ---------- */
(function playground() {
  const card = document.getElementById('profile');
  const form = document.querySelector('.tweak');
  if (!card || !form) return;
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('change', (e) => {
    const i = e.target;
    if (!i || !i.checked) return;
    if (i.name === 'theme') document.documentElement.dataset.theme = i.value;
    if (i.name === 'layout') card.dataset.layout = i.value;
  });
})();

/* ---------- helpers ---------- */
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

async function copyText(text, button) {
  const old = button.textContent;
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const ta = el('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    button.textContent = 'Copied';
  } catch { button.textContent = 'Press Ctrl+C'; }
  setTimeout(() => { button.textContent = old; }, 1600);
}

/* ---------- 2. donate: Ko-fi link + bank transfer ---------- */
function ibanValid(raw) {
  const s = String(raw || '').replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false;
  let rem = 0;
  for (const ch of s.slice(4) + s.slice(0, 4)) {
    const v = ch >= 'A' ? ch.charCodeAt(0) - 55 : Number(ch);
    rem = (v > 9 ? rem * 100 + v : rem * 10 + v) % 97;
  }
  return rem === 1;
}

(function donate() {
  const cfg = window.FIIYOU || {};
  const kofi = document.getElementById('kofi');
  if (kofi && /^https:\/\/ko-fi\.com\/[A-Za-z0-9_.-]+\/?$/.test(cfg.kofi || '')) {
    kofi.href = cfg.kofi;
    document.querySelectorAll('a[href^="https://ko-fi.com/"]').forEach((a) => { a.href = cfg.kofi; });
  }

  const dl = document.getElementById('bank-details');
  const soon = document.getElementById('bank-soon');
  const bank = cfg.bank || {};
  if (!dl || !bank.iban) return;
  if (!ibanValid(bank.iban)) { console.warn('[fiiyou] config.js: the IBAN did not pass the checksum, so it is not shown. Check it for typos.'); return; }

  const iban = bank.iban.replace(/\s+/g, '').toUpperCase();
  const pretty = iban.replace(/(.{4})/g, '$1 ').trim();
  const rows = [
    ['Name on the account', bank.holder, false],
    ['IBAN', pretty, true],
    ['BIC / SWIFT', bank.bic, false],
    ['Payment details', bank.reference, false],
  ].filter((r) => r[1]);

  dl.replaceChildren(...rows.map(([label, value, isIban]) => {
    const row = el('div');
    row.append(el('dt', null, label));
    const dd = el('dd', isIban ? 'iban' : null, value);
    row.append(dd);
    if (isIban) {
      const b = el('button', null, 'Copy');
      b.type = 'button';
      b.setAttribute('aria-label', 'Copy IBAN');
      b.addEventListener('click', () => copyText(iban, b));
      row.append(b);
    }
    return row;
  }));
  dl.hidden = false;
  if (soon) soon.hidden = true;
})();

/* ---------- 3. contributors (GitHub public API) ---------- */
const REPO = 'drincdalin/fiiyou.online';
const REPO_URL = `https://github.com/${REPO}`;
const TTL = 10 * 60 * 1000; // GitHub allows 60 anonymous requests an hour per IP, so remember answers for 10 minutes
// accounts GitHub attributes commits to (usually through a commit e-mail) that we do not want listed. Same list the app uses.
const HIDDEN = new Set(['nursexams-lgtm']);

const safe = (u, host) => { try { const x = new URL(u); return x.protocol === 'https:' && x.hostname === host ? x.href : null; } catch { return null; } };

async function loadContributors() {
  const key = `contrib:${REPO}`;
  try {
    const c = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (c && Date.now() - c.t < TTL) return c.data;
  } catch { /* no cache */ }

  const res = await fetch(`https://api.github.com/repos/${REPO}/contributors?per_page=100`, { headers: { Accept: 'application/vnd.github+json' } });
  if (res.status === 204) return [];
  if (!res.ok) throw new Error(`github_${res.status}`);
  const raw = await res.json();
  const data = (Array.isArray(raw) ? raw : [])
    .filter((p) => p && p.login && p.type !== 'Bot' && !/\[bot\]$/i.test(p.login) && !HIDDEN.has(p.login.toLowerCase()))
    .map((p) => ({ login: String(p.login), url: safe(p.html_url, 'github.com'), avatar: safe(p.avatar_url, 'avatars.githubusercontent.com'), count: Number(p.contributions) || 0 }))
    .sort((a, b) => b.count - a.count || a.login.localeCompare(b.login));
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data })); } catch { /* storage blocked */ }
  return data;
}

function showMessage(list, message) {
  list.replaceChildren();
  const li = el('li', 'people-msg');
  li.append(document.createTextNode(`${message} `));
  const a = el('a', null, 'See the contributors on GitHub');
  a.href = `${REPO_URL}/graphs/contributors`;
  li.append(a, document.createTextNode('.'));
  list.appendChild(li);
  list.setAttribute('aria-busy', 'false');
}

(async function contributors() {
  const list = document.getElementById('people');
  const stats = document.getElementById('contrib-stats');
  if (!list) return;
  try {
    const people = await loadContributors();
    if (!people.length) return showMessage(list, 'No commits to show yet.');
    const total = people.reduce((n, p) => n + p.count, 0);
    const top = people[0].count || 1;
    const nf = new Intl.NumberFormat('en');
    if (stats) stats.textContent = `${nf.format(total)} commit${total === 1 ? '' : 's'} from ${nf.format(people.length)} contributor${people.length === 1 ? '' : 's'}`;

    const rows = people.map((p, i) => {
      const li = el('li');
      li.append(el('span', 'rank', String(i + 1)));

      const img = el('img', 'avatar');
      img.alt = '';
      img.width = 46; img.height = 46; img.loading = 'lazy'; img.decoding = 'async';
      if (p.avatar) img.src = `${p.avatar}${p.avatar.includes('?') ? '&' : '?'}s=92`;
      li.append(img);

      const who = el('div', 'who');
      const name = el('a', null, p.login);
      name.href = p.url || `https://github.com/${encodeURIComponent(p.login)}`;
      name.rel = 'noopener';
      who.append(name);
      li.append(who, el('span', 'count', `${nf.format(p.count)} commit${p.count === 1 ? '' : 's'}`));
      return li;
    });

    // an open seat at the bottom of the list
    const join = el('li', 'join');
    join.append(el('span', 'rank', String(people.length + 1)));
    const a = el('a', null, 'Your name could be here. Send a pull request.');
    a.href = REPO_URL;
    a.rel = 'noopener';
    join.append(a);
    rows.push(join);

    list.replaceChildren(...rows);
    list.setAttribute('aria-busy', 'false');
  } catch {
    showMessage(list, 'Could not load the list right now.');
  }
})();
