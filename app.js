/* Honest News — Template-inspired editorial reskin */
'use strict';

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

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

let ARTICLES = [];
let LIVE_FEED_STATE = 'fallback';
let ACTIVE_ARTICLE = null;
const ARTICLE_CACHE = new Map();

function clamp01(x) { return Math.max(0, Math.min(1, x)); }

function adaptMetrics(article) {
  const sc = article.phi_dna
    ? clamp01(article.phi_dna.phi_link * (1 - (article.manipulation_score || 0))) * 100
    : 50;
  const eii = article.emotion_score != null ? article.emotion_score * 100 : 45;
  const stability = article.phi_dna?.phi_link ?? 0.55;
  const active = article.democratic_vote?.active_traits || 1000;
  const bias = article.bias_score || 0.35;
  const ch = clamp01((active / 1000) * (1 - bias)) * 100;
  return { sc, eii, stability, ch, bias };
}

function getBiasLabel(bias) {
  if (bias < 0.3) return 'Low Bias';
  if (bias < 0.6) return 'Medium Bias';
  return 'High Bias';
}

function formatDate(yyyymmdd = '') {
  if (!/^\d{8}$/.test(yyyymmdd)) return yyyymmdd || 'Undated';
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function renderArticleCard(article, idx) {
  const m = adaptMetrics(article);
  const isLive = /^https?:\/\//i.test(article.path || '');
  const tag = ((article.tags || ['news'])[0] || 'news').toUpperCase();
  const date = formatDate(article.date || '');
  return `
  <article class="news-card" data-idx="${idx}">
    <div class="news-header">
      ${isLive ? '<span class="live-badge">LIVE</span>' : ''}
      <div class="section-title">${escapeHtml(tag)}</div>
      <h3 class="news-title">${escapeHtml(article.title || 'Untitled story')}</h3>
      <p class="news-subtitle">${escapeHtml(article.subtitle || 'Multi-source analysis')}</p>
      <div class="progress-bar"><div class="bar-fill" style="width:${Math.round(m.sc)}%"></div></div>
    </div>
    <div class="news-content">
      <div class="content-section">
        <p class="content-text">${escapeHtml(article.source || 'Multi-source')} · ${escapeHtml(date)}</p>
      </div>
      <div class="actions">
        <button class="btn btn-primary" data-open-article="${idx}">Read Coverage</button>
      </div>
    </div>
  </article>`;
}

function renderArticles() {
  const grid = $('#news-container');
  if (!grid) return;
  const cat = readHashCat();
  const filtered = ARTICLES.filter((a) => {
    if (cat === 'all') return true;
    const tags = (a.tags || []).map((t) => String(t).toLowerCase());
    return tags.includes(cat);
  });
  grid.innerHTML = filtered.length
    ? filtered.map((a, i) => renderArticleCard(a, i)).join('')
    : `<article class="news-card"><div class="news-content"><h3>No articles</h3><p class="content-text">Try another category.</p></div></article>`;

  $$('[data-open-article]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const idx = Number(e.currentTarget.getAttribute('data-open-article'));
      const article = filtered[idx];
      if (article) await openArticleModal(article);
    });
  });
}

function readHashCat() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return params.get('cat') || 'all';
}

function setHashCat(cat) {
  const params = new URLSearchParams(window.location.hash.slice(1));
  params.set('cat', cat);
  window.location.hash = params.toString();
}

