/* Honest News — Unified App with Neutralized Metrics */
'use strict';

// ============ CONFIG ============
const BASE = new URL('.', window.location.href);
const urlOf = (p) => new URL(p, BASE).toString();

const API = {
  status: urlOf('status.json'),
  manifest: urlOf('articles/manifest.json'),
  pubKey: urlOf('keys/public_key.b64')
};

// ============ HELPER ============
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============ METRIC ADAPTER (Neutralized) ============
function adaptMetrics(article) {
  // Signal Coherence (SC%) = phi_link * (1 - manipulation_score) * 100
  const sc = article.phi_dna 
    ? clamp01(article.phi_dna.phi_link * (1 - (article.manipulation_score || 0))) * 100
    : null;

  // Emotional Intensity (EII%) = emotion_score * 100
  const eii = article.emotion_score ? article.emotion_score * 100 : null;

  // Harmonic Balance (φ-HB) = phi_link with φ suffix when present
  const phiHB = article.phi_dna?.phi_link || null;

  // Consensus Harmony (CH%) = (active_traits/1000) * (1 - bias_score) * 100
  const active = article.democratic_vote?.active_traits || 1000;
  const bias = article.bias_score || 0;
  const ch = clamp01((active / 1000) * (1 - bias)) * 100;

  return { sc, eii, phiHB, ch, bias };
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
  const url = urlOf(article.path);
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
            <div class="metric-label">Signal Coherence</div>
            <div class="metric-value">${fmtMetric(m.sc)}%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Emotional Intensity</div>
            <div class="metric-value">${fmtMetric(m.eii)}%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Harmonic Balance</div>
            <div class="metric-value">${fmtMetric(m.phiHB)} φ</div>
          </div>
          <div class="metric">
            <div class="metric-label">Consensus Harmony</div>
            <div class="metric-value">${fmtMetric(m.ch)}%</div>
          </div>
        </div>
      </div>
      <div class="content-section">
        <h4 class="section-title">⚖️ Bias Assessment</h4>
        <span class="badge">${getBiasLabel(m.bias * 100)}</span>
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
          <button onclick='verifyArticle("${url}","${sig}")' class="btn btn-primary">Verify</button>
        </div>
      </div>
    </div>
  </div>`;
}

// ============ LOAD ============
let ARTICLES = [];

async function loadStatus() {
  try {
    const r = await fetch(API.status, { cache: 'no-cache' });
    if (!r.ok) throw new Error('status');
    const s = await r.json();
    console.log('Status loaded:', s);
  } catch (e) {
    console.error('Status load failed:', e);
  }
}

async function loadArticles() {
  const grid = $('#news-container');
  if (!grid) return;
  try {
    const r = await fetch(API.manifest, { cache: 'no-cache' });
    const list = await r.json();
    ARTICLES = Array.isArray(list) ? list : list.articles || [];
    renderArticles();
  } catch (e) {
    grid.innerHTML = `<div class="news-card"><div class="news-content"><h3>Failed to load articles</h3><p class="content-text">See console for details.</p></div></div>`;
    console.error(e);
  }
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
  const txt = await fetch(API.pubKey, { cache: 'no-cache' }).then(r => r.text());
  return base64ToUint8(txt.trim());
}

async function verifyArticle(jsonUrl, sigUrl) {
  try {
    const [jsonBuf, sigBuf, pubKey] = await Promise.all([
      fetch(jsonUrl, { cache: 'no-cache' }).then(r => r.arrayBuffer()),
      fetch(sigUrl, { cache: 'no-cache' }).then(r => r.text()).then(base64ToUint8),
      getPublicKeyRaw()
    ]);
    const ok = nacl.sign.detached.verify(new Uint8Array(jsonBuf), sigBuf, pubKey);
    alert(ok ? '✅ Signature verified (Ed25519)' : '❌ Verification failed');
  } catch (e) {
    console.error(e);
    alert('Verification error (network or file mismatch).');
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

window.verifyArticle = verifyArticle;

// ============ BOOT ============
window.addEventListener('DOMContentLoaded', () => {
  loadStatus();
  loadArticles();
  setInterval(loadStatus, 30000);
});
