/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/blocks/price/config.js":
/*!************************************!*\
  !*** ./src/blocks/price/config.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EASING: () => (/* binding */ EASING),
/* harmony export */   MAX_DUR: () => (/* binding */ MAX_DUR),
/* harmony export */   MIN_DUR: () => (/* binding */ MIN_DUR),
/* harmony export */   PREF_REDUCED: () => (/* binding */ PREF_REDUCED),
/* harmony export */   PX_PER_SECOND: () => (/* binding */ PX_PER_SECOND)
/* harmony export */ });
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const PX_PER_SECOND = 400;
const MIN_DUR = 120;
const MAX_DUR = 400;
const PREF_REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/***/ }),

/***/ "./src/blocks/price/core/controller.js":
/*!*********************************************!*\
  !*** ./src/blocks/price/core/controller.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createController: () => (/* binding */ createController),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/blocks/price/utils.js");

function createController(rootEl) {
  const root = rootEl;
  const rowsWrap = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '[data-rows]') || (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '.price__text-inner [data-rows]');
  let pagWrap = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '[data-analizy-pagination]') || (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '.analizy__pagination');
  const filters = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '[data-analizy-filters]');
  const searchForm = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '[data-analizy-search]') || document.getElementById('price__form');
  const priceList = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '.price__list') || root;
  const loader = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '.loader-wrapper');
  if (loader) loader.style.display = 'none';
  const postId = parseInt(root.getAttribute('data-post-id') || '0', 10);
  const ppp = parseInt(root.getAttribute('data-ppp') || '15', 10);
  const searchDelay = parseInt(root.getAttribute('data-search-delay') || '600', 10);
  const blockId = root.getAttribute('data-block-id') || '';
  const ptype = root.getAttribute('data-ptype') || '';
  const taxName = root.getAttribute('data-taxonomy') || '';
  const titleEl = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '.price__title') || document.querySelector('.price__title');
  const defaultTitle = titleEl ? titleEl.getAttribute('data-title') || titleEl.textContent || '' : '';
  const AJAX_GLOBAL = typeof window !== 'undefined' && window.appAjax ? window.appAjax : {};
  const AJAX_URL = AJAX_GLOBAL.ajaxurl || AJAX_GLOBAL.url || '/wp-admin/admin-ajax.php';
  const AJAX_NONCE = AJAX_GLOBAL.nonces && (AJAX_GLOBAL.nonces.price || AJAX_GLOBAL.nonces['price']) || AJAX_GLOBAL.nonce || '';
  const getParam = name => new URLSearchParams(location.search).get(name);
  const getPageFromPath = path => {
    const m = (path || '').match(/\/page\/(\d+)\/?$/);
    return m ? Math.max(1, parseInt(m[1], 10)) : 1;
  };
  const getSearchField = () => searchForm && ((0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(searchForm, '[name="q"]') || (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(searchForm, '[name="aside__form-input"]')) || null;
  const currentQuery = () => {
    const q1 = searchForm && (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(searchForm, '[name="q"]');
    const q2 = searchForm && (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(searchForm, '[name="aside__form-input"]');
    const v = q1 && q1.value || q2 && q2.value || '';
    return (v || '').trim();
  };
  const setSearchField = val => {
    const q1 = searchForm && (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(searchForm, '[name="q"]');
    const q2 = searchForm && (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(searchForm, '[name="aside__form-input"]');
    if (q1) q1.value = val || '';
    if (q2) q2.value = val || '';
  };
  function enforceExclusive(acat, q) {
    const qq = (q || '').trim();
    return qq ? {
      acat: '',
      q: qq
    } : {
      acat: acat || '',
      q: ''
    };
  }
  function getTermDisplay(slug) {
    if (!slug) return '';
    const btn = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '.aside__filter--ajax[data-term-slug="' + slug + '"]');
    if (!btn) return slug;
    const explicit = (btn.getAttribute('data-term-name') || '').trim();
    if (explicit) return explicit;
    const txt = (btn.textContent || '').trim();
    return txt || slug;
  }
  function updateTitle(nextState) {
    if (!titleEl) return;
    if (nextState.q) {
      titleEl.textContent = nextState.q;
      return;
    }
    if (nextState.acat) {
      titleEl.textContent = getTermDisplay(nextState.acat);
      return;
    }
    titleEl.textContent = defaultTitle;
  }
  const initialAcat = getParam('acat') || '';
  const initialQ = getParam('q') || currentQuery();
  const exclusive = enforceExclusive(initialAcat, initialQ);
  const state = {
    acat: exclusive.acat,
    q: exclusive.q,
    page: getPageFromPath(location.pathname) || 1
  };
  let pending = 0;
  function showLoader() {
    pending++;
    if (loader) loader.style.display = '';
  }
  function hideLoader() {
    pending = Math.max(0, pending - 1);
    if (pending === 0 && loader) loader.style.display = 'none';
  }
  const scrollOffset = parseInt(root.getAttribute('data-scroll-offset') || '0', 10);
  const scrollTarget = root.closest && root.closest('.price') ? root.closest('.price') : root;
  function scrollToPriceTop() {
    if (!scrollTarget) return;
    const prefersReduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = prefersReduce ? 'auto' : 'smooth';
    const doScroll = () => {
      const rect = scrollTarget.getBoundingClientRect();
      const top = Math.max(0, (window.pageYOffset || 0) + (rect.top || 0) - Math.max(0, scrollOffset || 0));
      try {
        window.scrollTo({
          top,
          behavior
        });
      } catch (_) {
        window.scrollTo(0, top);
      }
    };
    requestAnimationFrame(() => requestAnimationFrame(doScroll));
  }
  const skeletonMinMs = parseInt(root.getAttribute('data-skeleton-min') || '180', 10);
  const skeletonMap = new Map();
  function rowsCountFromHTML(html) {
    const s = (html || '').trim();
    if (!s) return 0;
    const tmp = document.createElement('div');
    tmp.innerHTML = s;
    const byCard = tmp.querySelectorAll ? tmp.querySelectorAll('.price__text-wrapp').length : 0;
    if (byCard > 0) return byCard;
    return tmp.children ? tmp.children.length : 0;
  }
  function skeletonRowInner() {
    return '<div class="price__text__name">' + '<span class="price__skeleton-line price__skeleton-line--1"></span>' + '<span class="price__skeleton-line price__skeleton-line--2"></span>' + '<span class="price__skeleton-line price__skeleton-line--3"></span>' + '</div>' + '<div class="price__text__cash">' + '<span class="price__skeleton-line price__skeleton-line--cash"></span>' + '</div>';
  }
  function skeletonRowHTML(seq, isDemo) {
    if (isDemo) {
      return '<div class="price__text-wrapp is-skeleton" data-price-skeleton-demo="1">' + skeletonRowInner() + '</div>';
    }
    return '<div class="price__text-wrapp is-skeleton" data-price-skeleton="1" data-price-skeleton-seq="' + String(seq) + '">' + skeletonRowInner() + '</div>';
  }
  function skeletonHTML(count, seq, isDemo) {
    const n = Math.max(1, parseInt(count || 1, 10));
    let out = '';
    for (let i = 0; i < n; i++) out += skeletonRowHTML(seq, isDemo);
    return out;
  }
  function removeSkeletonNodes(seq) {
    if (!rowsWrap) return;
    const selector = '[data-price-skeleton="1"]' + (seq ? '[data-price-skeleton-seq="' + String(seq) + '"]' : '');
    Array.from(rowsWrap.querySelectorAll(selector)).forEach(n => n.remove());
  }
  function clearAllSkeleton() {
    if (rowsWrap) {
      Array.from(rowsWrap.querySelectorAll('[data-price-skeleton-demo="1"]')).forEach(n => n.remove());
    }
    removeSkeletonNodes(0);
    if (rowsWrap) {
      rowsWrap.removeAttribute('aria-busy');
      rowsWrap.removeAttribute('data-price-skeleton-wrap');
    }
    skeletonMap.clear();
  }
  function startSkeleton(seq, mode, expectedCount) {
    if (!rowsWrap) return;
    clearAllSkeleton();
    const safeMode = mode === 'append' ? 'append' : 'replace';
    const expected = Math.max(1, parseInt(expectedCount || ppp || 1, 10));
    const prevHTML = safeMode === 'replace' ? rowsWrap.innerHTML : '';
    const startedAt = Date.now();
    skeletonMap.set(seq, {
      mode: safeMode,
      expected,
      startedAt,
      prevHTML
    });
    rowsWrap.setAttribute('aria-busy', 'true');
    if (safeMode === 'append') {
      const tmp = document.createElement('div');
      tmp.innerHTML = skeletonHTML(expected, seq, false);
      const frag = document.createDocumentFragment();
      Array.from(tmp.children).forEach(n => frag.appendChild(n));
      rowsWrap.appendChild(frag);
      return;
    }
    rowsWrap.setAttribute('data-price-skeleton-wrap', '1');
    rowsWrap.innerHTML = skeletonHTML(expected, seq, false);
  }
  function updateSkeletonCount(seq, newCount) {
    if (!rowsWrap) return;
    const st = skeletonMap.get(seq);
    if (!st) return;
    const next = Math.max(1, parseInt(newCount || 1, 10));
    if (next === st.expected) return;
    st.expected = next;
    skeletonMap.set(seq, st);
    if (st.mode === 'append') {
      removeSkeletonNodes(seq);
      const tmp = document.createElement('div');
      tmp.innerHTML = skeletonHTML(next, seq, false);
      const frag = document.createDocumentFragment();
      Array.from(tmp.children).forEach(n => frag.appendChild(n));
      rowsWrap.appendChild(frag);
      return;
    }
    rowsWrap.innerHTML = skeletonHTML(next, seq, false);
  }
  function ensureSkeletonMinTime(seq) {
    const st = skeletonMap.get(seq);
    if (!st) return Promise.resolve();
    const minMs = Math.max(0, parseInt(skeletonMinMs || 0, 10));
    if (!minMs) return Promise.resolve();
    const elapsed = Date.now() - st.startedAt;
    const wait = Math.max(0, minMs - elapsed);
    if (!wait) return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, wait));
  }
  function finishSkeleton(seq) {
    const st = skeletonMap.get(seq);
    if (!st) return;
    if (rowsWrap) {
      rowsWrap.removeAttribute('aria-busy');
      rowsWrap.removeAttribute('data-price-skeleton-wrap');
    }
    if (st.mode === 'append') removeSkeletonNodes(seq);
    skeletonMap.delete(seq);
  }
  function failSkeleton(seq) {
    const st = skeletonMap.get(seq);
    if (!st) return;
    if (rowsWrap) {
      rowsWrap.removeAttribute('aria-busy');
      rowsWrap.removeAttribute('data-price-skeleton-wrap');
    }
    if (st.mode === 'append') {
      removeSkeletonNodes(seq);
      skeletonMap.delete(seq);
      return;
    }
    if (rowsWrap) rowsWrap.innerHTML = st.prevHTML || '';
    skeletonMap.delete(seq);
  }
  function fetchPage(page, acat, q, opts = {}) {
    const ex = enforceExclusive(acat, q);
    const body = new URLSearchParams();
    const resolvedPage = Math.max(1, parseInt(page || 1, 10));
    const silent = !!opts.silent;
    body.set('action', 'get_price');
    body.set('post_id', String(postId));
    body.set('block_id', String(blockId));
    body.set('paged', String(resolvedPage));
    body.set('ppp', String(ppp));
    body.set('ptype', ptype);
    body.set('taxonomy', taxName || '');
    body.set('acat', ex.q ? '' : ex.acat || '');
    body.set('q', ex.q ? ex.q : '');
    if (AJAX_NONCE) body.set('nonce', AJAX_NONCE);
    if (!silent) showLoader();
    return fetch(AJAX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      credentials: 'same-origin',
      body
    }).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).finally(() => {
      if (!silent) hideLoader();
    });
  }
  function ensurePagWrap() {
    if (pagWrap && pagWrap.parentNode) return pagWrap;
    const el = document.createElement('div');
    el.className = 'analizy__pagination';
    el.setAttribute('data-analizy-pagination', '');
    priceList.appendChild(el);
    pagWrap = el;
    return pagWrap;
  }
  const allLoadedId = 'price-all-loaded';
  function getPaginationNode() {
    const insidePagWrap = pagWrap && pagWrap.querySelector ? (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(pagWrap, '.pagination') : null;
    return insidePagWrap || (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '.pagination') || null;
  }
  function removeAllLoadedNotice() {
    const existing = root.querySelector ? root.querySelector('#' + allLoadedId) : null;
    if (existing) existing.remove();
  }
  function insertAllLoadedNoticeBeforePagination(html) {
    const safe = (html || '').trim();
    if (!safe) return;
    removeAllLoadedNotice();
    const tmp = document.createElement('div');
    tmp.innerHTML = safe;
    const node = tmp.firstElementChild;
    if (!node) return;
    const paginationNode = getPaginationNode();
    if (paginationNode && paginationNode.parentNode) {
      paginationNode.parentNode.insertBefore(node, paginationNode);
      return;
    }
    if (pagWrap && pagWrap.parentNode) {
      pagWrap.parentNode.insertBefore(node, pagWrap);
      return;
    }
    priceList.appendChild(node);
  }
  function isLastPageByDOM() {
    const paginationNode = getPaginationNode();
    if (!paginationNode) return true;
    const hasNext = !!(0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(paginationNode, 'a.next.page-numbers');
    if (hasNext) return false;
    const currentEl = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(paginationNode, '.page-numbers.current[aria-current="page"]');
    const currentNum = currentEl ? parseInt((currentEl.textContent || '').trim(), 10) : NaN;
    let maxNum = 0;
    Array.from(paginationNode.querySelectorAll('a.page-numbers')).forEach(a => {
      const n = parseInt((a.textContent || '').trim(), 10);
      if (Number.isFinite(n)) maxNum = Math.max(maxNum, n);
    });
    if (Number.isFinite(currentNum) && maxNum > 0) {
      return currentNum >= maxNum;
    }
    if (maxNum > 0) {
      return state.page >= maxNum;
    }
    return true;
  }
  function syncAllLoadedFromResponse(d) {
    const html = d && typeof d.all_loaded_html === 'string' ? d.all_loaded_html : '';
    if (html && html.trim() !== '') {
      insertAllLoadedNoticeBeforePagination(html);
      return;
    }
    removeAllLoadedNotice();
  }
  function ensureAllLoadedOnInit() {
    if ((0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '#' + allLoadedId)) return;
    if (!isLastPageByDOM()) return;
    return fetchPage(state.page, state.acat, state.q, {
      silent: true
    }).then(res => {
      if (!res || !res.success || !res.data) return;
      syncAllLoadedFromResponse(res.data);
    }).catch(() => {});
  }
  function syncMoreFromResponse(d) {
    const existing = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '[data-more]');
    if (existing) existing.remove();
    const hasMoreFromFlag = !!(typeof d.has_more !== 'undefined' && d.has_more);
    const hasMoreFromHtml = !!(typeof d.more === 'string' && d.more.trim() !== '');
    if (hasMoreFromHtml) {
      const tmp = document.createElement('div');
      tmp.innerHTML = d.more;
      const btn = tmp.querySelector('[data-more]');
      if (btn) {
        pagWrap && pagWrap.parentNode ? pagWrap.parentNode.insertBefore(btn, pagWrap) : priceList.appendChild(btn);
      }
      return;
    }
    if (hasMoreFromFlag) {
      const btn2 = document.createElement('button');
      btn2.type = 'button';
      btn2.className = 'price__button btn btn--middle btn--blue-sky load-more';
      btn2.setAttribute('data-more', '');
      btn2.setAttribute('aria-label', 'Завантажити ще');
      btn2.textContent = 'Завантажити ще';
      pagWrap && pagWrap.parentNode ? pagWrap.parentNode.insertBefore(btn2, pagWrap) : priceList.appendChild(btn2);
    }
  }
  function replaceContent(d) {
    if (rowsWrap) rowsWrap.innerHTML = d.rows || '';
    if (typeof d.pagination !== 'undefined') {
      if (d.pagination) {
        ensurePagWrap().innerHTML = d.pagination;
      } else if (pagWrap) {
        pagWrap.innerHTML = '';
      }
    }
    syncMoreFromResponse(d);
    syncAllLoadedFromResponse(d);
  }
  function appendContent(d) {
    if (rowsWrap) {
      const tmp = document.createElement('div');
      tmp.innerHTML = d.rows || '';
      const frag = document.createDocumentFragment();
      Array.from(tmp.children).forEach(n => frag.appendChild(n));
      rowsWrap.appendChild(frag);
    }
    if (typeof d.pagination !== 'undefined' && d.pagination) {
      ensurePagWrap().innerHTML = d.pagination;
    }
    syncMoreFromResponse(d);
    syncAllLoadedFromResponse(d);
  }
  function setActiveFilter(slug) {
    (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qsa)(root, '[data-term-slug]').forEach(btn => {
      const active = (btn.getAttribute('data-term-slug') || '') === (slug || '');
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  function pushUrl(nextUrl, page, acat, q) {
    try {
      if (nextUrl) {
        history.pushState({
          page,
          acat: acat || '',
          q: q || ''
        }, '', nextUrl);
        return;
      }
      const u = new URL(location.href);
      const basePath = u.pathname.replace(/\/page\/\d+\/?$/, '/');
      u.pathname = page > 1 ? basePath.replace(/\/$/, '') + '/page/' + page + '/' : basePath;
      if (q && q.trim() !== '') {
        u.searchParams.set('q', q);
        u.searchParams.delete('acat');
      } else if (acat) {
        u.searchParams.set('acat', acat);
        u.searchParams.delete('q');
      } else {
        u.searchParams.delete('q');
        u.searchParams.delete('acat');
      }
      history.pushState({
        page,
        acat: acat || '',
        q: q || ''
      }, '', u.toString());
    } catch (_) {}
  }
  let reqCounter = 0;
  let lastApplied = 0;
  function expectedSkeletonCount(mode) {
    const base = Math.max(1, parseInt(ppp || 1, 10));
    if (mode === 'append') return base;
    if (!rowsWrap) return base;
    const curr = rowsWrap.children ? rowsWrap.children.length : 0;
    return Math.max(1, curr || base);
  }
  function go(page, acat, q, mode = 'replace', push = true) {
    const ex = enforceExclusive(acat, q);
    const targetPage = Math.max(1, parseInt(page || 1, 10));
    const seq = ++reqCounter;
    startSkeleton(seq, mode, expectedSkeletonCount(mode));
    return fetchPage(targetPage, ex.acat, ex.q).then(res => {
      if (!res || !res.success) {
        throw new Error(res && res.data && res.data.message || 'ajax error');
      }
      if (seq < lastApplied) return;
      const nextCount = rowsCountFromHTML(res && res.data && typeof res.data.rows === 'string' ? res.data.rows : '');
      if (nextCount > 0) updateSkeletonCount(seq, nextCount);
      return ensureSkeletonMinTime(seq).then(() => {
        if (seq < lastApplied) {
          finishSkeleton(seq);
          return;
        }
        if (mode === 'append') {
          finishSkeleton(seq);
          appendContent(res.data);
        } else {
          replaceContent(res.data);
          finishSkeleton(seq);
        }
        lastApplied = seq;
        state.page = targetPage;
        state.acat = ex.acat || '';
        state.q = ex.q || '';
        if (push) {
          pushUrl(res.data && res.data.url ? res.data.url : '', state.page, state.acat, state.q);
        }
        setActiveFilter(state.acat);
        updateTitle(state);
        root.dispatchEvent(new CustomEvent('price:state', {
          detail: {
            ...state
          }
        }));
      });
    }).catch(err => {
      console.error('[price] ajax error:', err);
      failSkeleton(seq);
    });
  }
  function setActiveFilterOnInit() {
    setActiveFilter(state.acat);
    updateTitle(state);
    if (state.q) setSearchField(state.q);else if (!state.acat) setSearchField('');
  }
  function pageFromHref(href) {
    try {
      const u = new URL(href, window.location.origin);
      const p1 = parseInt(u.searchParams.get('paged') || '', 10);
      if (p1 && Number.isFinite(p1)) return Math.max(1, p1);
      return getPageFromPath(u.pathname);
    } catch (_) {
      return 1;
    }
  }
  function onPaginationClick(e) {
    const a = e.target && e.target.closest ? e.target.closest('.pagination a.page-numbers') : null;
    if (!a) return;
    if (!root.contains(a)) return;
    const href = a.getAttribute('href') || '';
    if (!href) return;
    e.preventDefault();
    const page = pageFromHref(href);
    Promise.resolve(go(page, state.acat, state.q, 'replace', true)).then(scrollToPriceTop);
  }
  root.addEventListener('click', onPaginationClick);
  const demoBtn = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '[data-skeleton-demo]');
  let demoOn = false;
  let demoPrevHTML = '';
  let demoMode = 'replace';
  function showSkeletonDemo(count, mode) {
    if (!rowsWrap) return;
    demoMode = mode === 'append' ? 'append' : 'replace';
    rowsWrap.setAttribute('aria-busy', 'true');
    if (demoMode === 'replace') {
      demoPrevHTML = rowsWrap.innerHTML;
      rowsWrap.innerHTML = skeletonHTML(Math.max(1, count), 'demo', true);
      demoOn = true;
      return;
    }
    const tmp = document.createElement('div');
    tmp.innerHTML = skeletonHTML(Math.max(1, count), 'demo', true);
    const frag = document.createDocumentFragment();
    Array.from(tmp.children).forEach(n => frag.appendChild(n));
    rowsWrap.appendChild(frag);
    demoOn = true;
  }
  function hideSkeletonDemo() {
    if (!rowsWrap) return;
    if (demoMode === 'replace') {
      rowsWrap.innerHTML = demoPrevHTML || '';
      rowsWrap.removeAttribute('aria-busy');
      demoOn = false;
      return;
    }
    Array.from(rowsWrap.querySelectorAll('[data-price-skeleton-demo="1"]')).forEach(n => n.remove());
    rowsWrap.removeAttribute('aria-busy');
    demoOn = false;
  }
  function toggleSkeletonDemo() {
    if (!rowsWrap) return;
    if (demoOn) {
      hideSkeletonDemo();
      return;
    }
    const btnCount = demoBtn ? parseInt(demoBtn.getAttribute('data-skeleton-count') || '0', 10) : 0;
    const btnMode = demoBtn ? demoBtn.getAttribute('data-skeleton-mode') || 'replace' : 'replace';
    const count = Math.max(1, btnCount || ppp || 1);
    showSkeletonDemo(count, btnMode);
  }
  if (demoBtn) {
    demoBtn.addEventListener('click', e => {
      e.preventDefault();
      toggleSkeletonDemo();
    });
  }
  function applyAllLoadedOnInit() {
    if (!isLastPageByDOM()) {
      removeAllLoadedNotice();
      return;
    }
    if ((0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '#' + allLoadedId)) return;
    ensureAllLoadedOnInit();
  }
  applyAllLoadedOnInit();
  return {
    root,
    rowsWrap,
    filters,
    searchForm,
    postId,
    ppp,
    searchDelay,
    blockId,
    taxName,
    state,
    getParam,
    getPageFromPath,
    getSearchField,
    setSearchField,
    currentQuery,
    enforceExclusive,
    fetchPage,
    go,
    replaceContent,
    appendContent,
    setActiveFilter,
    setActiveFilterOnInit,
    toggleSkeletonDemo,
    get pagWrap() {
      return pagWrap;
    }
  };
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (createController);

/***/ }),

/***/ "./src/blocks/price/features/filtersModal.js":
/*!***************************************************!*\
  !*** ./src/blocks/price/features/filtersModal.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initFilters: () => (/* binding */ initFilters),
/* harmony export */   initFiltersModal: () => (/* binding */ initFiltersModal)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/blocks/price/utils.js");

const bound = new WeakSet();

/**
 * Prepare filter markup inside a given container:
 * - Ensures collapsible areas have explicit inline styles for height-based transitions
 * - Normalizes ARIA for buttons and makes them keyboard-focusable
 *
 * @param {Element|Document} container
 */
function primeFilterDOM(container) {
  // Set transition-friendly styles for collapsible inner sections
  (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qsa)(container, '.aside__filter__wrapper.has-children .aside__filter__inner').forEach(inner => {
    inner.style.overflow = 'hidden';
    inner.style.willChange = 'height';
    const wrap = inner.closest('.aside__filter__wrapper');
    // Start opened groups at "auto", closed ones at "0px" for clean transitions
    inner.style.height = wrap && wrap.classList.contains('open') ? 'auto' : '0px';

    // Keep layout consistent when the inner is "opened"
    inner.style.display = 'flex';
    inner.style.flexDirection = 'column';
  });

  // Parent toggles: set ARIA and keyboard semantics
  (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qsa)(container, '.aside__filter-btn').forEach(btn => {
    const wrap = btn.closest('.aside__filter__wrapper.has-children');
    if (!wrap) return;
    btn.setAttribute('aria-expanded', wrap.classList.contains('open') ? 'true' : 'false');
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
  });

  // Term buttons (AJAX): make them accessible as buttons
  (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qsa)(container, '.aside__filter--ajax').forEach(btn => {
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
  });
}

/**
 * Toggle a parent group open/closed and update ARIA.
 * Closes sibling groups to keep only one open at a time.
 *
 * @param {Element} scope - Container in which to close other parents
 * @param {Element} btn   - The clicked parent toggle button
 */
function handleParentBtn(scope, btn) {
  const wrap = btn.closest('.aside__filter__wrapper.has-children');
  if (!wrap) return;
  const willOpen = !wrap.classList.contains('open');
  if (willOpen) {
    // Close other groups in the same scope, then open this one
    (0,_utils__WEBPACK_IMPORTED_MODULE_0__.closeAllParentsExcept)(scope, wrap);
    (0,_utils__WEBPACK_IMPORTED_MODULE_0__.slideOpen)(wrap);
    btn.setAttribute('aria-expanded', 'true');
  } else {
    // Close this group
    (0,_utils__WEBPACK_IMPORTED_MODULE_0__.slideClose)(wrap);
    btn.setAttribute('aria-expanded', 'false');
  }
}

/**
 * Handle clicking a term (leaf) filter button:
 * - Clears search field
 * - Navigates to page 1 with a selected term slug
 * - Calls optional callback (e.g. to close modal)
 *
 * @param {Object} controller
 * @param {Element} termBtn
 * @param {Function} [onPicked]
 */
function handleTermBtn(controller, termBtn, onPicked) {
  const slug = termBtn.getAttribute('data-term-slug') || ' ';
  controller.setSearchField('');
  controller.go(1, slug, '', 'replace', true);
  if (typeof onPicked === 'function') onPicked();
}

/**
 * Bind click/keyboard handlers for a filter container (once).
 * Uses event delegation:
 * - .aside__filter-btn (parent toggles)
 * - .aside__filter--ajax[data-term-slug] (term items)
 *
 * @param {Element} container
 * @param {Object} controller
 * @param {Function} [onPicked]
 */
function bindFilters(container, controller, onPicked) {
  if (!container || bound.has(container)) return;
  bound.add(container);

  // Mouse interaction (delegated)
  container.addEventListener('click', e => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;

    // Parent group toggle
    const parentBtn = t.closest('.aside__filter-btn:not(.aside__filter--ajax)');
    if (parentBtn && container.contains(parentBtn)) {
      e.preventDefault();
      e.stopPropagation();
      handleParentBtn(container, parentBtn);
      return;
    }

    // Term (leaf) selection
    const termBtn = t.closest('.aside__filter--ajax[data-term-slug]');
    if (termBtn && container.contains(termBtn)) {
      e.preventDefault();
      e.stopPropagation();
      handleTermBtn(controller, termBtn, onPicked);
    }
  });

  // Keyboard interaction (Enter/Space activate)
  container.addEventListener('keydown', e => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const isParent = t.matches('.aside__filter-btn:not(.aside__filter--ajax)');
    const isTerm = t.matches('.aside__filter--ajax[data-term-slug]');
    if (isParent) {
      e.preventDefault();
      handleParentBtn(container, t);
    } else if (isTerm) {
      e.preventDefault();
      handleTermBtn(controller, t, onPicked);
    }
  });
}

