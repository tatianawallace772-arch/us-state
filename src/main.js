import './style.css';
import { createAtlas, getScaleInfo } from './map.js';
import { Quiz } from './quiz.js';
import { STATES, STATE_BY_FIPS, REGION_COLORS, METRICS, NATIONAL } from './data/states.js';

const $ = (id) => document.getElementById(id);
const html = document.documentElement;

const els = {
  searchWrap: $('searchWrap'),
  searchInput: $('searchInput'),
  searchResults: $('searchResults'),
  metricPills: $('metricPills'),
  legendHead: $('legendHead'),
  legendGradient: $('legendGradient'),
  legendScale: $('legendScale'),
  legendRegions: $('legendRegions'),
  statsStrip: $('statsStrip'),
  sidebar: $('sidebar'),
  mapToast: $('mapToast'),
  quizFlash: $('quizFlash'),
  stage: $('mapStage'),
  randomBtn: $('randomBtn'),
  themeBtn: $('themeBtn'),
  viewTabs: $('viewTabs'),
  zoomIn: $('zoomIn'),
  zoomOut: $('zoomOut'),
  zoomReset: $('zoomReset')
};

const fmt = (n) => Math.round(n).toLocaleString('en-US');
const fmtDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const POP_RANK = new Map(
  [...STATES]
    .filter((s) => s.abbr !== 'DC')
    .sort((a, b) => b.pop - a.pop)
    .map((s, i) => [s.fips, i + 1])
);
const AREA_RANK = new Map(
  [...STATES]
    .filter((s) => s.abbr !== 'DC')
    .sort((a, b) => b.area - a.area)
    .map((s, i) => [s.fips, i + 1])
);

let theme = html.dataset.theme || 'dark';
let currentView = 'explore';
let selected = null;
let metricKey = 'signature';
let atlas = null;
let searchIndex = -1;
let searchMatches = [];
let quizModeChoice = 'find';
let bestScores = { find: 0, capital: 0 };
let quizNewBest = false;
try {
  quizModeChoice = localStorage.getItem('atlas-quiz-mode') || 'find';
  bestScores = { ...bestScores, ...JSON.parse(localStorage.getItem('atlas-best-scores') || '{}') };
} catch (e) {
  /* storage unavailable */
}

function recordBest(snap) {
  if (!snap || snap.status !== 'over') return;
  quizNewBest = snap.score > (bestScores[snap.mode] || 0);
  if (quizNewBest) {
    bestScores[snap.mode] = snap.score;
    try {
      localStorage.setItem('atlas-best-scores', JSON.stringify(bestScores));
    } catch (e) {
      /* ignore */
    }
  }
}

/* ------------------------------------------------------------------ legend */
function renderLegend() {
  const info = atlas ? atlas.getScaleInfo() : getScaleInfo(metricKey, theme);
  els.legendHead.textContent = info.title;

  if (info.kind === 'categorical') {
    els.legendGradient.style.display = 'none';
    els.legendScale.style.display = 'none';
    els.legendRegions.style.display = 'flex';
    els.legendRegions.innerHTML = Object.entries(info.regions)
      .map(
        ([name, color]) =>
          `<span class="legend-region"><span class="legend-swatch" style="background:${color}"></span>${name}</span>`
      )
      .join('');
    return;
  }

  els.legendGradient.style.display = 'block';
  els.legendScale.style.display = 'flex';
  els.legendRegions.style.display = 'none';
  els.legendGradient.style.background = `linear-gradient(90deg, ${info.stops.join(', ')})`;
  els.legendScale.innerHTML = info.ticks.map((t) => `<span>${t}</span>`).join('');
}

