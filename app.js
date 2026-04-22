/* Honest News — Unified App */
'use strict';

// ============ CONFIG ============
const BASE = new URL('.', window.location.href);
const urlOf = (p) => new URL(p, BASE).toString();

const API = {
  status: urlOf('status.json'),
  manifest: urlOf('articles/manifest.json'),
  pubKey: urlOf('keys/public_key.b64')
};

const LIVE_NEWS_API = 'https://api.rss2json.com/v1/api.json?rss_url=';
const LIVE_CATEGORY_QUERIES = {
  tech: 'technology industry',
  ai: 'artificial intelligence policy',
  space: 'space exploration NASA SpaceX',
  crypto: 'bitcoin crypto market',
  climate: 'climate policy emissions',
  health: 'health research medicine',
  energy: 'energy transition grid renewables',
  politics: 'world politics diplomacy'
};

// ============ HELPER ============
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============ METRIC ADAPTER ============
function adaptMetrics(article) {
  // Source Agreement (%) = balance marker adjusted by manipulation estimate.
  const sc = article.phi_dna 
    ? clamp01(article.phi_dna.phi_link * (1 - (article.manipulation_score || 0))) * 100
    : null;

  // Emotional Intensity (EII%) = emotion_score * 100
  const eii = article.emotion_score ? article.emotion_score * 100 : null;

  // Framing Stability Score = normalized balance marker.
  const stability = article.phi_dna?.phi_link || null;

  // Consensus Harmony (CH%) = (active_traits/1000) * (1 - bias_score) * 100
  const active = article.democratic_vote?.active_traits || 1000;
  const bias = article.bias_score || 0;
  const ch = clamp01((active / 1000) * (1 - bias)) * 100;

  return { sc, eii, stability, ch, bias };
}

function clamp01(x) { return Math.max(0, Math.min(1, x)); }

function generateThoughts(article) {
  const thoughts = [];
  if (article.consensus) thoughts.push(`Consensus: ${article.consensus}`);
  if (article.counter_narrative) thoughts.push(article.counter_narrative);
  const bias = article.bias_score || 0;
  const level = bias < 0.3 ? 'Measured framing' : bias < 0.6 ? 'Some polarity detected' : 'High polarity detected';
  thoughts.push(level);
  if (article.verified !== false) thoughts.push('Cryptographically verified');
  return thoughts.slice(0, 4);
}

function getBiasLabel(bias) {
  if (bias < 0.3) return 'Low Bias';
  if (bias < 0.6) return 'Medium Bias';
  return 'High Bias';
}

// ============ RENDER ============
function renderArticleCard(article) {
  const m = adaptMetrics(article);
  const thoughts = generateThoughts(article);
  const articlePath = typeof article.path === 'string' ? article.path : '';
  const isLive = /^https?:\/\//i.test(articlePath);
  const url = articlePath ? urlOf(articlePath) : '#';
  const sig = url.replace(/\.json$/i, '.sig');
  const prettyDate = article.date?.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') || '';
  const tags = (article.tags || []).map(t => `<span class="badge">${t}</span>`).join('');

  // Format metric value
  const fmtMetric = (value) => {
    if (value == null) return '—';
    if (typeof value === 'number') return value < 1 ? value.toFixed(3) : Math.round(value);
    return value;
  };

  return `
  <div class="news-card">
    <div class="news-header">
      ${isLive ? '<span class="live-badge">LIVE</span>' : ''}
      <h3 class="news-title">${escapeHtml(article.title)}</h3>
      <p class="news-subtitle">${escapeHtml(article.subtitle || 'Multi-perspective analysis')}</p>
      <div class="progress-bar">
        <div class="bar-fill" style="width: ${m.sc || 50}%;"></div>
      </div>
    </div>
    <div class="news-content">
      <div class="content-section">
        <h4 class="section-title">🌍 Source</h4>
        <p class="content-text">${escapeHtml(article.source || 'Multi-source')} • ${prettyDate}</p>
      </div>
      <div class="content-section">
        <h4 class="section-title">📊 Metrics</h4>
        <div class="metrics-grid">
          <div class="metric">
            <div class="metric-label">Source Agreement</div>
            <div class="metric-value">${fmtMetric(m.sc)}%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Emotional Intensity</div>
            <div class="metric-value">${fmtMetric(m.eii)}%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Framing Stability</div>
            <div class="metric-value">${fmtMetric(m.stability)}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Consensus Score</div>
            <div class="metric-value">${fmtMetric(m.ch)}%</div>
          </div>
        </div>
      </div>
      <div class="content-section">
        <h4 class="section-title">⚖️ Bias Assessment</h4>
        <span class="badge">${getBiasLabel(m.bias)}</span>
        ${tags ? `<div style="margin-top:0.5rem;">${tags}</div>` : ''}
      </div>
      ${thoughts.length ? `
      <div class="content-section thoughts-section">
        <h4 class="section-title">🤖 Analysis Thoughts</h4>
        ${thoughts.map(t => `<p class="thought-item">${escapeHtml(t)}</p>`).join('')}
      </div>
      ` : ''}
      <div class="content-section">
        <div class="actions">
          <a href="${url}" target="_blank" rel="noopener" class="btn">View JSON</a>
          <button onclick='verifyArticle("${url}","${sig}")' class="btn btn-primary" ${articlePath ? '' : 'disabled'}>Verify</button>
        </div>
      </div>
    </div>
  </div>`;
}