/**
 * Initialize filters in static layout (non-modal).
 * @param {Object} controller
 */
function initFilters(controller) {
  const {
    root,
    filters
  } = controller;
  if (root) primeFilterDOM(root);
  if (filters) {
    primeFilterDOM(filters);
    bindFilters(filters, controller);
  }
}

/**
 * Initialize mobile/overlay filters modal.
 * Builds a modal on-demand by cloning the source `.aside__filter-flex`
 * into the modal body to keep markup/parity with desktop.
 *
 * @param {Object} controller
 */
function initFiltersModal(controller) {
  const {
    root
  } = controller;
  const filterMobileBtn = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '.aside__filter-mobile');
  const sourceFlex = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '.aside__filter-flex');

  // Modal DOM refs (lazy-created)
  let modalEl = null;
  let modalBody = null;
  let modalWrapper = null;
  let modalBg = null;

  // Global handlers: keep named refs for clean unbind
  let windowClickHandler = null;
  let keydownHandler = null;
  let modalClickHandler = null;
  let handlersBound = false;

  // "Desktop" breakpoint — if desktop, clicking mobile filter simply shows all results
  const mqlDesktop = window.matchMedia('(min-width: 1024px)');

  // Scroll lock helpers for body when modal is open
  const lockScroll = () => document.body.classList.add('no-scroll', 'modal-view');
  const unlockScroll = () => document.body.classList.remove('no-scroll', 'modal-view');

  /**
   * Smoothly scroll back to the price list area (after picking a term in modal).
   * Honors sticky header height or a custom `data-scroll-offset` if provided.
   */
  function scrollToPrices() {
    const scrollOffsetExtra = 70;
    const offsetAttr = parseInt(root.getAttribute('data-scroll-offset') || '0', 10);
    const header = document.querySelector('.header.is-sticky, .site-header.is-sticky, .header.sticky, .site-header.sticky');
    const headerH = header ? header.getBoundingClientRect().height : 0;

    // Prefer explicit offset; otherwise use detected header height
    const baseOffset = Number.isFinite(offsetAttr) && offsetAttr > 0 ? offsetAttr : headerH;
    const top = Math.max(0, root.getBoundingClientRect().top + window.pageYOffset - (baseOffset + scrollOffsetExtra));

    // Use next-tick to avoid clashing with DOM updates on modal close
    setTimeout(() => {
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }, 0);
  }

  /**
   * Lazily create the modal structure and wire the core event handlers.
   * @returns {Element} modal element
   */
  function ensureModal() {
    if (modalEl) return modalEl;
    const ptypeLabel = root.getAttribute('data-ptype-label') || (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(root, '.price__title')?.getAttribute('data-title') || '';
    const titleText = ptypeLabel ? 'Показати всі ' + ptypeLabel : 'Показати всі';

    // Base modal markup; kept minimal and self-contained
    modalEl = document.createElement('div');
    modalEl.className = 'modal modal--filters';
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.hidden = true;
    modalEl.innerHTML = '<div class="modal__wrapper modal__wrapper--filters">' + '<button type="button" class="modal__close" data-filters-close aria-label="Закрити модальне вікно">' + '<span class="icon-wrapper icon-close"><svg role="presentation" focusable="false"><use xlink:href="/wp-content/themes/ensuria/assets/img/path-icon.svg#icon-close"></use></svg></span>' + '</button>' + '<h3 class="price__title" data-title="' + (ptypeLabel || '') + '">' + titleText + '</h3>' + '<div class="filters-modal__body modal__body--filters" data-filters-modal-body></div>' + '</div>' + '<div class="modal__bg modal__bg--filters" data-filters-close></div>';
    document.body.appendChild(modalEl);

    // Cache important nodes
    modalBody = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(modalEl, '[data-filters-modal-body]');
    modalWrapper = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(modalEl, '.modal__wrapper');
    modalBg = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.qs)(modalEl, '.modal__bg');

    // Avoid pointer-events dead zones on nested elements
    modalEl.style.pointerEvents = 'auto';
    modalWrapper.style.pointerEvents = 'auto';
    modalBody.style.pointerEvents = 'auto';

    // Local (modal) click handler: close on explicit close targets
    modalClickHandler = e => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;
      if (target.closest('[data-filters-close], .modal__close')) {
        closeModal();
      }
    };

    // Global capture-phase click handler to catch delegated interactions inside modal
    windowClickHandler = e => {
      if (!modalEl) return;
      const target = e.target instanceof Element ? e.target : null;
      if (!target || !modalEl.contains(target)) return;

      // Direct matches via closest(...)
      const parentDirect = target.closest('.aside__filter-btn:not(.aside__filter--ajax)');
      if (parentDirect) {
        e.preventDefault();
        handleParentBtn(modalEl, parentDirect);
        return;
      }
      const termDirect = target.closest('.aside__filter--ajax[data-term-slug]');
      if (termDirect) {
        e.preventDefault();
        handleTermBtn(controller, termDirect, () => {
          closeModal();
          scrollToPrices();
        });
        return;
      }

      // Prefer composedPath() for accurate hit-testing across Shadow DOM boundaries
      const path = typeof e.composedPath === 'function' ? e.composedPath() : null;

      /**
       * Why this fallback search?
       *
       * In some scenarios, relying solely on `target.closest(...)` or a simple
       * `parentElement` walk can miss the *actual* interactive node:
       *
       * - Shadow DOM / Web Components (retargeting): the event target may be
       *   retargeted to the host or a slotted wrapper, while the real control
       *   you care about exists elsewhere on the *composed* event path.
       * - Slotted content: nodes distributed via `<slot>` don't form a regular
       *   parentElement chain as seen from the light DOM, but *do* appear in
       *   `e.composedPath()`.
       * - Delegated listeners on `window` (capture): when listening high up,
       *   walking `parentElement` from `target` can skip elements that are only
       *   reachable via the composed path (especially with Shadow DOM involved).
       * - Legacy / partial support: if `Event.prototype.composedPath` is absent
       *   or a closed shadow root hides details, we gracefully degrade to a
       *   normal parent walk *within the modal boundary*.
       *
       * Strategy:
       * 1) Try `e.composedPath()` and scan for a selector match that is also
       *    inside `modalEl` (prevents leaking outside).
       * 2) Fallback to manual `parentElement` traversal, stopping at `modalEl`.
       *
       * This keeps delegated hit-testing reliable across shadow boundaries and
       * odd DOM topologies, while remaining safe and bounded.
       */
      const findInPath = selector => {
        if (Array.isArray(path)) {
          for (let i = 0; i < path.length; i++) {
            const el = path[i];
            if (el instanceof Element && modalEl.contains(el) && el.matches(selector)) {
              return el;
            }
            if (el === modalEl) break;
          }
        }
        let node = target.parentElement;
        while (node && node !== modalEl) {
          if (node.matches(selector)) return node;
          node = node.parentElement;
        }
        return null;
      };
      const parentFromPath = findInPath('.aside__filter-btn:not(.aside__filter--ajax)');
      if (parentFromPath) {
        e.preventDefault();
        handleParentBtn(modalEl, parentFromPath);
        return;
      }
      const termFromPath = findInPath('.aside__filter--ajax[data-term-slug]');
      if (termFromPath) {
        e.preventDefault();
        handleTermBtn(controller, termFromPath, () => {
          closeModal();
          scrollToPrices();
        });
      }
    };

    // Keyboard handler for focus-within modal (Enter/Space activate)
    keydownHandler = e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const active = document.activeElement;
      if (!active || !(active instanceof Element) || !modalEl.contains(active)) return;
      if (active.matches('.aside__filter-btn:not(.aside__filter--ajax)')) {
        e.preventDefault();
        handleParentBtn(modalEl, active);
      } else if (active.matches('.aside__filter--ajax[data-term-slug]')) {
        e.preventDefault();
        handleTermBtn(controller, active, () => {
          closeModal();
          scrollToPrices();
        });
      }
    };
    return modalEl;
  }

  /**
   * Attach global listeners once per modal lifecycle.
   * Using explicit unbind on close helps prevent memory leaks if modal is recreated.
   */
  function bindGlobalHandlers() {
    if (handlersBound || !modalEl) return;
    modalEl.addEventListener('click', modalClickHandler);
    window.addEventListener('click', windowClickHandler, true); // capture
    document.addEventListener('keydown', keydownHandler);
    handlersBound = true;
  }

  /**
   * Detach global listeners to avoid duplicate handlers and leaks.
   */
  function unbindGlobalHandlers() {
    if (!handlersBound || !modalEl) return;
    modalEl.removeEventListener('click', modalClickHandler);
    window.removeEventListener('click', windowClickHandler, true);
    document.removeEventListener('keydown', keydownHandler);
    handlersBound = false;
  }

  /**
   * Clone the source filter flex container into the modal and re-bind logic.
   * This keeps desktop and modal markup in sync without duplicating templates.
   * @returns {boolean} true if modal body was populated
   */
  function buildModalFilters() {
    if (!modalBody) return false;
    modalBody.innerHTML = '';
    if (!sourceFlex) return false;

    // Clone to avoid moving the original DOM
    const clone = sourceFlex.cloneNode(true);
    modalBody.appendChild(clone);
    modalBody.style.pointerEvents = 'auto';

    // Re-prime and bind inside the modal context
    primeFilterDOM(modalBody);
    const flexInModal = modalBody.querySelector('.aside__filter-flex') || modalBody;
    const afterPick = () => {
      closeModal();
      scrollToPrices();
    };
    bindFilters(flexInModal, controller, afterPick);
    return true;
  }

  /**
   * Open the modal (lazy-build if needed), lock scroll, set ARIA/state classes.
   * Falls back to "show all" if modal cannot be built (e.g., missing source markup).
   */
  function openModal() {
    ensureModal();
    const ok = buildModalFilters();
    if (!ok) {
      showAll();
      return;
    }
    bindGlobalHandlers();
    modalEl.classList.add('price');
    modalEl.hidden = false;
    modalEl.setAttribute('aria-hidden', 'false');
    modalEl.classList.add('modal--show');
    root.classList.add('filters-open');
    root.dispatchEvent(new CustomEvent('filters:toggle'));
    lockScroll();
  }

  /**
   * Close the modal, unlock scroll, and clean up handlers.
   */
  function closeModal() {
    if (!modalEl) return;
    unbindGlobalHandlers();
    modalEl.classList.remove('modal--show');
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.hidden = true;
    modalEl.classList.remove('price');
    root.classList.remove('filters-open');
    root.dispatchEvent(new CustomEvent('filters:toggle'));
    unlockScroll();
  }

  /**
   * Helper: clear search and show all results.
   */
  function showAll() {
    controller.setSearchField('');
    controller.go(1, '', '', 'replace', true);
  }

  // Entry point: mobile/overlay button
  if (filterMobileBtn) {
    (0,_utils__WEBPACK_IMPORTED_MODULE_0__.on)(filterMobileBtn, 'click', e => {
      e.preventDefault();

      // On desktop, mobile filter button acts like "show all"
      if (mqlDesktop.matches) {
        showAll();
        return;
      }
      openModal();
    });
  }
}