/* ------------------------------------------------------------------ stats strip */
function renderStats() {
  const cells = [
    { id: 'statPop', value: NATIONAL.population, format: (v) => `${(v / 1e6).toFixed(1)}M`, label: 'Residents · 2020 census' },
    { id: 'statArea', value: NATIONAL.area, format: (v) => `${(v / 1e6).toFixed(2)}M mi²`, label: 'Total area' },
    { id: 'statStates', value: 51, format: () => '51', label: 'States + federal district' },
    { id: 'statYears', value: 0, format: () => '1787–1959', label: 'Years of statehood' }
  ];

  els.statsStrip.innerHTML = cells
    .map(
      (c) => `<div class="stat-cell">
        <div class="stat-value" id="${c.id}">${c.format(c.value)}</div>
        <div class="stat-label">${c.label}</div>
      </div>`
    )
    .join('');

  if (reducedMotion) return;

  [cells[0], cells[1]].forEach((c) => {
    const el = $(c.id);
    if (!el) return;
    const start = performance.now();
    const duration = 1200;
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = c.format(c.value * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* ------------------------------------------------------------------ superlatives */
function superlatives() {
  const statesOnly = STATES.filter((s) => s.abbr !== 'DC');
  const byPop = [...statesOnly].sort((a, b) => b.pop - a.pop)[0];
  const byArea = [...statesOnly].sort((a, b) => b.area - a.area)[0];
  const byDensity = [...statesOnly].sort((a, b) => b.pop / b.area - a.pop / a.area)[0];
  const newest = [...statesOnly].sort((a, b) => b.order - a.order)[0];
  const oldest = [...statesOnly].sort((a, b) => a.order - b.order)[0];

  return [
    { label: 'Most populous', meta: byPop, value: `${(byPop.pop / 1e6).toFixed(1)}M` },
    { label: 'Largest', meta: byArea, value: `${Math.round(byArea.area / 1000)}K mi²` },
    { label: 'Densest', meta: byDensity, value: `${fmt(byDensity.pop / byDensity.area)}/mi²` },
    { label: 'Newest state', meta: newest, value: `${new Date(newest.admitted + 'T00:00:00').getFullYear()}` },
    { label: 'Oldest state', meta: oldest, value: `${new Date(oldest.admitted + 'T00:00:00').getFullYear()}` }
  ].map((row) => ({ ...row, name: row.meta.name, fips: row.meta.fips }));
}

/* ------------------------------------------------------------------ overview */
function renderOverview() {
  const key = metricKey === 'signature' ? 'pop' : metricKey;
  const metric = METRICS[key];
  const ranked = [...STATES].sort((a, b) => metric.accessor(b) - metric.accessor(a)).slice(0, 5);
  const max = metric.accessor(ranked[0]);

  els.sidebar.innerHTML = `
    <div class="side-card">
      <div class="eyebrow">The big picture</div>
      <h2 class="side-title">50 states, one atlas</h2>
      <p class="side-sub">Hover or tap a state to open its profile — or search by name, capital, or nickname.</p>

      <div class="national-grid">
        <div class="mini-stat"><div class="v">${(NATIONAL.population / 1e6).toFixed(1)}M</div><div class="l">People</div></div>
        <div class="mini-stat"><div class="v">${(NATIONAL.area / 1e6).toFixed(2)}M</div><div class="l">Square miles</div></div>
        <div class="mini-stat"><div class="v">${fmt(NATIONAL.population / NATIONAL.area)}</div><div class="l">Per sq mile</div></div>
        <div class="mini-stat"><div class="v">4</div><div class="l">Census regions</div></div>
      </div>

      <div class="section-head">
        <h3>${metricKey === 'signature' ? 'Most populous' : `Top 5 · ${metric.label}`}</h3>
        <span>${metricKey === 'signature' ? 'people' : metric.legendTitle.split(' (')[0]}</span>
      </div>
      <div class="leader-list">
        ${ranked
          .map((s, i) => {
            const ratio = Math.max(0.06, metric.accessor(s) / max);
            return `<button class="leader-row" data-fips="${s.fips}" type="button">
              <span class="rank">${i + 1}</span>
              <span class="name">${s.name}</span>
              <span class="val">${metric.format(metric.accessor(s))}</span>
              <span class="leader-bar"><i style="width:${(ratio * 100).toFixed(1)}%"></i></span>
            </button>`;
          })
          .join('')}
      </div>

      <div class="hint-chips">
        <span class="hint-chip"><b>/</b> to search</span>
        <span class="hint-chip"><b>R</b> random state</span>
        <span class="hint-chip"><b>Scroll</b> zoom</span>
        <span class="hint-chip"><b>Q</b> quiz</span>
      </div>
    </div>
    <div class="side-card">
      <div class="eyebrow">By the numbers</div>
      <h2 class="side-title" style="font-size:18px;margin-bottom:12px">The record holders</h2>
      <div class="sup-list">
        ${superlatives()
          .map(
            (row) => `<button class="sup-row" data-fips="${row.fips}" type="button">
              <span class="sup-label">${row.label}</span>
              <span class="sup-name">${row.name}</span>
              <span class="sup-val">${row.value}</span>
            </button>`
          )
          .join('')}
      </div>
    </div>
    <p class="sidebar-note">Boundaries from the U.S. Census Bureau · population and area figures from the 2020 decennial census.</p>
  `;

  els.sidebar.querySelectorAll('.leader-row, .sup-row').forEach((row) => {
    row.addEventListener('click', () => {
      const meta = STATE_BY_FIPS.get(row.dataset.fips);
      if (!meta) return;
      chooseState(meta, { zoom: true });
    });
  });
}

/* ------------------------------------------------------------------ state card */
function renderStateCard(meta) {
  const regionColor = REGION_COLORS[theme][meta.region] || '#64748b';
  const companionRows = STATES.filter((s) => s.region === meta.region && s.fips !== meta.fips)
    .sort((a, b) => b.pop - a.pop)
    .slice(0, 5)
    .map(
      (s) => `<button class="peer-row" data-fips="${s.fips}" type="button">
        <span class="peer-abbr">${s.abbr}</span>
        <span class="peer-name">${s.name}</span>
        <span class="peer-pop">${(s.pop / 1e6).toFixed(1)}M</span>
      </button>`
    )
    .join("");
  const density = meta.pop / meta.area;
  const isDC = meta.abbr === 'DC';

  const rankLine = isDC
    ? 'A federal district since 1790 · not counted among the 50 states'
    : `No. ${POP_RANK.get(meta.fips)} in population · No. ${AREA_RANK.get(meta.fips)} in area`;

  const statCells = [
    ['Capital', meta.capital],
    ['Largest city', meta.largest],
    ['Population', fmt(meta.pop)],
    ['Area', `${fmt(meta.area)} mi²`],
    ['Density', `${fmt(density)} /mi²`],
    isDC ? ['Status', 'Federal district'] : ['Statehood', `${fmtDate(meta.admitted)}`]
  ];

  els.sidebar.innerHTML = `
    <div class="side-card" style="--region:${regionColor}">
      <div class="state-hero">
        <div class="abbr-badge">${meta.abbr}</div>
        <div class="name-wrap">
          <h2 class="state-name">${meta.name}</h2>
          <p class="state-nickname">${meta.nickname}</p>
        </div>
        <span class="region-tag">${meta.region}</span>
      </div>

      <div class="stat-grid">
        ${statCells
          .map(
            ([label, value], i) =>
              `<div class="detail-stat" style="--d:${i * 35}ms"><div class="l">${label}</div><div class="v" title="${value}">${value}</div></div>`
          )
          .join('')}
      </div>

      <div class="fact-box"><b>Did you know?</b>${meta.fact}</div>
      <p class="rank-line">${rankLine}</p>

      <div class="actions">
        <button class="btn btn-primary" id="focusState" type="button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
          Focus map
        </button>
        <button class="btn" id="randomState" type="button" title="Random state">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.2"/><circle cx="15.5" cy="15.5" r="1.2"/><circle cx="15.5" cy="8.5" r="1.2"/><circle cx="8.5" cy="15.5" r="1.2"/></svg>
          Random
        </button>
        <button class="btn btn-icon" id="clearState" type="button" aria-label="Clear selection" title="Clear selection">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
    </div>
    <div class="side-card" style="--region:${regionColor}">
      <div class="section-head">
        <h3>More in the ${meta.region}</h3>
        <span>${STATES.filter((s) => s.region === meta.region && s.fips !== meta.fips).length + 1} states</span>
      </div>
      <div class="peer-list">
        ${companionRows}
      </div>
    </div>
    <p class="sidebar-note">Click the state again, or press <b>Esc</b>, to return to the overview.</p>
  `;

  $('focusState').addEventListener('click', () => atlas.zoomTo(meta.fips));
  $('randomState').addEventListener('click', () => randomState());
  $('clearState').addEventListener('click', () => clearSelection());
  els.sidebar.querySelectorAll('.peer-row').forEach((row) => {
    row.addEventListener('click', () => {
      const next = STATE_BY_FIPS.get(row.dataset.fips);
      if (next) chooseState(next, { zoom: true });
    });
  });
}

function renderSidebar() {
  if (currentView === 'quiz') {
    renderQuizSidebar(quiz.snapshot);
    return;
  }
  if (selected) renderStateCard(selected);
  else renderOverview();
}

/* ------------------------------------------------------------------ selection */
function updateHash(abbr) {
  const target = abbr ? `#${abbr.toLowerCase()}` : `${location.pathname}${location.search}`;
  try {
    history.replaceState(null, '', target);
  } catch (e) {
    /* ignore */
  }
}

function stateFromHash() {
  const key = decodeURIComponent(location.hash.replace(/^#\/?/, '')).trim().toUpperCase();
  if (!key) return null;
  return STATES.find((s) => s.abbr === key) || null;
}

function chooseState(meta, { zoom = false } = {}) {
  if (currentView === 'quiz') return;
  selected = meta;
  atlas.select(meta.fips);
  renderStateCard(meta);
  updateHash(meta.abbr);
  if (zoom) atlas.zoomTo(meta.fips);
}

function clearSelection() {
  selected = null;
  if (atlas) atlas.select(null);
  updateHash(null);
  if (currentView === 'explore') renderOverview();
}

function handleMapSelect(meta) {
  if (currentView === 'quiz') {
    if (quiz.isPlaying) quiz.answer(meta.fips);
    else toast('Start the challenge to play', 'neutral');
    return;
  }

  if (!meta) {
    clearSelection();
    return;
  }

  if (selected && selected.fips === meta.fips) {
    clearSelection();
    return;
  }

  chooseState(meta);
  if (window.innerWidth <= 860) {
    setTimeout(() => scrollIntoViewWithHeader(els.sidebar), 140);
  }
}

/* ------------------------------------------------------------------ search */
function scoreMatch(state, q) {
  const name = state.name.toLowerCase();
  const abbr = state.abbr.toLowerCase();
  const capital = state.capital.toLowerCase();
  if (name === q || abbr === q) return 0;
  if (name.startsWith(q) || abbr.startsWith(q)) return 1;
  if (capital.startsWith(q)) return 2;
  if (name.includes(q)) return 3;
  if (capital.includes(q)) return 4;
  if (state.nickname.toLowerCase().includes(q)) return 5;
  return -1;
}

function runSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    closeSearch();
    return;
  }

  searchMatches = STATES.map((state) => ({ state, score: scoreMatch(state, q) }))
    .filter((m) => m.score >= 0)
    .sort((a, b) => a.score - b.score || a.state.name.localeCompare(b.state.name))
    .slice(0, 8)
    .map((m) => m.state);

  if (!searchMatches.length) {
    els.searchResults.innerHTML = `<div class="search-empty">No state or capital matches “${query.trim()}”.</div>`;
    els.searchResults.classList.add('is-open');
    searchIndex = -1;
    return;
  }

  const metric = METRICS[metricKey === 'signature' ? 'pop' : metricKey];
  els.searchResults.innerHTML = searchMatches
    .map((s, i) => {
      const right = metricKey === 'signature' ? s.region : metric.format(metric.accessor(s));
      return `<button class="search-item" data-fips="${s.fips}" data-index="${i}" role="option" aria-selected="false">
        <span class="abbr-chip">${s.abbr}</span>
        <span class="si-text">
          <span class="si-name">${s.name}</span>
          <span class="si-meta">Capital · ${s.capital}</span>
        </span>
        <span class="si-val">${right}</span>
      </button>`;
    })
    .join('');
  els.searchResults.classList.add('is-open');

  els.searchResults.querySelectorAll('.search-item').forEach((item) => {
    item.addEventListener('mousedown', (e) => e.preventDefault());
    item.addEventListener('click', () => {
      const meta = STATE_BY_FIPS.get(item.dataset.fips);
      if (meta) {
        chooseState(meta, { zoom: true });
        closeSearch();
        els.searchInput.value = '';
        els.searchInput.blur();
      }
    });
  });

  searchIndex = 0;
  highlightSearchItem();
}

function highlightSearchItem() {
  const items = [...els.searchResults.querySelectorAll('.search-item')];
  items.forEach((item, i) => {
    const active = i === searchIndex;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-selected', String(active));
    if (active) item.scrollIntoView({ block: 'nearest' });
  });
}

function closeSearch() {
  els.searchResults.classList.remove('is-open');
  els.searchResults.innerHTML = '';
  searchIndex = -1;
  searchMatches = [];
}

function commitSearch(index) {
  const meta = searchMatches[index];
  if (!meta) return;
  chooseState(meta, { zoom: true });
  closeSearch();
  els.searchInput.value = '';
  els.searchInput.blur();
}

/* ------------------------------------------------------------------ metrics */
function renderMetricPills() {
  els.metricPills.innerHTML = Object.values(METRICS)
    .map(
      (m) =>
        `<button class="metric-pill${m.key === metricKey ? ' is-active' : ''}" data-metric="${m.key}" type="button" aria-pressed="${m.key === metricKey}">${m.label}</button>`
    )
    .join('');

  els.metricPills.querySelectorAll('.metric-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      metricKey = btn.dataset.metric;
      atlas.setMetric(metricKey);
      els.metricPills.querySelectorAll('.metric-pill').forEach((b) => {
        const active = b.dataset.metric === metricKey;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      renderLegend();
      if (currentView === 'explore' && !selected) renderOverview();
      if (els.searchInput.value.trim()) runSearch(els.searchInput.value);
    });
  });
}

/* ------------------------------------------------------------------ theme */
function applyTheme(next, { animate = true } = {}) {
  theme = next;
  html.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#05070f' : '#eef3fa');
  try {
    localStorage.setItem('atlas-theme', next);
  } catch (e) {
    /* ignore */
  }
  if (atlas) atlas.setTheme(next);
  renderLegend();
  if (selected && currentView === 'explore') renderStateCard(selected);
  else if (currentView === 'explore') renderOverview();
  if (currentView === 'quiz') renderQuizSidebar(quiz.snapshot);
  if (animate) {
    html.classList.add('theme-shift');
    setTimeout(() => html.classList.remove('theme-shift'), 450);
  }
}

/* ------------------------------------------------------------------ toast */
let toastTimer = null;
function toast(message, kind = 'neutral', duration = 2000) {
  clearTimeout(toastTimer);
  els.mapToast.textContent = message;
  els.mapToast.className = `map-toast is-visible${kind === 'good' ? ' is-good' : kind === 'bad' ? ' is-bad' : ''}`;
  toastTimer = setTimeout(() => els.mapToast.classList.remove('is-visible'), duration);
}

function flashScreen(kind) {
  els.quizFlash.className = `quiz-flash ${kind}`;
  setTimeout(() => {
    els.quizFlash.className = 'quiz-flash';
  }, 750);
}

/* ------------------------------------------------------------------ random */
function randomState() {
  if (currentView === 'quiz') {
    toast('Finish or end the quiz to explore', 'neutral');
    return;
  }
  const pool = STATES.filter((s) => s.fips !== selected?.fips);
  const meta = pool[Math.floor(Math.random() * pool.length)];
  chooseState(meta, { zoom: true });
}

/* ------------------------------------------------------------------ quiz */
function scrollIntoViewWithHeader(el) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 104;
  window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? 'auto' : 'smooth' });
}