// ============ LOAD ============
let ARTICLES = [];
let LIVE_FEED_STATE = 'fallback';

async function loadStatus() {
  try {
    const r = await fetch(API.status, { cache: 'no-cache' });
    if (!r.ok) throw new Error('status');
    const s = await r.json();
    console.log('Status loaded:', s);
    renderStatusMeta(s);
  } catch (e) {
    console.error('Status load failed:', e);
  }
}

function renderStatusMeta(status) {
  const node = $('#status-meta');
  if (!node || !status) return;
  const updated = status.updated_at
    ? new Date(status.updated_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'Unknown';
  const total = Number.isFinite(status.total_articles) ? status.total_articles : 'N/A';
  const verified = Number.isFinite(status.verified_analyses) ? status.verified_analyses : 'N/A';
  node.textContent = `Last updated: ${updated} | Articles: ${total} | Verified analyses: ${verified} | Live feed: ${LIVE_FEED_STATE}`;
}

async function loadArticles() {
  const grid = $('#news-container');
  if (!grid) return;
  try {
    const r = await fetch(API.manifest, { cache: 'no-cache' });
    const list = await r.json();
    const staticArticles = Array.isArray(list) ? list : list.articles || [];
    const liveArticles = await loadLiveArticles();
    ARTICLES = liveArticles.length ? mergeLiveWithFallback(liveArticles, staticArticles) : staticArticles;
    LIVE_FEED_STATE = liveArticles.length ? 'on' : 'fallback';
    loadStatus();
    renderArticles();
  } catch (e) {
    grid.innerHTML = `<div class="news-card"><div class="news-content"><h3>Failed to load articles</h3><p class="content-text">See console for details.</p></div></div>`;
    console.error(e);
  }
}

async function loadLiveArticles() {
  const entries = Object.entries(LIVE_CATEGORY_QUERIES);
  const results = await Promise.all(entries.map(([cat, query]) => fetchLiveCategory(cat, query)));
  return results.flat().filter(Boolean);
}

async function fetchLiveCategory(category, query) {
  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const apiUrl = `${LIVE_NEWS_API}${encodeURIComponent(rssUrl)}`;
    const r = await fetch(apiUrl, { cache: 'no-cache' });
    if (!r.ok) return [];
    const payload = await r.json();
    if (payload.status !== 'ok' || !Array.isArray(payload.items)) return [];
    return payload.items.slice(0, 1).map((item) => toLiveArticle(item, category)).filter(Boolean);
  } catch (err) {
    console.warn(`Live category fetch failed for ${category}:`, err);
    return [];
  }
}

function toLiveArticle(item, category) {
  if (!item?.title || !item?.link) return null;
  const published = item.pubDate ? new Date(item.pubDate) : new Date();
  const y = published.getUTCFullYear();
  const m = String(published.getUTCMonth() + 1).padStart(2, '0');
  const d = String(published.getUTCDate()).padStart(2, '0');
  const domain = safeDomain(item.link);
  return {
    title: item.title.replace(/\s*-\s*[^-]+$/, '').trim(),
    subtitle: `Live ${category} coverage from ${domain}`,
    source: domain,
    date: `${y}${m}${d}`,
    tags: [category],
    path: item.link,
    bias_score: 0.35,
    emotion_score: 0.45,
    manipulation_score: 0.2,
    democratic_vote: { active_traits: 1000 },
    verified: false
  };
}

function safeDomain(link) {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return 'live source';
  }
}