/***/ }),

/***/ "./src/blocks/price/features/paginationSearch.js":
/*!*******************************************************!*\
  !*** ./src/blocks/price/features/paginationSearch.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initPagination: () => (/* binding */ initPagination),
/* harmony export */   initSearch: () => (/* binding */ initSearch)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/blocks/price/utils.js");

function getPageFromUrl(href) {
  try {
    const url = new URL(href || location.href, location.origin);
    const m = (url.pathname || '').match(/\/page\/(\d+)\/?$/);
    const p1 = m ? parseInt(m[1], 10) : 0;
    const p2 = parseInt(url.searchParams.get('paged') || url.searchParams.get('page') || '0', 10);
    return Math.max(p1, p2, 1) || 1;
  } catch (_) {
    return 1;
  }
}
function exclusive(acat, q) {
  const qq = (q || '').trim();
  return qq ? {
    acat: '',
    q: qq
  } : {
    acat: acat || '',
    q: ''
  };
}
function findSearchField(root) {
  return root.querySelector('[data-analizy-search] input[name="q"], #price__form input[name="q"]');
}
function getConfig(controller) {
  const el = controller?.root || document.querySelector('[data-analizy-root]');
  const data = el?.dataset || {};
  const base = data.root && data.root !== '' ? data.root : location.pathname + location.search;
  const pretty = data.pretty === '1' || data.pretty === 'true' || !location.search && !location.pathname.includes('index.php');
  const hasTax = data.hasTax === '1' || data.hasTax === 'true';
  const isArchive = document.body.classList.contains('post-type-archive') || !!document.querySelector('[data-analizy-root][data-root]');
  const paramName = isArchive ? 'paged' : 'page';
  return {
    base,
    pretty,
    paramName,
    hasTax
  };
}
function buildUrl(base, page, acat, q, cfg) {
  let u;
  try {
    u = new URL(base, location.origin);
  } catch {
    u = new URL(location.href);
  }
  u.pathname = u.pathname.replace(/\/page\/\d+\/?$/, '/');
  if (cfg.pretty) {
    if (page > 1) {
      const p = u.pathname.endsWith('/') ? u.pathname : u.pathname + '/';
      u.pathname = p + 'page/' + page + '/';
    }
    u.searchParams.delete('page');
    u.searchParams.delete('paged');
  } else {
    const key = cfg.paramName || 'page';
    if (page > 1) u.searchParams.set(key, String(page));else u.searchParams.delete(key);
    u.searchParams.delete(key === 'page' ? 'paged' : 'page');
  }
  const qq = (q || '').trim();
  if (qq) {
    u.searchParams.set('q', qq);
    u.searchParams.delete('acat');
  } else {
    u.searchParams.delete('q');
    if (cfg.hasTax && typeof acat === 'string' && acat) u.searchParams.set('acat', acat);else u.searchParams.delete('acat');
  }
  return u.toString();
}
function initPagination(controller) {
  const {
    root,
    go,
    state
  } = controller;
  const cfg = getConfig(controller);
  (0,_utils__WEBPACK_IMPORTED_MODULE_0__.on)(root, 'click', e => {
    const pagA = e.target.closest('[data-analizy-pagination] a, .analizy__pagination a');
    if (pagA) {
      e.preventDefault();
      const href = pagA.getAttribute('href') || '';
      const page = getPageFromUrl(href);
      let q = '',
        acatParam = '';
      try {
        const url = new URL(href, location.origin);
        q = (url.searchParams.get('q') || '').trim();
        acatParam = url.searchParams.get('acat') || '';
      } catch {}
      const ex = exclusive(acatParam || state.acat, q);
      if (!cfg.hasTax) ex.acat = '';
      const target = buildUrl(cfg.base, page || 1, ex.acat, ex.q, cfg);
      go(page, ex.acat, ex.q, 'replace', false);
      history.pushState({}, '', target);
      return;
    }
    const more = e.target.closest('[data-more]');
    if (more) {
      e.preventDefault();
      const ex = exclusive(state.acat, state.q);
      if (!cfg.hasTax) ex.acat = '';
      const nextPage = (state.page || 1) + 1;
      const target = buildUrl(cfg.base, nextPage, ex.acat, ex.q, cfg);
      go(nextPage, ex.acat, ex.q, 'append', false);
      history.pushState({}, '', target);
      return;
    }
    const filterBtn = e.target.closest('.aside__filter--ajax');
    if (filterBtn) {
      e.preventDefault();
      if (!cfg.hasTax) return;
      const slugAttr = filterBtn.getAttribute('data-term-slug');
      const isAll = !slugAttr || slugAttr.trim() === '';
      const slug = isAll ? '' : slugAttr.trim();
      const target = buildUrl(cfg.base, 1, slug, '', cfg);
      go(1, slug, '', 'replace', false);
      history.pushState({}, '', target);
    }
  });
}
function initSearch(controller) {
  const {
    root,
    go
  } = controller;
  const delay = typeof controller.searchDelay === 'number' ? controller.searchDelay : 600;
  const cfg = getConfig(controller);
  const sf = controller.getSearchField && controller.getSearchField() || findSearchField(root);
  let searchTimer = null;
  let lastQuery = controller.state && controller.state.q || '';
  if (sf) {
    (0,_utils__WEBPACK_IMPORTED_MODULE_0__.on)(sf, 'input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        const q = (sf.value || '').trim();
        if (q === lastQuery) return;
        lastQuery = q;
        const target = buildUrl(cfg.base, 1, '', q, cfg);
        go(1, '', q, 'replace', false);
        history.pushState({}, '', target);
      }, delay);
    });
  }
  const form = root.querySelector('[data-analizy-search]') || document.getElementById('price__form');
  if (form) {
    (0,_utils__WEBPACK_IMPORTED_MODULE_0__.on)(form, 'submit', e => {
      e.preventDefault();
      clearTimeout(searchTimer);
      const q = sf ? (sf.value || '').trim() : '';
      lastQuery = q;
      const target = buildUrl(cfg.base, 1, '', q, cfg);
      go(1, '', q, 'replace', false);
      history.pushState({}, '', target);
    });
  }
  (0,_utils__WEBPACK_IMPORTED_MODULE_0__.on)(window, 'popstate', () => {
    const page = getPageFromUrl(location.href);
    let q = '',
      acat = '';
    try {
      const sp = new URLSearchParams(location.search);
      q = (sp.get('q') || '').trim();
      acat = sp.get('acat') || '';
    } catch {}
    const ex = exclusive(acat, q);
    if (!cfg.hasTax) ex.acat = '';
    if (controller.setSearchField) controller.setSearchField(ex.q);else {
      const fld = sf || findSearchField(root);
      if (fld) fld.value = ex.q || '';
    }
    go(page, ex.acat, ex.q, 'replace', false);
  });
}

