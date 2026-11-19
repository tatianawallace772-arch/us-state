import { geoAlbersUsa, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import { feature, mesh } from 'topojson-client';
import usTopo from 'us-atlas/states-10m.json';

import { STATES, STATE_BY_FIPS, REGION_COLORS, METRICS } from './data/states.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const W = 975;
const H = 610;

const PALETTES = {
  dark: {
    pop: ['#11243c', '#1d4ed8', '#7c3aed', '#db2777', '#fbbf24'],
    density: ['#0c2730', '#0e7490', '#06b6d4', '#67e8f9', '#ecfeff'],
    area: ['#1b1533', '#4c1d95', '#7c3aed', '#c084fc', '#f3e8ff'],
    order: ['#0f2027', '#1e3a8a', '#7c3aed', '#db2777', '#f59e0b']
  },
  light: {
    pop: ['#dbeafe', '#93c5fd', '#a78bfa', '#f472b6', '#f59e0b'],
    density: ['#d9f7f0', '#7dd3c7', '#22b8cf', '#0891b2', '#0e7490'],
    area: ['#f3e8ff', '#d8b4fe', '#a78bfa', '#7c3aed', '#4c1d95'],
    order: ['#dbeafe', '#93c5fd', '#c4b5fd', '#f9a8d4', '#fbbf24']
  }
};

const DC_COLOR = { dark: '#5b6b84', light: '#94a3b8' };
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function lerpColor(stops, t) {
  const pos = clamp(t, 0, 1) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(pos));
  const f = pos - i;
  const a = hexToRgb(stops[i]);
  const b = hexToRgb(stops[i + 1]);
  const c = a.map((v, idx) => Math.round(v + (b[idx] - v) * f));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function compact(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${Math.round(n)}`;
}

/** Color scale metadata for a metric, used by both the map and the legend. */
export function getScaleInfo(metricKey, theme = 'dark') {
  const metric = METRICS[metricKey];

  if (metricKey === 'signature') {
    return {
      key: 'signature',
      kind: 'categorical',
      title: 'Census region',
      regions: REGION_COLORS[theme],
      ticks: [],
      normalize: () => 0,
      stops: []
    };
  }

  const pool = STATES.filter((s) => s.abbr !== 'DC');
  const values = pool.map(metric.accessor);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const isLog = metric.scale === 'log';
  const raw = (v) => (isLog ? Math.log(Math.max(1, v)) : v);
  const lo = raw(min);
  const hi = raw(max);

  const mid = isLog ? Math.sqrt(min * max) : (min + max) / 2;
  const tickFormat =
    metricKey === 'pop'
      ? compact
      : metricKey === 'area'
        ? (v) => `${compact(v)} mi²`
        : metricKey === 'density'
          ? (v) => `${Math.round(v).toLocaleString()}/mi²`
          : (v) => `${Math.round(v)}`;

  return {
    key: metricKey,
    kind: isLog ? 'log' : 'linear',
    title: metric.legendTitle,
    stops: PALETTES[theme][metricKey],
    min,
    max,
    mid,
    ticks: [min, mid, max].map((v) => metric.format(v)),
    tickFormat,
    format: metric.format,
    normalize: (v) => (hi === lo ? 0.5 : (raw(v) - lo) / (hi - lo))
  };
}

/**
 * Builds the animated SVG atlas.
 * @param {object} options
 * @param {SVGSVGElement} options.svg
 * @param {(meta: object|null) => void} options.onSelect  fired when a state is chosen (null = cleared)
 */
export function createAtlas({ svg, onSelect }) {
  const stage = svg.closest('.map-stage');
  const tooltip = stage.querySelector('#tooltip');
  const zoomLayer = svg.querySelector('#zoomLayer');
  const statesLayer = svg.querySelector('#statesLayer');
  const labelsLayer = svg.querySelector('#labelsLayer');
  const pinsLayer = svg.querySelector('#pinsLayer');

  let theme = document.documentElement.dataset.theme || 'dark';
  let metricKey = 'signature';
  let selectedFips = null;
  let quizMode = false;
  let scaleInfo = getScaleInfo(metricKey, theme);
  let hoverEl = null;
  let zoomAnim = 0;

  const nation = feature(usTopo, usTopo.objects.nation);
  const projection = geoAlbersUsa().fitExtent(
    [
      [16, 26],
      [W - 16, H - 14]
    ],
    nation
  );
  const pathGen = geoPath(projection);

  const rawFeatures = feature(usTopo, usTopo.objects.states).features;
  const items = rawFeatures
    .filter((f) => STATE_BY_FIPS.has(String(f.id)))
    .map((f) => {
      const meta = STATE_BY_FIPS.get(String(f.id));
      return {
        meta,
        feature: f,
        d: pathGen(f),
        area: pathGen.area(f),
        centroid: pathGen.centroid(f),
        bounds: pathGen.bounds(f)
      };
    })
    .sort((a, b) => b.area - a.area); // small states paint last, on top

  const byFips = new Map(items.map((it) => [it.meta.fips, it]));
  const pathEls = new Map();

  const colorFor = (meta) => {
    if (scaleInfo.kind === 'categorical') return scaleInfo.regions[meta.region] || '#64748b';
    if (meta.abbr === 'DC') return DC_COLOR[theme];
    return lerpColor(scaleInfo.stops, scaleInfo.normalize(METRICS[metricKey].accessor(meta)));
  };

  // Coastline halo behind the states
  const outline = document.createElementNS(SVG_NS, 'path');
  outline.setAttribute('class', 'nation-outline');
  outline.setAttribute('d', pathGen(mesh(usTopo, usTopo.objects.states, (a, b) => a === b)) || '');
  statesLayer.appendChild(outline);

  const stateGroup = document.createElementNS(SVG_NS, 'g');
  stateGroup.setAttribute('class', 'states');
  statesLayer.appendChild(stateGroup);

  items.forEach((item) => {
    const { meta, d } = item;
    if (!d) return;

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'state');
    path.setAttribute('data-fips', meta.fips);
    path.setAttribute('aria-label', `${meta.name}`);
    path.setAttribute('role', 'button');
    path.setAttribute('tabindex', '0');
    path.style.fill = colorFor(meta);
    path.style.setProperty('--delay', `${meta.abbr === 'DC' ? 320 : (meta.order || 50) * 9}ms`);
    stateGroup.appendChild(path);
    pathEls.set(meta.fips, path);

    bindPointer(path, meta);
  });

  // District of Columbia — a precise, clickable marker
  const dc = byFips.get('11');
  if (dc) {
    const halo = document.createElementNS(SVG_NS, 'circle');
    halo.setAttribute('class', 'dc-halo');
    halo.setAttribute('cx', dc.centroid[0]);
    halo.setAttribute('cy', dc.centroid[1]);
    halo.setAttribute('r', 7);
    stateGroup.appendChild(halo);

    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('class', 'dc-dot');
    dot.setAttribute('cx', dc.centroid[0]);
    dot.setAttribute('cy', dc.centroid[1]);
    dot.setAttribute('r', 3);
    dot.setAttribute('data-fips', '11');
    dot.setAttribute('role', 'button');
    dot.setAttribute('tabindex', '0');
    dot.setAttribute('aria-label', 'District of Columbia');
    dot.style.fill = colorFor(dc.meta);
    stateGroup.appendChild(dot);
    pathEls.set('11', dot);
    bindPointer(dot, dc.meta);
  }

  // Abbreviation labels (appear once zoomed in)
  const labels = new Map();
  items.forEach((item) => {
    if (item.meta.abbr === 'DC') return;
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', item.centroid[0]);
    text.setAttribute('y', item.centroid[1]);
    text.textContent = item.meta.abbr;
    text.style.opacity = '0';
    labelsLayer.appendChild(text);
    labels.set(item.meta.fips, text);
  });

  /* ------------------------------- interactions */

  let downPoint = null;
  svg.addEventListener('pointerdown', (e) => {
    downPoint = { x: e.clientX, y: e.clientY };
  });

  function movedTooFar(e) {
    if (!downPoint || !e) return false;
    return Math.hypot(e.clientX - downPoint.x, e.clientY - downPoint.y) > 7;
  }

  function bindPointer(el, meta) {
    el.addEventListener('pointerenter', (e) => {
      if (hoverEl && hoverEl !== el) hoverEl.classList.remove('is-hover');
      hoverEl = el;
      el.classList.add('is-hover');
      if (!quizMode && e.pointerType !== 'touch') showTooltip(meta);
    });
    el.addEventListener('pointermove', (e) => {
      if (!quizMode && e.pointerType !== 'touch') positionTooltip(e);
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('is-hover');
      if (hoverEl === el) hoverEl = null;
      hideTooltip();
    });
    el.addEventListener('focus', () => {
      if (!quizMode) {
        showTooltip(meta);
        positionTooltipAtCentroid(meta);
      }
    });
    el.addEventListener('blur', hideTooltip);
    el.addEventListener('click', (e) => {
      if (movedTooFar(e)) return;
      handleChoose(meta);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleChoose(meta);
      }
    });
  }

  function handleChoose(meta) {
    if (quizMode) {
      onSelect(meta);
      return;
    }
    const next = selectedFips === meta.fips ? null : meta.fips;
    selectState(next);
    onSelect(next ? meta : null);
  }

  function showTooltip(meta) {
    const metric = METRICS[metricKey];
    const detail =
      metricKey === 'signature'
        ? `${meta.capital} · ${meta.abbr}`
        : `${metric.format(metric.accessor(meta))}`;
    const color =
      scaleInfo.kind === 'categorical'
        ? scaleInfo.regions[meta.region]
        : meta.abbr === 'DC'
          ? DC_COLOR[theme]
          : colorFor(meta);
    tooltip.innerHTML = `<div class="tt-name"><span class="tt-dot" style="background:${color}"></span>${meta.name}</div><div class="tt-meta">${detail}</div>`;
    tooltip.classList.add('is-visible');
  }

  function positionTooltip(e) {
    if (!e) return;
    const rect = stage.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 92, rect.width - 92);
    const y = clamp(e.clientY - rect.top, 92, rect.height - 8);
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }

  function positionTooltipAtCentroid(meta) {
    const rect = stage.getBoundingClientRect();
    const item = byFips.get(meta.fips);
    if (!item) return;
    tooltip.style.left = `${(item.centroid[0] / W) * rect.width}px`;
    tooltip.style.top = `${Math.max(92, (item.centroid[1] / H) * rect.height - 18)}px`;
  }

  function hideTooltip() {
    tooltip.classList.remove('is-visible');
  }

  /* ------------------------------- zoom */

  const zoomBehavior = d3zoom()
    .scaleExtent([1, 9])
    .translateExtent([
      [-220, -160],
      [W + 220, H + 160]
    ])
    .on('zoom', (event) => {
      const { k, x, y } = event.transform;
      zoomLayer.setAttribute('transform', `translate(${x},${y}) scale(${k})`);
      updateLabels(k);
    });

  const svgSel = select(svg);
  svgSel.call(zoomBehavior).on('dblclick.zoom', null);

  function updateLabels(k) {
    const show = k >= 1.22;
    items.forEach((item) => {
      const el = labels.get(item.meta.fips);
      if (!el) return;
      const visible = show && item.area * k * k > 1050;
      el.style.opacity = visible ? '0.95' : '0';
      el.setAttribute('font-size', (11.5 / k).toFixed(2));
      el.setAttribute('stroke-width', (3.2 / k).toFixed(2));
    });
  }

  function animateTo(target, duration = 700) {
    const token = ++zoomAnim;
    const from = zoomTransform(svg);
    const start = performance.now();
    const ease = (p) => 1 - Math.pow(1 - p, 3);

    function frame(now) {
      if (token !== zoomAnim) return;
      const p = Math.min(1, (now - start) / duration);
      const e = ease(p);
      const k = from.k + (target.k - from.k) * e;
      const x = from.x + (target.x - from.x) * e;
      const y = from.y + (target.y - from.y) * e;
      svgSel.call(zoomBehavior.transform, zoomIdentity.translate(x, y).scale(k));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function zoomTo(fips) {
    const item = byFips.get(fips);
    if (!item) return;
    const [[x0, y0], [x1, y1]] = item.bounds;
    const dx = Math.max(x1 - x0, 8);
    const dy = Math.max(y1 - y0, 8);
    const k = clamp(Math.min((W * 0.42) / dx, (H * 0.48) / dy), 1.5, 7);
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    animateTo(zoomIdentity.translate(W / 2 - k * cx, H / 2 - k * cy).scale(k));
  }

  function zoomBy(factor) {
    const t = zoomTransform(svg);
    const k = clamp(t.k * factor, 1, 9);
    const cx = W / 2;
    const cy = H / 2;
    const x = cx - ((cx - t.x) * k) / t.k;
    const y = cy - ((cy - t.y) * k) / t.k;
    animateTo(zoomIdentity.translate(x, y).scale(k), 280);
  }

  function resetZoom() {
    animateTo(zoomIdentity, 600);
  }

  /* ------------------------------- public API */

  function selectState(fips) {
    selectedFips = fips;
    pathEls.forEach((el, key) => el.classList.toggle('is-selected', key === fips));
    pinsLayer.innerHTML = '';

    if (fips) {
      const item = byFips.get(fips);
      if (!item) return;
      const ring = document.createElementNS(SVG_NS, 'circle');
      ring.setAttribute('class', 'pulse-ring');
      ring.setAttribute('cx', item.centroid[0]);
      ring.setAttribute('cy', item.centroid[1]);
      ring.setAttribute('r', Math.max(8, Math.min(20, Math.sqrt(Math.max(item.area, 1)) / 3)));
      pinsLayer.appendChild(ring);
    }
  }

  function recolor() {
    scaleInfo = getScaleInfo(metricKey, theme);
    pathEls.forEach((el, fips) => {
      const meta = STATE_BY_FIPS.get(fips);
      el.style.fill = colorFor(meta);
    });
  }

  function setMetric(key) {
    metricKey = key;
    recolor();
    return scaleInfo;
  }

  function setTheme(next) {
    theme = next;
    recolor();
    return scaleInfo;
  }

  function setQuizMode(on) {
    quizMode = on;
    hideTooltip();
    if (hoverEl) hoverEl.classList.remove('is-hover');
    if (on) selectState(null);
  }

  let flashTimer = null;
  function clearFeedback() {
    clearTimeout(flashTimer);
    pathEls.forEach((el) => el.classList.remove('is-correct', 'is-wrong'));
  }

  function flash(fips, kind, duration = 1200) {
    clearFeedback();
    const el = pathEls.get(fips);
    if (!el) return;
    el.classList.add(kind === 'correct' ? 'is-correct' : 'is-wrong');
    flashTimer = setTimeout(() => el.classList.remove('is-correct', 'is-wrong'), duration);
  }

  function reveal(fips, duration = 1400) {
    const el = pathEls.get(fips);
    if (!el) return;
    el.classList.add('is-correct');
    setTimeout(() => el.classList.remove('is-correct'), duration);
  }

  return {
    states: items.map((i) => i.meta),
    select: selectState,
    setMetric,
    setTheme,
    setQuizMode,
    zoomTo,
    zoomBy,
    resetZoom,
    flash,
    reveal,
    clearFeedback,
    getMetric: () => metricKey,
    getScaleInfo: () => scaleInfo,
    getSelected: () => selectedFips
  };
}