const quizHud = document.createElement('div');
quizHud.className = 'quiz-hud';
quizHud.id = 'quizHud';
els.stage.before(quizHud);

const quiz = new Quiz({
  states: STATES.filter((s) => s.abbr !== 'DC'),
  rounds: 10,
  timeLimit: 12,
  onChange: (snap) => {
    document.body.dataset.quizState = snap.status;
    renderQuizHud(snap);
    if (currentView === 'quiz') renderQuizSidebar(snap);
  },
  onTick: (tick) => updateHudTick(tick),
  onAnswer: (result) => handleQuizAnswer(result),
  onFinish: () => {
    recordBest(quiz.snapshot);
    if (currentView === 'quiz') {
      renderQuizSidebar(quiz.snapshot);
      if (window.innerWidth <= 1180) {
        setTimeout(() => scrollIntoViewWithHeader(els.sidebar), 80);
      }
    }
  }
});

function renderQuizHud(snap) {
  if (currentView !== 'quiz' || snap.status !== 'playing') {
    quizHud.classList.remove('is-visible');
    quizHud.innerHTML = '';
    return;
  }

  const prompt =
    snap.mode === 'find'
      ? `Find <em>${snap.current.name}</em>`
      : `Capital city: <em>${snap.current.capital}</em>`;

  quizHud.innerHTML = `
    <div class="quiz-hud-top">
      <span class="quiz-round">Round ${snap.round} of ${snap.rounds}</span>
      <div class="quiz-hud-scores">
        <span>Score <b id="hudScore">${snap.score}</b></span>
        <span class="streak-hold">Streak <b id="hudStreak">${snap.streak}</b></span>
      </div>
    </div>
    <div class="quiz-question">${prompt}</div>
    <div class="timer-track"><div class="timer-fill" id="hudTimer"></div></div>
  `;
  quizHud.classList.add('is-visible');
  updateHudTick({
    timeLeft: snap.timeLeft,
    timeLimit: snap.timeLimit,
    score: snap.score,
    streak: snap.streak
  });
}