/***/ }),

/***/ "./src/blocks/price/features/stickyAside.js":
/*!**************************************************!*\
  !*** ./src/blocks/price/features/stickyAside.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initStickyAside: () => (/* binding */ initStickyAside)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config */ "./src/blocks/price/config.js");

function initStickyAside(controller) {
  const root = controller.root;
  const priceAside = root.querySelector('.price__aside');
  const header = document.querySelector('.header') || document.querySelector('header');
  if (!priceAside) return;
  const ICON_SPRITE = '/wp-content/themes/ensuria/assets/img/path-icon.svg';
  const mqlMobile = window.matchMedia('(max-width: 1023.98px)');
  let isFixed = false;
  let animating = false;
  let ticking = false;
  let headerH = 0;
  let blockTopDoc = 0;
  const DUR = 320;
  let fsWrap = null,
    fsBtn = null,
    fsUse = null,
    fsPanel = null,
    fsForm = null,
    fsInput = null;
  let fsOpen = false;
  function computeMetrics() {
    headerH = header ? header.offsetHeight : 0;
    const r = root.getBoundingClientRect();
    blockTopDoc = r.top + window.scrollY;
  }
  function ensureFixedSearchUI() {
    if (fsWrap) return;
    fsWrap = document.createElement('div');
    fsWrap.className = 'price-fixed-search';
    fsWrap.setAttribute('data-fixed-search', '');
    fsBtn = document.createElement('button');
    fsBtn.type = 'button';
    fsBtn.className = 'price-fixed-search__btn';
    fsBtn.setAttribute('aria-label', 'Пошук');
    fsBtn.setAttribute('aria-expanded', 'false');
    fsBtn.innerHTML = `<span class="icon-wrapper"><svg role="presentation" focusable="false"><use xlink:href="${ICON_SPRITE}#icon-search"></use></svg></span>`;
    fsUse = fsBtn.querySelector('use');
    fsPanel = document.createElement('div');
    fsPanel.className = 'price-fixed-search__panel';
    fsPanel.setAttribute('data-fixed-search-panel', '');
    fsForm = document.createElement('form');
    fsForm.className = 'price-fixed-search__form';
    fsForm.setAttribute('role', 'search');
    fsInput = document.createElement('input');
    fsInput.type = 'search';
    fsInput.name = 'q';
    fsInput.className = 'price-fixed-search__input';
    fsInput.placeholder = 'Почніть вводити для пошуку';
    fsInput.autocomplete = 'off';
    fsForm.appendChild(fsInput);
    fsPanel.appendChild(fsForm);
    fsWrap.appendChild(fsBtn);
    fsWrap.appendChild(fsPanel);
    priceAside.insertBefore(fsWrap, priceAside.firstChild);
    fsBtn.addEventListener('click', () => fsOpen ? closeFS() : openFS());
    fsForm.addEventListener('submit', e => {
      e.preventDefault();
      const val = (fsInput.value || '').trim();
      controller.setSearchField(val);
      controller.go(1, '', val, 'replace', true);
    });
    if (controller.searchDelay > 0) {
      let t = null;
      fsInput.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          const val = (fsInput.value || '').trim();
          controller.setSearchField(val);
          controller.go(1, '', val, 'replace', true);
        }, controller.searchDelay);
      });
    }
    updateFSIcon();
  }
  function destroyFixedSearchUI() {
    if (!fsWrap) return;
    fsWrap.remove();
    fsWrap = fsBtn = fsUse = fsPanel = fsForm = fsInput = null;
    fsOpen = false;
  }
  function openFS() {
    fsOpen = true;
    if (fsBtn) fsBtn.setAttribute('aria-expanded', 'true');
    if (fsWrap) fsWrap.classList.add('is-open');
    updateFSIcon();
    setTimeout(() => {
      if (fsInput) fsInput.focus();
    }, DUR + 20);
  }
  function closeFS() {
    fsOpen = false;
    if (fsBtn) fsBtn.setAttribute('aria-expanded', 'false');
    if (fsWrap) fsWrap.classList.remove('is-open');
    updateFSIcon();
  }
  function updateFSIcon() {
    if (!fsUse) return;
    const href = `${ICON_SPRITE}${fsOpen ? '#icon-close' : '#icon-search'}`;
    fsUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
    if (fsBtn) fsBtn.setAttribute('aria-label', fsOpen ? 'Закрити пошук' : 'Пошук');
  }
  function applyFixedStyles() {
    priceAside.style.position = 'fixed';
    priceAside.style.top = headerH + 'px';
    priceAside.style.width = 'calc(100% - clamp(1rem, 16px + 30.08 * (min(100vw, 1440px) - 375px) / 1065, 2.88rem) * 2)';
    priceAside.classList.add('is-fixed');
    ensureFixedSearchUI();
  }
  function clearFixedStyles() {
    priceAside.classList.remove('is-fixed');
    priceAside.style.position = '';
    priceAside.style.top = '';
    priceAside.style.width = '100%';
  }
  function fadeOutIn(cbMid) {
    animating = true;
    priceAside.style.transition = `opacity ${DUR}ms ${_config__WEBPACK_IMPORTED_MODULE_0__.EASING}`;
    priceAside.style.opacity = '0';
    setTimeout(() => {
      if (cbMid) cbMid();
      requestAnimationFrame(() => {
        priceAside.style.opacity = '1';
        const onEnd = e => {
          if (e.propertyName !== 'opacity') return;
          priceAside.removeEventListener('transitionend', onEnd);
          priceAside.style.transition = '';
          animating = false;
        };
        priceAside.addEventListener('transitionend', onEnd);
      });
    }, Math.max(1, Math.floor(DUR * 0.45)));
  }
  function fixWithFade() {
    if (isFixed || animating) return;
    fadeOutIn(() => {
      applyFixedStyles();
      isFixed = true;
    });
  }
  function unfixWithFade() {
    if (!isFixed || animating) return;
    destroyFixedSearchUI();
    fadeOutIn(() => {
      clearFixedStyles();
      isFixed = false;
    });
  }
  function apply() {
    if (animating) return;
    if (!mqlMobile.matches) {
      if (isFixed) unfixWithFade();
      return;
    }
    computeMetrics();
    const viewportTop = window.scrollY + headerH;
    const anchor = blockTopDoc;
    if (!isFixed) {
      if (viewportTop >= anchor) fixWithFade();
    } else {
      if (viewportTop < anchor) unfixWithFade();
    }
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      apply();
      ticking = false;
    });
  }
  function onResize() {
    if (animating) return;
    computeMetrics();
    apply();
  }
  priceAside.style.opacity = '1';
  computeMetrics();
  apply();
  window.addEventListener('scroll', onScroll, {
    passive: true
  });
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  root.addEventListener('filters:toggle', onResize);
}