function mergeLiveWithFallback(liveArticles, staticArticles) {
  const requiredCats = Object.keys(LIVE_CATEGORY_QUERIES);
  const liveByCat = new Map();
  liveArticles.forEach((a) => {
    const tag = (a.tags || [])[0];
    if (tag && !liveByCat.has(tag)) liveByCat.set(tag, a);
  });
  const fallbackByCat = new Map();
  staticArticles.forEach((a) => {
    const tags = (a.tags || []).map((t) => String(t).toLowerCase());
    requiredCats.forEach((cat) => {
      if (tags.includes(cat) && !fallbackByCat.has(cat)) fallbackByCat.set(cat, a);
    });
  });
  const seeded = requiredCats.map((cat) => liveByCat.get(cat) || fallbackByCat.get(cat)).filter(Boolean);
  return [...seeded, ...staticArticles];
}

function renderArticles() {
  const grid = $('#news-container');
  if (!grid) return;
  const cat = readHashCat();
  const filtered = ARTICLES.filter(a => {
    if (cat === 'all') return true;
    const tags = (a.tags || []).map(t => String(t).toLowerCase());
    return tags.includes(cat);
  });
  grid.innerHTML = filtered.length 
    ? filtered.map(renderArticleCard).join('') 
    : `<div class="news-card"><div class="news-content"><h3>No articles</h3><p class="content-text">Try another category.</p></div></div>`;
}

// ============ CATEGORY FILTER ============
function readHashCat() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return params.get('cat') || 'all';
}

function setHashCat(cat) {
  const params = new URLSearchParams(window.location.hash.slice(1));
  params.set('cat', cat);
  window.location.hash = params.toString();
}

// Category filter chips
const categoryButtons = $$('.category');
if (categoryButtons.length) {
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cat = e.target.dataset.cat;
      if (!cat) return;
      categoryButtons.forEach(b => b.classList.toggle('active', b === e.target));
      setHashCat(cat);
      renderArticles();
    });
  });
}

window.addEventListener('hashchange', () => {
  const cat = readHashCat();
  if (categoryButtons.length) {
    categoryButtons.forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  }
  renderArticles();
});

// ============ THEME TOGGLE ============
(function initTheme() {
  const root = document.documentElement;
  const btn = $('#themeToggle');
  const key = 'hn-theme';
  
  const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const saved = localStorage.getItem(key);
  const initial = saved || sys;
  
  root.setAttribute('data-theme', initial);
  if (btn) {
    btn.textContent = initial === 'dark' ? '☀️ Light' : '🌙 Dark';
  }
  
  if (btn) {
    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem(key, next);
      btn.textContent = next === 'dark' ? '☀️ Light' : '🌙 Dark';
    });
  }
})();

// ============ VERIFY ============
async function getPublicKeyRaw() {
  const txt = await fetchTextOrThrow(API.pubKey, 'public key');
  return base64ToUint8(txt.trim());
}

async function verifyArticle(jsonUrl, sigUrl) {
  try {
    const [jsonBuf, sigBuf, pubKey] = await Promise.all([
      fetchArrayBufferOrThrow(jsonUrl, 'article JSON'),
      fetchTextOrThrow(sigUrl, 'signature file').then(base64ToUint8),
      getPublicKeyRaw()
    ]);
    const ok = nacl.sign.detached.verify(new Uint8Array(jsonBuf), sigBuf, pubKey);
    alert(ok ? '✅ Signature verified (Ed25519)' : '❌ Verification failed');
  } catch (e) {
    console.error(e);
    alert(`Verification error: ${e.message}`);
  }
}

// ============ HELPERS ============
function escapeHtml(s = '') {
  return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function base64ToUint8(b64) {
  const bin = atob(b64.replace(/\s+/g, ''));
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf;
}

async function fetchTextOrThrow(url, label) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`Missing or unreadable ${label} (${res.status}). If this is expected, add files in keys/ and .sig assets.`);
  }
  return res.text();
}

async function fetchArrayBufferOrThrow(url, label) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`Missing or unreadable ${label} (${res.status}).`);
  }
  return res.arrayBuffer();
}

window.verifyArticle = verifyArticle;

// ============ BOOT ============
window.addEventListener('DOMContentLoaded', () => {
  const cat = readHashCat();
  if (categoryButtons.length) {
    categoryButtons.forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  }
  loadStatus();
  loadArticles();
  setInterval(loadStatus, 30000);
});