function updateHudTick({ timeLeft, timeLimit, score, streak }) {
  const fill = $('hudTimer');
  if (fill) {
    const pct = Math.max(0, Math.min(100, (timeLeft / (timeLimit * 1000)) * 100));
    fill.style.width = `${pct}%`;
    fill.classList.toggle('is-low', timeLeft < 4000);
  }
  const scoreEl = $('hudScore');
  if (scoreEl) scoreEl.textContent = score;
  const streakEl = $('hudStreak');
  if (streakEl) streakEl.textContent = streak;
}

function handleQuizAnswer({ correct, picked, target, delta, timedOut }) {
  if (currentView !== 'quiz') return;

  if (correct) {
    atlas.flash(target.fips, 'correct', 1000);
    flashScreen('good');
    toast(`Correct! +${delta} pts`, 'good', 1400);
    return;
  }

  if (picked) {
    atlas.flash(picked.fips, 'wrong', 1300);
    atlas.reveal(target.fips, 1500);
  } else {
    atlas.reveal(target.fips, 1500);
  }
  flashScreen('bad');
  toast(
    timedOut || !picked
      ? `Time’s up — it was ${target.name}`
      : `That was ${picked.name} — it was ${target.name}`,
    'bad',
    1600
  );
}

function gradeFor(correct) {
  if (correct === 10) return 'Cartographer Supreme';
  if (correct >= 8) return 'Map Master';
  if (correct >= 6) return 'Geography Buff';
  if (correct >= 4) return 'Trailblazer';
  return 'Armchair Explorer';
}