/***/ }),

/***/ "./src/blocks/price/init.js":
/*!**********************************!*\
  !*** ./src/blocks/price/init.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initPriceBlock: () => (/* binding */ initPriceBlock)
/* harmony export */ });
/* harmony import */ var _core_controller__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/controller */ "./src/blocks/price/core/controller.js");
/* harmony import */ var _features_filtersModal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./features/filtersModal */ "./src/blocks/price/features/filtersModal.js");
/* harmony import */ var _features_paginationSearch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./features/paginationSearch */ "./src/blocks/price/features/paginationSearch.js");
/* harmony import */ var _features_stickyAside__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./features/stickyAside */ "./src/blocks/price/features/stickyAside.js");
// init.js




function initPriceBlock(root) {
  const c = (0,_core_controller__WEBPACK_IMPORTED_MODULE_0__.createController)(root);
  c.setActiveFilterOnInit();
  (0,_features_filtersModal__WEBPACK_IMPORTED_MODULE_1__.initFilters)(c);
  (0,_features_filtersModal__WEBPACK_IMPORTED_MODULE_1__.initFiltersModal)(c);
  (0,_features_paginationSearch__WEBPACK_IMPORTED_MODULE_2__.initPagination)(c);
  (0,_features_paginationSearch__WEBPACK_IMPORTED_MODULE_2__.initSearch)(c);
  (0,_features_stickyAside__WEBPACK_IMPORTED_MODULE_3__.initStickyAside)(c);
}