async function loadStatus() {
  try {
    const r = await fetch(API.status, { cache: 'no-cache' });
    if (!r.ok) throw new Error('status');
    const s = await r.json();
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
  node.textContent = `Last updated: ${updated} | Articles: ${status.total_articles ?? 'N/A'} | Verified analyses: ${status.verified_analyses ?? 'N/A'} | Live feed: ${LIVE_FEED_STATE}`;
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
    grid.innerHTML = `<article class="news-card"><div class="news-content"><h3>Failed to load articles</h3><p class="content-text">See console for details.</p></div></article>`;
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
    verified: false,
    sources: [{ name: domain, url: item.link }]
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

async function getArticleDetails(article) {
  if (!article?.path || /^https?:\/\//i.test(article.path)) return article;
  if (ARTICLE_CACHE.has(article.path)) return ARTICLE_CACHE.get(article.path);
  try {
    const json = await fetch(urlOf(article.path), { cache: 'no-cache' }).then((r) => r.json());
    const merged = { ...json, ...article };
    ARTICLE_CACHE.set(article.path, merged);
    return merged;
  } catch {
    return article;
  }
}

function buildArticleParagraphs(article) {
  const parts = [];
  parts.push(article.subtitle || 'A side-by-side reading of how major outlets frame the same developing story.');
  if (article.consensus) parts.push(`Working consensus: ${article.consensus}.`);
  if (article.counter_narrative || (article.counter_narratives && article.counter_narratives[0])) {
    parts.push(`Counter-position noted: ${article.counter_narrative || article.counter_narratives[0]}`);
  }
  parts.push('When ready, open the analysis view below for source-by-source comparison, bias spectrum, and framing metrics.');
  return parts;
}

async function openArticleModal(article) {
  const details = await getArticleDetails(article);
  ACTIVE_ARTICLE = details;
  const modal = $('#article-modal');
  if (!modal) return;
  $('#article-modal-tag').textContent = ((details.tags || ['news'])[0] || 'news').toUpperCase();
  $('#article-modal-title').textContent = details.title || 'Article';
  $('#article-modal-meta').textContent = `${details.source || 'Multi-source'} · ${formatDate(details.date || '')}`;
  $('#article-modal-content').innerHTML = buildArticleParagraphs(details).map((p) => `<p>${escapeHtml(p)}</p>`).join('');
  modal.hidden = false;
}

function closeArticleModal() {
  const modal = $('#article-modal');
  if (modal) modal.hidden = true;
}

function openAnalysisModal() {
  if (!ACTIVE_ARTICLE) return;
  const details = ACTIVE_ARTICLE;
  const m = adaptMetrics(details);
  $('#analysis-modal-title').textContent = details.title || 'Article Analysis';
  $('#analysis-stats').innerHTML = `
    <div class="metric"><div class="metric-label">Sources</div><div class="metric-value">${(details.sources?.length || 1)}</div></div>
    <div class="metric"><div class="metric-label">Consensus</div><div class="metric-value">${escapeHtml(details.consensus || 'Mixed / Speculative')}</div></div>
    <div class="metric"><div class="metric-label">Framing Stability</div><div class="metric-value">${Number(m.stability).toFixed(2)} <small>(0=chaotic,1=cohesive)</small></div></div>
    <div class="metric"><div class="metric-label">Integrity</div><div class="metric-value">${details.verified === false ? 'Unsigned' : 'Signed & Verifiable'}</div></div>`;

  const marker = $('#analysis-marker');
  if (marker) marker.style.left = `${Math.round((m.bias || 0.5) * 100)}%`;

  const sources = details.sources || [{ name: details.source || 'Primary source', url: details.url || details.path || '#' }];
  $('#source-compare').innerHTML = sources.slice(0, 3).map((s) => `
    <article class="source-card">
      <h5>${escapeHtml(s.name || 'Source')}</h5>
      <p>${escapeHtml(details.subtitle || 'Coverage perspective and framing summary.')}</p>
      <a href="${escapeHtml(s.url || '#')}" target="_blank" rel="noopener" class="btn">Open Source</a>
    </article>`).join('');

  const modal = $('#analysis-modal');
  if (modal) modal.hidden = false;
}

function closeAnalysisModal() {
  const modal = $('#analysis-modal');
  if (modal) modal.hidden = true;
}

function initCategoryFilters() {
  const categoryButtons = $$('.category');
  if (!categoryButtons.length) return;
  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const cat = e.currentTarget.dataset.cat;
      if (!cat) return;
      categoryButtons.forEach((b) => b.classList.toggle('active', b === e.currentTarget));
      setHashCat(cat);
      renderArticles();
    });
  });
  window.addEventListener('hashchange', () => {
    const cat = readHashCat();
    categoryButtons.forEach((b) => b.classList.toggle('active', b.dataset.cat === cat));
    renderArticles();
  });
}

function initTheme() {
  const root = document.documentElement;
  const btn = $('#themeToggle');
  const key = 'hn-theme';
  const saved = localStorage.getItem(key);
  const initial = saved || 'light';
  root.setAttribute('data-theme', initial);
  if (btn) btn.textContent = initial === 'dark' ? '☀️ Light' : '🌙 Dark';
  if (btn) {
    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem(key, next);
      btn.textContent = next === 'dark' ? '☀️ Light' : '🌙 Dark';
    });
  }
}

function initTopDate() {
  const node = $('#today-label');
  if (!node) return;
  node.textContent = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function initModals() {
  $('#article-modal-close')?.addEventListener('click', closeArticleModal);
  $('#analysis-modal-close')?.addEventListener('click', closeAnalysisModal);
  $('#article-analysis-link')?.addEventListener('click', () => {
    closeArticleModal();
    openAnalysisModal();
  });
  $('#article-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeArticleModal();
  });
  $('#analysis-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeAnalysisModal();
  });
}

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

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function base64ToUint8(b64) {
  const bin = atob(b64.replace(/\s+/g, ''));
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf;
}

async function fetchTextOrThrow(url, label) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Missing or unreadable ${label} (${res.status}).`);
  return res.text();
}

async function fetchArrayBufferOrThrow(url, label) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Missing or unreadable ${label} (${res.status}).`);
  return res.arrayBuffer();
}

window.verifyArticle = verifyArticle;

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTopDate();
  initCategoryFilters();
  initModals();
  const cat = readHashCat();
  $$('.category').forEach((b) => b.classList.toggle('active', b.dataset.cat === cat));
  loadStatus();
  loadArticles();
  setInterval(loadStatus, 30000);
});