function progressDots(snap) {
  const dots = Array.from({ length: snap.rounds }, (_, i) => {
    const result = snap.results[i];
    const cls = result ? (result.correct ? 'is-correct' : 'is-wrong') : i === snap.round - 1 && snap.status === 'playing' ? 'is-current' : '';
    return `<span class="dot ${cls}"></span>`;
  }).join('');
  return `<div class="quiz-progress-dots">${dots}</div>`;
}

function renderQuizSidebar(snap) {
  if (!snap) return;

  if (snap.status === 'playing') {
    const accuracy = snap.results.length
      ? Math.round((snap.correct / snap.results.length) * 100)
      : 0;
    els.sidebar.innerHTML = `
      <div class="side-card">
        <div class="eyebrow">Quiz in progress</div>
        <div class="score-row">Round ${snap.round} of ${snap.rounds}<b>${snap.score} pts</b></div>
        ${progressDots(snap)}
        <p class="side-sub">The question is on the map. Click the matching state — hover labels are off.</p>

        <div class="quiz-side-stats">
          <div class="mini-stat"><div class="v">${snap.score}</div><div class="l">Score</div></div>
          <div class="mini-stat"><div class="v">${snap.streak}</div><div class="l">Streak</div></div>
          <div class="mini-stat"><div class="v">${accuracy}%</div><div class="l">Accuracy</div></div>
        </div>

        <button class="btn" id="endQuiz" type="button" style="width:100%">End quiz</button>
        <div class="kbd-hint"><kbd>Q</kbd> back to exploring pauses the timer.</div>
      </div>
      <p class="sidebar-note">Correct answers earn 10 points plus a point for every second left on the clock, plus a streak bonus.</p>
    `;
    $('endQuiz').addEventListener('click', () => {
      quiz.abandon();
      atlas.clearFeedback();
      toast('Quiz ended', 'neutral');
      if (window.innerWidth <= 1180) {
        setTimeout(() => scrollIntoViewWithHeader(els.sidebar), 80);
      }
    });
    return;
  }

  if (snap.status === 'over') {
    const accuracy = Math.round((snap.correct / snap.rounds) * 100);
    const missed = snap.results.filter((r) => !r.correct).map((r) => STATE_BY_FIPS.get(r.fips)).filter(Boolean);

    els.sidebar.innerHTML = `
      <div class="side-card">
        <div class="eyebrow">Challenge complete</div>
        <div class="quiz-score-big">${snap.score}</div>
        <span class="grade-pill">${gradeFor(snap.correct)}${quizNewBest ? '<span class="best-badge">New best</span>' : ''}</span>
        <p class="side-sub">You found ${snap.correct} of ${snap.rounds} states in ${snap.mode === 'find' ? 'Find the state' : 'Capital match'} mode.</p>
        ${bestScores[snap.mode] ? `<p class="rank-line">Personal best · ${bestScores[snap.mode]} points</p>` : ''}

        <div class="quiz-side-stats">
          <div class="mini-stat"><div class="v">${snap.correct}/${snap.rounds}</div><div class="l">Correct</div></div>
          <div class="mini-stat"><div class="v">${accuracy}%</div><div class="l">Accuracy</div></div>
          <div class="mini-stat"><div class="v">${snap.bestStreak}</div><div class="l">Best streak</div></div>
        </div>

        ${
          missed.length
            ? `<div class="section-head"><h3>Missed states</h3><span>${missed.length}</span></div>
               <div class="missed-list">${missed.map((s) => `<span class="missed-chip">${s.name}</span>`).join('')}</div>`
            : `<p class="fact-box" style="--region:var(--good)"><b>Flawless map</b>All ten states located without a miss. That’s cartographer-level recall.</p>`
        }

        <div class="actions">
          <button class="btn btn-primary" id="quizAgain" type="button">Play again</button>
          <button class="btn" id="quizExplore" type="button">Explore map</button>
        </div>
      </div>
      <div class="side-card records-card">
        <div class="eyebrow">Your records</div>
        <div class="score-row">Find the state <b>${bestScores.find || '—'}</b></div>
        <div class="score-row">Capital match <b>${bestScores.capital || '—'}</b></div>
        <p class="sidebar-note" style="text-align:left;padding:0;margin-top:10px">Scores are saved on this device.</p>
      </div>
      <p class="sidebar-note">Switch to Explore to study the map, then come back for another run.</p>
    `;

    $('quizAgain').addEventListener('click', startQuiz);
    $('quizExplore').addEventListener('click', () => setView('explore'));
    return;
  }

  // idle / start screen
  els.sidebar.innerHTML = `
    <div class="side-card">
      <div class="eyebrow">Geography challenge</div>
      <h2 class="side-title">How well do you know the map?</h2>
      <p class="side-sub">Ten rounds, no state labels. Locate each state before the clock runs out.</p>

      <div class="quiz-mode-list">
        <button class="mode-option${quizModeChoice === 'find' ? ' is-active' : ''}" data-mode="find" type="button">
          <span class="mode-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg></span>
          <span class="mode-text"><span class="mode-title">Find the state</span><span class="mode-desc">We name it. You click it.</span></span>
        </button>
        <button class="mode-option${quizModeChoice === 'capital' ? ' is-active' : ''}" data-mode="capital" type="button">
          <span class="mode-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M6 20V9l6-5 6 5v11M10 20v-5h4v5"/></svg></span>
          <span class="mode-text"><span class="mode-title">Capital match</span><span class="mode-desc">We give the capital. You find its state.</span></span>
        </button>
      </div>

      <div class="quiz-side-stats">
        <div class="mini-stat"><div class="v" id="bestScore">${bestScores[quizModeChoice] ? bestScores[quizModeChoice] : '—'}</div><div class="l">Best score</div></div>
        <div class="mini-stat"><div class="v">10</div><div class="l">Rounds</div></div>
        <div class="mini-stat"><div class="v">12s</div><div class="l">Per round</div></div>
      </div>

      <button class="btn btn-primary" id="quizStart" type="button" style="width:100%">Start challenge</button>
      <div class="kbd-hint"><kbd>Q</kbd> toggles explore and quiz from anywhere.</div>
    </div>
    <p class="sidebar-note">Scoring: 10 points per correct state, 1 point per second remaining, and +2 for each consecutive hit.</p>
  `;

  els.sidebar.querySelectorAll('.mode-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      quizModeChoice = btn.dataset.mode;
      try {
        localStorage.setItem('atlas-quiz-mode', quizModeChoice);
      } catch (e) {
        /* ignore */
      }
      els.sidebar.querySelectorAll('.mode-option').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.mode === quizModeChoice);
      });
      const bestEl = $('bestScore');
      if (bestEl) bestEl.textContent = bestScores[quizModeChoice] ? bestScores[quizModeChoice] : '—';
    });
  });

  $('quizStart').addEventListener('click', startQuiz);
}

