export function initAnalizyCore( root ) {
	if ( ! root ) return { state: null, go: () => {}, searchForm: null };

	const rowsWrap =
		root.querySelector( '[data-rows]' ) ||
		root.querySelector( '.price__text-inner [data-rows]' );
	const pagWrapInit =
		root.querySelector( '[data-analizy-pagination]' ) ||
		root.querySelector( '.analizy__pagination' );
	const searchForm =
		root.querySelector( '[data-analizy-search]' ) ||
		document.getElementById( 'price__form' );
	const filtersHost = root.querySelector( '[data-analizy-filters]' );
	const priceList = root.querySelector( '.price__list' ) || root;
	const loader = document.querySelector( '.loader-wrapper' );
	if ( loader ) loader.style.display = 'none';

	const postId = parseInt( root.getAttribute( 'data-post-id' ) || '0', 10 );
	const ppp = parseInt( root.getAttribute( 'data-ppp' ) || '15', 10 );
	const searchDelay = parseInt(
		root.getAttribute( 'data-search-delay' ) || '600',
		10
	);

	const titleEl = document.querySelector( '.price__title' );
	const defaultTitle = titleEl
		? titleEl.getAttribute( 'data-title' ) || titleEl.textContent || ''
		: '';

	const AJAX_GLOBAL =
		typeof window.appAjax !== 'undefined' ? window.appAjax : {};
	const AJAX_URL = AJAX_GLOBAL.url || '/wp-admin/admin-ajax.php';
	const AJAX_NONCE =
		( AJAX_GLOBAL.nonces &&
			( AJAX_GLOBAL.nonces.price || AJAX_GLOBAL.nonces[ 'price' ] ) ) ||
		'';

	function getParam( name ) {
		return new URLSearchParams( location.search ).get( name );
	}
	function getPageFromPath( path ) {
		const m = path.match( /\/page\/(\d+)\/?$/ );
		return m ? Math.max( 1, parseInt( m[ 1 ], 10 ) ) : 1;
	}
	function currentQuery() {
		const q1 = searchForm && searchForm.querySelector( '[name="q"]' );
		const q2 =
			searchForm &&
			searchForm.querySelector( '[name="aside__form-input"]' );
		const v = ( q1 && q1.value ) || ( q2 && q2.value ) || '';
		return ( v || '' ).trim();
	}
	function setSearchField( val ) {
		const q1 = searchForm && searchForm.querySelector( '[name="q"]' );
		const q2 =
			searchForm &&
			searchForm.querySelector( '[name="aside__form-input"]' );
		if ( q1 ) q1.value = val || '';
		if ( q2 ) q2.value = val || '';
	}
	function enforceExclusive( acat, q ) {
		const qq = ( q || '' ).trim();
		if ( qq ) return { acat: '', q: qq };
		return { acat: acat || '', q: '' };
	}
	function numOrEmpty( v ) {
		const n = parseInt( v, 10 );
		return isFinite( n ) && n >= 0 ? String( n ) : '';
	}

	function getPriceInputs() {
		const minEl =
			root.querySelector( '[data-price-min]' ) ||
			root.querySelector( 'input[name="pmin"]' ) ||
			root.querySelector( 'input[name="price_min"]' );
		const maxEl =
			root.querySelector( '[data-price-max]' ) ||
			root.querySelector( 'input[name="pmax"]' ) ||
			root.querySelector( 'input[name="price_max"]' );
		return { minEl, maxEl };
	}
	function readPriceState() {
		const { minEl, maxEl } = getPriceInputs();
		const pmin = minEl ? numOrEmpty( minEl.value ) : '';
		const pmax = maxEl ? numOrEmpty( maxEl.value ) : '';
		return { pmin, pmax };
	}
	function writePriceInputs( pmin, pmax ) {
		const { minEl, maxEl } = getPriceInputs();
		if ( minEl ) minEl.value = pmin || '';
		if ( maxEl ) maxEl.value = pmax || '';
	}

	let initialAcat = getParam( 'acat' ) || '';
	let initialQ = getParam( 'q' ) || currentQuery();
	const initialPmin = numOrEmpty(
		getParam( 'pmin' ) || getParam( 'price_min' ) || ''
	);
	const initialPmax = numOrEmpty(
		getParam( 'pmax' ) || getParam( 'price_max' ) || ''
	);
	const exclusive = enforceExclusive( initialAcat, initialQ );

	let state = {
		acat: exclusive.acat,
		q: exclusive.q,
		page: getPageFromPath( location.pathname ),
		pmin: initialPmin,
		pmax: initialPmax,
	};
	writePriceInputs( state.pmin, state.pmax );

	let pagWrap = pagWrapInit;
	function ensurePagWrap() {
		if ( pagWrap && pagWrap.parentNode ) return pagWrap;
		const el = document.createElement( 'div' );
		el.className = 'analizy__pagination';
		el.setAttribute( 'data-analizy-pagination', '' );
		priceList.appendChild( el );
		pagWrap = el;
		return pagWrap;
	}

	let pending = 0;
	function showLoader() {
		pending++;
		if ( loader ) loader.style.display = '';
	}
	function hideLoader() {
		pending = Math.max( 0, pending - 1 );
		if ( pending === 0 && loader ) loader.style.display = 'none';
	}

	function fetchPage( page, acat, q, pmin, pmax ) {
		const ex = enforceExclusive( acat, q );
		const body = new URLSearchParams();
		body.set( 'action', 'get_analizy' );
		body.set( 'nonce', AJAX_NONCE );
		body.set( 'post_id', String( postId ) );
		body.set( 'page', String( page ) );
		body.set( 'ppp', String( ppp ) );
		body.set( 'acat', ex.q ? '' : ex.acat );
		body.set( 'q', ex.q ? ex.q : '' );
		if ( pmin ) {
			body.set( 'pmin', pmin );
			body.set( 'price_min', pmin );
		}
		if ( pmax ) {
			body.set( 'pmax', pmax );
			body.set( 'price_max', pmax );
		}
		showLoader();
		return fetch( AJAX_URL, {
			method: 'POST',
			headers: {
				'Content-Type':
					'application/x-www-form-urlencoded; charset=UTF-8',
			},
			body,
		} )
			.then( ( r ) => r.json() )
			.finally( hideLoader );
	}

	function syncMoreFromResponse( d ) {
		const existing = root.querySelector( '[data-more]' );
		if ( existing ) existing.remove();
		if ( typeof d.more === 'string' && d.more.trim() !== '' ) {
			const tmp = document.createElement( 'div' );
			tmp.innerHTML = d.more;
			const btn = tmp.querySelector( '[data-more]' );
			if ( btn ) {
				if ( pagWrap && pagWrap.parentNode )
					pagWrap.parentNode.insertBefore( btn, pagWrap );
				else priceList.appendChild( btn );
			}
			return;
		}
		if ( typeof d.has_more !== 'undefined' && d.has_more ) {
			const btn = document.createElement( 'button' );
			btn.type = 'button';
			btn.className =
				'btn btn--middle btn--blue-sky price__button load-more';
			btn.setAttribute( 'data-more', '' );
			btn.setAttribute( 'aria-label', 'Завантажити ще' );
			btn.textContent = 'Завантажити ще';
			if ( pagWrap && pagWrap.parentNode )
				pagWrap.parentNode.insertBefore( btn, pagWrap );
			else priceList.appendChild( btn );
		}
	}

	function replaceContent( d ) {
		if ( rowsWrap ) rowsWrap.innerHTML = d.rows || '';
		if ( typeof d.pagination !== 'undefined' ) {
			if ( d.pagination ) {
				const target = ensurePagWrap();
				target.innerHTML = d.pagination;
			} else if ( pagWrap ) {
				pagWrap.innerHTML = '';
			}
		}
		syncMoreFromResponse( d );
	}

	function appendContent( d ) {
		if ( rowsWrap ) {
			const tmp = document.createElement( 'div' );
			tmp.innerHTML = d.rows || '';
			Array.prototype.forEach.call( tmp.childNodes, function ( n ) {
				rowsWrap.appendChild( n );
			} );
		}
		if ( typeof d.pagination !== 'undefined' && d.pagination ) {
			const target = ensurePagWrap();
			target.innerHTML = d.pagination;
		}
		syncMoreFromResponse( d );
	}

	function pushExclusiveUrl( resolvedUrl, page, acat, q, pmin, pmax ) {
		try {
			const u = new URL( resolvedUrl || location.href, location.origin );
			if ( q && q.trim() !== '' ) {
				u.searchParams.set( 'q', q );
				u.searchParams.delete( 'acat' );
			} else if ( acat ) {
				u.searchParams.set( 'acat', acat );
				u.searchParams.delete( 'q' );
			} else {
				u.searchParams.delete( 'q' );
				u.searchParams.delete( 'acat' );
			}
			if ( pmin ) u.searchParams.set( 'pmin', pmin );
			else u.searchParams.delete( 'pmin' );
			if ( pmax ) u.searchParams.set( 'pmax', pmax );
			else u.searchParams.delete( 'pmax' );
			history.pushState(
				{
					page: page,
					acat: acat || '',
					q: q || '',
					pmin: pmin || '',
					pmax: pmax || '',
				},
				'',
				u.toString()
			);
		} catch ( e ) {}
	}

	function updateTitle() {
		if ( ! titleEl ) return;
		if ( state.q ) {
			titleEl.textContent = state.q;
			return;
		}
		if ( state.acat ) {
			const btn =
				filtersHost &&
				filtersHost.querySelector(
					'.aside__filter--ajax[data-term-slug="' + state.acat + '"]'
				);
			const name = btn
				? btn.getAttribute( 'data-term-name' ) ||
				  btn.textContent ||
				  state.acat
				: state.acat;
			titleEl.textContent = ( name || '' ).trim();
			return;
		}
		titleEl.textContent = defaultTitle;
	}

	let reqCounter = 0;
	let lastApplied = 0;

	function go( page, acat, q, mode = 'replace', push = true ) {
		const ex = enforceExclusive( acat, q );
		const seq = ++reqCounter;
		return fetchPage( page, ex.acat, ex.q, state.pmin, state.pmax )
			.then( function ( res ) {
				if ( ! res || ! res.success )
					throw new Error(
						( res && res.data && res.data.message ) || 'ajax error'
					);
				if ( seq < lastApplied ) return;
				if ( mode === 'append' ) appendContent( res.data );
				else replaceContent( res.data );
				lastApplied = seq;
				state.page = res.data.current;
				state.acat = ex.acat || '';
				state.q = ex.q || '';
				if ( push )
					pushExclusiveUrl(
						res.data && res.data.url ? res.data.url : location.href,
						state.page,
						state.acat,
						state.q,
						state.pmin,
						state.pmax
					);
				updateTitle();
				document.dispatchEvent(
					new CustomEvent( 'analizy:state-changed' )
				);
			} )
			.catch( function () {} );
	}

	let searchTimer = null;
	let lastQuery = state.q || '';
	if ( searchForm ) {
		const sf =
			searchForm.querySelector( '[name="q"]' ) ||
			searchForm.querySelector( '[name="aside__form-input"]' );
		if ( sf ) {
			sf.addEventListener( 'input', function () {
				clearTimeout( searchTimer );
				searchTimer = setTimeout( function () {
					const q = currentQuery();
					if ( q === lastQuery ) return;
					lastQuery = q;
					go( 1, '', q, 'replace', true );
				}, searchDelay );
			} );
		}
		searchForm.addEventListener( 'submit', function ( e ) {
			e.preventDefault();
			clearTimeout( searchTimer );
			const q = currentQuery();
			lastQuery = q;
			go( 1, '', q, 'replace', true );
		} );
	}

	if ( pagWrap ) {
		pagWrap.addEventListener( 'click', function ( e ) {
			const a = e.target.closest( 'a' );
			if ( ! a ) return;
			e.preventDefault();
			const href = a.getAttribute( 'href' ) || '';
			const parser = document.createElement( 'a' );
			parser.href = href;
			const pathname = parser.pathname || href;
			const page = getPageFromPath( pathname );
			const params = new URLSearchParams( parser.search || '' );
			const q = ( params.get( 'q' ) || '' ).trim();
			const slug = q ? '' : params.get( 'acat' ) || state.acat;
			const pmin = numOrEmpty( params.get( 'pmin' ) || '' );
			const pmax = numOrEmpty( params.get( 'pmax' ) || '' );
			if ( pmin !== state.pmin || pmax !== state.pmax ) {
				state.pmin = pmin;
				state.pmax = pmax;
				writePriceInputs( state.pmin, state.pmax );
			}
			go( page, slug, q, 'replace', true );
		} );
	}

	root.addEventListener( 'click', function ( e ) {
		const a = e.target.closest( '[data-analizy-pagination] a' );
		if ( a ) {
			e.preventDefault();
			const href = a.getAttribute( 'href' ) || '';
			const parser = document.createElement( 'a' );
			parser.href = href;
			const pathname = parser.pathname || href;
			const page = getPageFromPath( pathname );
			const params = new URLSearchParams( parser.search || '' );
			const q = ( params.get( 'q' ) || '' ).trim();
			const slug = q ? '' : params.get( 'acat' ) || state.acat;
			const pmin = numOrEmpty( params.get( 'pmin' ) || '' );
			const pmax = numOrEmpty( params.get( 'pmax' ) || '' );
			if ( pmin !== state.pmin || pmax !== state.pmax ) {
				state.pmin = pmin;
				state.pmax = pmax;
				writePriceInputs( state.pmin, state.pmax );
			}
			go( page, slug, q, 'replace', true );
			return;
		}
		const more = e.target.closest( '[data-more]' );
		if ( more ) {
			e.preventDefault();
			const ex = enforceExclusive( state.acat, state.q );
			go( state.page + 1, ex.acat, ex.q, 'append', true );
			return;
		}
	} );

	let priceTimer = null;
	function bindPriceInputs() {
		const { minEl, maxEl } = getPriceInputs();
		const handler = function () {
			clearTimeout( priceTimer );
			priceTimer = setTimeout( function () {
				const { pmin, pmax } = readPriceState();
				if ( pmin === state.pmin && pmax === state.pmax ) return;
				state.pmin = pmin;
				state.pmax = pmax;
				go( 1, state.acat, state.q, 'replace', true );
			}, searchDelay );
		};
		if ( minEl ) {
			minEl.addEventListener( 'input', handler );
			minEl.addEventListener( 'change', handler );
		}
		if ( maxEl ) {
			maxEl.addEventListener( 'input', handler );
			maxEl.addEventListener( 'change', handler );
		}
	}
	bindPriceInputs();

	window.addEventListener( 'popstate', function () {
		const page = getPageFromPath( location.pathname );
		const slug = getParam( 'acat' ) || '';
		const q = getParam( 'q' ) || '';
		const ex = enforceExclusive( slug, q );
		const pmin = numOrEmpty( getParam( 'pmin' ) || '' );
		const pmax = numOrEmpty( getParam( 'pmax' ) || '' );
		setSearchField( ex.q );
		lastQuery = ex.q;
		state.pmin = pmin;
		state.pmax = pmax;
		writePriceInputs( state.pmin, state.pmax );
		go( page, ex.acat, ex.q, 'replace', false );
	} );

	function initTitle() {
		if ( state.q ) setSearchField( state.q );
		else if ( ! state.acat ) setSearchField( '' );
		updateTitle();
	}
	initTitle();

	if ( filtersHost ) {
		root.addEventListener( 'click', function ( e ) {
			const scope = e.target.closest( '[data-analizy-filters]' );
			if ( ! scope ) return;
			const parentBtn = e.target.closest(
				'.aside__filter-btn:not(.aside__filter--ajax)'
			);
			if ( parentBtn && scope.contains( parentBtn ) ) {
				e.preventDefault();
				const wrap = parentBtn.closest(
					'.aside__filter__wrapper.has-children'
				);
				if ( wrap ) {
					const openWraps = scope.querySelectorAll(
						'.aside__filter__wrapper.has-children.open'
					);
					openWraps.forEach( ( w ) => {
						if ( w !== wrap ) w.classList.remove( 'open' );
					} );
					wrap.classList.toggle( 'open' );
					parentBtn.setAttribute(
						'aria-expanded',
						wrap.classList.contains( 'open' ) ? 'true' : 'false'
					);
				}
				return;
			}
			const termBtn = e.target.closest(
				'.aside__filter--ajax[data-term-slug]'
			);
			if ( termBtn && scope.contains( termBtn ) ) {
				e.preventDefault();
				const slug = termBtn.getAttribute( 'data-term-slug' ) || '';
				if ( searchForm ) {
					const q1 = searchForm.querySelector( '[name="q"]' );
					const q2 = searchForm.querySelector(
						'[name="aside__form-input"]'
					);
					if ( q1 ) q1.value = '';
					if ( q2 ) q2.value = '';
				}
				go( 1, slug, '', 'replace', true );
			}
		} );
	}

	const mql = window.matchMedia( '(max-width: 1023px)' );
	if ( mql.matches && filtersHost && filtersHost.parentNode ) {
		filtersHost.parentNode.removeChild( filtersHost );
	}

	return { state, go, searchForm };
}