/***/ }),

/***/ "./src/blocks/price/script.js":
/*!************************************!*\
  !*** ./src/blocks/price/script.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.scss */ "./src/blocks/price/style.scss");
/* harmony import */ var _init__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./init */ "./src/blocks/price/init.js");


document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-analizy-root]').forEach(root => {
    (0,_init__WEBPACK_IMPORTED_MODULE_1__.initPriceBlock)(root);
  });
});

/***/ }),

/***/ "./src/blocks/price/style.scss":
/*!*************************************!*\
  !*** ./src/blocks/price/style.scss ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/blocks/price/utils.js":
/*!***********************************!*\
  !*** ./src/blocks/price/utils.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   closeAllParentsExcept: () => (/* binding */ closeAllParentsExcept),
/* harmony export */   durationFor: () => (/* binding */ durationFor),
/* harmony export */   on: () => (/* binding */ on),
/* harmony export */   qs: () => (/* binding */ qs),
/* harmony export */   qsa: () => (/* binding */ qsa),
/* harmony export */   slideClose: () => (/* binding */ slideClose),
/* harmony export */   slideOpen: () => (/* binding */ slideOpen)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ "./src/blocks/price/config.js");

const qs = (el, sel) => (el || document).querySelector(sel);
const qsa = (el, sel) => Array.prototype.slice.call((el || document).querySelectorAll(sel));
const on = (el, type, handler, opts) => el && el.addEventListener(type, handler, opts);
function durationFor(heightPx) {
  let ms = heightPx / _config__WEBPACK_IMPORTED_MODULE_0__.PX_PER_SECOND * 1000;
  if (ms < _config__WEBPACK_IMPORTED_MODULE_0__.MIN_DUR) ms = _config__WEBPACK_IMPORTED_MODULE_0__.MIN_DUR;
  if (ms > _config__WEBPACK_IMPORTED_MODULE_0__.MAX_DUR) ms = _config__WEBPACK_IMPORTED_MODULE_0__.MAX_DUR;
  return ms;
}
function setTransition(el, ms) {
  el.style.transitionProperty = 'height';
  el.style.transitionTimingFunction = _config__WEBPACK_IMPORTED_MODULE_0__.EASING;
  el.style.transitionDuration = ms + 'ms';
}
function clearTransition(el) {
  el.style.transitionProperty = '';
  el.style.transitionTimingFunction = '';
  el.style.transitionDuration = '';
}
function slideOpen(wrap) {
  const inner = qs(wrap, '.aside__filter__inner');
  if (!inner || inner.getAttribute('data-animating') === '1') return;
  if (_config__WEBPACK_IMPORTED_MODULE_0__.PREF_REDUCED) {
    wrap.classList.add('open');
    inner.style.height = 'auto';
    inner.style.display = 'flex';
    inner.style.flexDirection = 'column';
    return;
  }
  inner.setAttribute('data-animating', '1');
  const startH = inner.offsetHeight;
  inner.style.display = 'flex';
  inner.style.flexDirection = 'column';
  inner.style.height = startH + 'px';
  void inner.offsetHeight;
  const targetH = inner.scrollHeight;
  setTransition(inner, durationFor(targetH));
  inner.style.height = targetH + 'px';
  wrap.classList.add('open');
  const onEnd = e => {
    if (e.propertyName !== 'height') return;
    inner.removeEventListener('transitionend', onEnd);
    clearTransition(inner);
    inner.style.height = 'auto';
    inner.setAttribute('data-animating', '0');
  };
  inner.addEventListener('transitionend', onEnd);
}
function slideClose(wrap) {
  const inner = qs(wrap, '.aside__filter__inner');
  if (!inner || inner.getAttribute('data-animating') === '1') return;
  if (_config__WEBPACK_IMPORTED_MODULE_0__.PREF_REDUCED) {
    wrap.classList.remove('open');
    inner.style.height = '0px';
    inner.style.display = 'flex';
    inner.style.flexDirection = 'column';
    return;
  }
  inner.setAttribute('data-animating', '1');
  const currentH = inner.scrollHeight;
  inner.style.height = currentH + 'px';
  void inner.offsetHeight;
  setTransition(inner, durationFor(currentH));
  inner.style.height = '0px';
  wrap.classList.remove('open');
  const onEnd = e => {
    if (e.propertyName !== 'height') return;
    inner.removeEventListener('transitionend', onEnd);
    clearTransition(inner);
    inner.setAttribute('data-animating', '0');
  };
  inner.addEventListener('transitionend', onEnd);
}
function closeAllParentsExcept(container, exceptWrap) {
  qsa(container, '.aside__filter__wrapper.has-children.open').forEach(w => {
    if (!exceptWrap || w !== exceptWrap) slideClose(w);
  });
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"blocks/price/script": 0,
/******/ 			"blocks/price/style-script": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = globalThis["webpackChunkstarter_kit_lite"] = globalThis["webpackChunkstarter_kit_lite"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["blocks/price/style-script"], () => (__webpack_require__("./src/blocks/price/script.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=script.js.map