function startQuiz() {
  quizNewBest = false;
  atlas.setQuizMode(true);
  atlas.resetZoom();
  quiz.start(quizModeChoice);
  if (window.innerWidth <= 1180) {
    setTimeout(() => scrollIntoViewWithHeader(quizHud), 120);
  }
  toast(quizModeChoice === 'find' ? 'Locate the state on the map' : 'Find the capital’s state', 'neutral', 1800);
}

/* ------------------------------------------------------------------ views */
function setView(view) {
  if (view === currentView) return;
  currentView = view;
  document.body.dataset.view = view;

  els.viewTabs.querySelectorAll('.tab').forEach((tab) => {
    const active = tab.dataset.view === view;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });

  els.searchWrap.style.display = view === 'quiz' ? 'none' : '';

  if (view === 'quiz') {
    selected = null;
    atlas.select(null);
    updateHash(null);
    atlas.setQuizMode(true);
    if (quiz.isPlaying) {
      quiz.resume();
      toast('Quiz resumed — the clock is running', 'neutral', 1600);
    }
  } else {
    atlas.setQuizMode(false);
    atlas.clearFeedback();
    if (quiz.isPlaying) {
      quiz.pause();
      toast('Quiz paused — press Q to continue', 'neutral', 2200);
    }
    closeSearch();
    els.searchInput.value = '';
    if (!quiz.isPlaying) hideToast();
  }

  renderQuizHud(quiz.snapshot);
  renderSidebar();

  if (window.innerWidth <= 1180) {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }
}

function hideToast() {
  clearTimeout(toastTimer);
  els.mapToast.classList.remove('is-visible');
}

/* ------------------------------------------------------------------ keyboard */
document.addEventListener('keydown', (e) => {
  const tag = (document.activeElement?.tagName || '').toLowerCase();
  const typing = tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable;

  if (e.key === 'Escape') {
    if (els.searchResults.classList.contains('is-open')) {
      closeSearch();
      els.searchInput.blur();
      return;
    }
    if (currentView === 'explore' && selected) {
      clearSelection();
      return;
    }
  }

  if (typing) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  const key = e.key.toLowerCase();

  if (e.key === '/') {
    e.preventDefault();
    if (currentView === 'quiz') {
      toast('Search is off during the quiz', 'neutral', 1600);
      return;
    }
    els.searchInput.focus();
    els.searchInput.select();
    return;
  }

  if (key === 'r') {
    e.preventDefault();
    randomState();
    return;
  }

  if (key === 'q') {
    e.preventDefault();
    setView(currentView === 'quiz' ? 'explore' : 'quiz');
    return;
  }

  if (key === '0') {
    e.preventDefault();
    atlas.resetZoom();
    return;
  }

  if (e.key === '+' || e.key === '=') {
    e.preventDefault();
    atlas.zoomBy(1.4);
    return;
  }

  if (e.key === '-' || e.key === '_') {
    e.preventDefault();
    atlas.zoomBy(1 / 1.4);
    return;
  }

  if (currentView === 'explore' && selected && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    e.preventDefault();
    const idx = STATES.findIndex((s) => s.fips === selected.fips);
    const next = (idx + (e.key === 'ArrowRight' ? 1 : -1) + STATES.length) % STATES.length;
    chooseState(STATES[next], { zoom: true });
  }
});

/* ------------------------------------------------------------------ boot */
function init() {
  document.body.dataset.view = currentView;
  document.body.dataset.quizState = 'idle';
  applyTheme(theme, { animate: false });

  atlas = createAtlas({
    svg: $('map'),
    onSelect: handleMapSelect
  });

  atlas.setTheme(theme);
  renderLegend();
  renderStats();
  renderMetricPills();
  renderOverview();
  renderQuizHud(quiz.snapshot);

  els.searchInput.addEventListener('input', (e) => runSearch(e.target.value));
  els.searchInput.addEventListener('focus', () => {
    if (els.searchInput.value.trim()) runSearch(els.searchInput.value);
  });
  els.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!searchMatches.length) return;
      searchIndex = (searchIndex + (e.key === 'ArrowDown' ? 1 : -1) + searchMatches.length) % searchMatches.length;
      highlightSearchItem();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      commitSearch(searchIndex);
    } else if (e.key === 'Escape') {
      closeSearch();
      els.searchInput.blur();
    }
  });

  document.addEventListener('pointerdown', (e) => {
    if (!els.searchWrap.contains(e.target) && els.searchResults.classList.contains('is-open')) closeSearch();
  });

  window.addEventListener('hashchange', () => {
    const meta = stateFromHash();
    if (currentView === 'quiz') setView('explore');
    if (meta) chooseState(meta);
    else if (!location.hash) clearSelection();
  });

  els.themeBtn.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));
  els.randomBtn.addEventListener('click', randomState);
  els.zoomIn.addEventListener('click', () => atlas.zoomBy(1.4));
  els.zoomOut.addEventListener('click', () => atlas.zoomBy(1 / 1.4));
  els.zoomReset.addEventListener('click', () => atlas.resetZoom());

  els.viewTabs.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => setView(tab.dataset.view));
  });

  const deepLinked = stateFromHash();
  if (deepLinked) chooseState(deepLinked);
}

init();
