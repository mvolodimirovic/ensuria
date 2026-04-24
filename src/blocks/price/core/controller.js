import { qs, qsa } from '../utils';

function createController( rootEl ) {
	const root = rootEl;

	const rowsWrap =
		qs( root, '[data-rows]' ) ||
		qs( root, '.price__text-inner [data-rows]' );
	let pagWrap =
		qs( root, '[data-analizy-pagination]' ) ||
		qs( root, '.analizy__pagination' );
	const filters = qs( root, '[data-analizy-filters]' );
	const searchForm =
		qs( root, '[data-analizy-search]' ) ||
		document.getElementById( 'price__form' );
	const priceList = qs( root, '.price__list' ) || root;

	const loader = qs( root, '.loader-wrapper' );
	if ( loader ) loader.style.display = 'none';

	const postId = parseInt( root.getAttribute( 'data-post-id' ) || '0', 10 );
	const ppp = parseInt( root.getAttribute( 'data-ppp' ) || '15', 10 );
	const searchDelay = parseInt(
		root.getAttribute( 'data-search-delay' ) || '600',
		10
	);
	const blockId = root.getAttribute( 'data-block-id' ) || '';
	const ptype = root.getAttribute( 'data-ptype' ) || '';
	const taxName = root.getAttribute( 'data-taxonomy' ) || '';

	const titleEl =
		qs( root, '.price__title' ) ||
		document.querySelector( '.price__title' );
	const defaultTitle = titleEl
		? titleEl.getAttribute( 'data-title' ) || titleEl.textContent || ''
		: '';

	const AJAX_GLOBAL =
		typeof window !== 'undefined' && window.appAjax ? window.appAjax : {};
	const AJAX_URL =
		AJAX_GLOBAL.ajaxurl || AJAX_GLOBAL.url || '/wp-admin/admin-ajax.php';
	const AJAX_NONCE =
		( AJAX_GLOBAL.nonces &&
			( AJAX_GLOBAL.nonces.price || AJAX_GLOBAL.nonces[ 'price' ] ) ) ||
		AJAX_GLOBAL.nonce ||
		'';

	const getParam = ( name ) =>
		new URLSearchParams( location.search ).get( name );
	const getPageFromPath = ( path ) => {
		const m = ( path || '' ).match( /\/page\/(\d+)\/?$/ );
		return m ? Math.max( 1, parseInt( m[ 1 ], 10 ) ) : 1;
	};

	const getSearchField = () =>
		( searchForm &&
			( qs( searchForm, '[name="q"]' ) ||
				qs( searchForm, '[name="aside__form-input"]' ) ) ) ||
		null;

	const currentQuery = () => {
		const q1 = searchForm && qs( searchForm, '[name="q"]' );
		const q2 = searchForm && qs( searchForm, '[name="aside__form-input"]' );
		const v = ( q1 && q1.value ) || ( q2 && q2.value ) || '';
		return ( v || '' ).trim();
	};

	const setSearchField = ( val ) => {
		const q1 = searchForm && qs( searchForm, '[name="q"]' );
		const q2 = searchForm && qs( searchForm, '[name="aside__form-input"]' );
		if ( q1 ) q1.value = val || '';
		if ( q2 ) q2.value = val || '';
	};

	function enforceExclusive( acat, q ) {
		const qq = ( q || '' ).trim();
		return qq ? { acat: '', q: qq } : { acat: acat || '', q: '' };
	}

	function getTermDisplay( slug ) {
		if ( ! slug ) return '';
		const btn = qs(
			root,
			'.aside__filter--ajax[data-term-slug="' + slug + '"]'
		);
		if ( ! btn ) return slug;
		const explicit = ( btn.getAttribute( 'data-term-name' ) || '' ).trim();
		if ( explicit ) return explicit;
		const txt = ( btn.textContent || '' ).trim();
		return txt || slug;
	}

	function updateTitle( nextState ) {
		if ( ! titleEl ) return;
		if ( nextState.q ) {
			titleEl.textContent = nextState.q;
			return;
		}
		if ( nextState.acat ) {
			titleEl.textContent = getTermDisplay( nextState.acat );
			return;
		}
		titleEl.textContent = defaultTitle;
	}

	const initialAcat = getParam( 'acat' ) || '';
	const initialQ = getParam( 'q' ) || currentQuery();
	const exclusive = enforceExclusive( initialAcat, initialQ );
	const state = {
		acat: exclusive.acat,
		q: exclusive.q,
		page: getPageFromPath( location.pathname ) || 1,
	};

	let pending = 0;
	function showLoader() {
		pending++;
		if ( loader ) loader.style.display = '';
	}
	function hideLoader() {
		pending = Math.max( 0, pending - 1 );
		if ( pending === 0 && loader ) loader.style.display = 'none';
	}

	const scrollOffset = parseInt(
		root.getAttribute( 'data-scroll-offset' ) || '0',
		10
	);
	const scrollTarget =
		root.closest && root.closest( '.price' ) ? root.closest( '.price' ) : root;

	function scrollToPriceTop() {
		if ( ! scrollTarget ) return;

		const prefersReduce =
			typeof window !== 'undefined' &&
			window.matchMedia &&
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

		const behavior = prefersReduce ? 'auto' : 'smooth';

		const doScroll = () => {
			const rect = scrollTarget.getBoundingClientRect();
			const top = Math.max(
				0,
				( window.pageYOffset || 0 ) +
					( rect.top || 0 ) -
					Math.max( 0, scrollOffset || 0 )
			);
			try {
				window.scrollTo( { top, behavior } );
			} catch ( _ ) {
				window.scrollTo( 0, top );
			}
		};

		requestAnimationFrame( () => requestAnimationFrame( doScroll ) );
	}

	const skeletonMinMs = parseInt(
		root.getAttribute( 'data-skeleton-min' ) || '180',
		10
	);
	const skeletonMap = new Map();

	function rowsCountFromHTML( html ) {
		const s = ( html || '' ).trim();
		if ( ! s ) return 0;
		const tmp = document.createElement( 'div' );
		tmp.innerHTML = s;
		const byCard = tmp.querySelectorAll
			? tmp.querySelectorAll( '.price__text-wrapp' ).length
			: 0;
		if ( byCard > 0 ) return byCard;
		return tmp.children ? tmp.children.length : 0;
	}

	function skeletonRowInner() {
		return (
			'<div class="price__text__name">' +
				'<span class="price__skeleton-line price__skeleton-line--1"></span>' +
				'<span class="price__skeleton-line price__skeleton-line--2"></span>' +
				'<span class="price__skeleton-line price__skeleton-line--3"></span>' +
			'</div>' +
			'<div class="price__text__cash">' +
				'<span class="price__skeleton-line price__skeleton-line--cash"></span>' +
			'</div>'
		);
	}

	function skeletonRowHTML( seq, isDemo ) {
		if ( isDemo ) {
			return (
				'<div class="price__text-wrapp is-skeleton" data-price-skeleton-demo="1">' +
					skeletonRowInner() +
				'</div>'
			);
		}
		return (
			'<div class="price__text-wrapp is-skeleton" data-price-skeleton="1" data-price-skeleton-seq="' +
				String( seq ) +
			'">' +
				skeletonRowInner() +
			'</div>'
		);
	}

	function skeletonHTML( count, seq, isDemo ) {
		const n = Math.max( 1, parseInt( count || 1, 10 ) );
		let out = '';
		for ( let i = 0; i < n; i++ ) out += skeletonRowHTML( seq, isDemo );
		return out;
	}

	function removeSkeletonNodes( seq ) {
		if ( ! rowsWrap ) return;
		const selector =
			'[data-price-skeleton="1"]' +
			( seq
				? '[data-price-skeleton-seq="' + String( seq ) + '"]'
				: '' );
		Array.from( rowsWrap.querySelectorAll( selector ) ).forEach( ( n ) =>
			n.remove()
		);
	}

	function clearAllSkeleton() {
		if ( rowsWrap ) {
			Array.from(
				rowsWrap.querySelectorAll( '[data-price-skeleton-demo="1"]' )
			).forEach( ( n ) => n.remove() );
		}
		removeSkeletonNodes( 0 );
		if ( rowsWrap ) {
			rowsWrap.removeAttribute( 'aria-busy' );
			rowsWrap.removeAttribute( 'data-price-skeleton-wrap' );
		}
		skeletonMap.clear();
	}

	function startSkeleton( seq, mode, expectedCount ) {
		if ( ! rowsWrap ) return;

		clearAllSkeleton();

		const safeMode = mode === 'append' ? 'append' : 'replace';
		const expected = Math.max( 1, parseInt( expectedCount || ppp || 1, 10 ) );
		const prevHTML = safeMode === 'replace' ? rowsWrap.innerHTML : '';
		const startedAt = Date.now();

		skeletonMap.set( seq, {
			mode: safeMode,
			expected,
			startedAt,
			prevHTML,
		} );

		rowsWrap.setAttribute( 'aria-busy', 'true' );

		if ( safeMode === 'append' ) {
			const tmp = document.createElement( 'div' );
			tmp.innerHTML = skeletonHTML( expected, seq, false );
			const frag = document.createDocumentFragment();
			Array.from( tmp.children ).forEach( ( n ) => frag.appendChild( n ) );
			rowsWrap.appendChild( frag );
			return;
		}

		rowsWrap.setAttribute( 'data-price-skeleton-wrap', '1' );
		rowsWrap.innerHTML = skeletonHTML( expected, seq, false );
	}

	function updateSkeletonCount( seq, newCount ) {
		if ( ! rowsWrap ) return;

		const st = skeletonMap.get( seq );
		if ( ! st ) return;

		const next = Math.max( 1, parseInt( newCount || 1, 10 ) );
		if ( next === st.expected ) return;

		st.expected = next;
		skeletonMap.set( seq, st );

		if ( st.mode === 'append' ) {
			removeSkeletonNodes( seq );
			const tmp = document.createElement( 'div' );
			tmp.innerHTML = skeletonHTML( next, seq, false );
			const frag = document.createDocumentFragment();
			Array.from( tmp.children ).forEach( ( n ) => frag.appendChild( n ) );
			rowsWrap.appendChild( frag );
			return;
		}

		rowsWrap.innerHTML = skeletonHTML( next, seq, false );
	}

	function ensureSkeletonMinTime( seq ) {
		const st = skeletonMap.get( seq );
		if ( ! st ) return Promise.resolve();

		const minMs = Math.max( 0, parseInt( skeletonMinMs || 0, 10 ) );
		if ( ! minMs ) return Promise.resolve();

		const elapsed = Date.now() - st.startedAt;
		const wait = Math.max( 0, minMs - elapsed );
		if ( ! wait ) return Promise.resolve();

		return new Promise( ( resolve ) => setTimeout( resolve, wait ) );
	}

	function finishSkeleton( seq ) {
		const st = skeletonMap.get( seq );
		if ( ! st ) return;

		if ( rowsWrap ) {
			rowsWrap.removeAttribute( 'aria-busy' );
			rowsWrap.removeAttribute( 'data-price-skeleton-wrap' );
		}

		if ( st.mode === 'append' ) removeSkeletonNodes( seq );
		skeletonMap.delete( seq );
	}

	function failSkeleton( seq ) {
		const st = skeletonMap.get( seq );
		if ( ! st ) return;

		if ( rowsWrap ) {
			rowsWrap.removeAttribute( 'aria-busy' );
			rowsWrap.removeAttribute( 'data-price-skeleton-wrap' );
		}

		if ( st.mode === 'append' ) {
			removeSkeletonNodes( seq );
			skeletonMap.delete( seq );
			return;
		}

		if ( rowsWrap ) rowsWrap.innerHTML = st.prevHTML || '';
		skeletonMap.delete( seq );
	}

	function fetchPage( page, acat, q, opts = {} ) {
		const ex = enforceExclusive( acat, q );
		const body = new URLSearchParams();
		const resolvedPage = Math.max( 1, parseInt( page || 1, 10 ) );
		const silent = !! opts.silent;

		body.set( 'action', 'get_price' );
		body.set( 'post_id', String( postId ) );
		body.set( 'block_id', String( blockId ) );
		body.set( 'paged', String( resolvedPage ) );
		body.set( 'ppp', String( ppp ) );
		body.set( 'ptype', ptype );
		body.set( 'taxonomy', taxName || '' );
		body.set( 'acat', ex.q ? '' : ex.acat || '' );
		body.set( 'q', ex.q ? ex.q : '' );
		if ( AJAX_NONCE ) body.set( 'nonce', AJAX_NONCE );

		if ( ! silent ) showLoader();
		return fetch( AJAX_URL, {
			method: 'POST',
			headers: {
				'Content-Type':
					'application/x-www-form-urlencoded; charset=UTF-8',
			},
			credentials: 'same-origin',
			body,
		} )
			.then( ( r ) => {
				if ( ! r.ok ) throw new Error( 'HTTP ' + r.status );
				return r.json();
			} )
			.finally( () => {
				if ( ! silent ) hideLoader();
			} );
	}

	function ensurePagWrap() {
		if ( pagWrap && pagWrap.parentNode ) return pagWrap;
		const el = document.createElement( 'div' );
		el.className = 'analizy__pagination';
		el.setAttribute( 'data-analizy-pagination', '' );
		priceList.appendChild( el );
		pagWrap = el;
		return pagWrap;
	}

	const allLoadedId = 'price-all-loaded';

	function getPaginationNode() {
		const insidePagWrap =
			pagWrap && pagWrap.querySelector ? qs( pagWrap, '.pagination' ) : null;
		return insidePagWrap || qs( root, '.pagination' ) || null;
	}

	function removeAllLoadedNotice() {
		const existing = root.querySelector ? root.querySelector( '#' + allLoadedId ) : null;
		if ( existing ) existing.remove();
	}

	function insertAllLoadedNoticeBeforePagination( html ) {
		const safe = ( html || '' ).trim();
		if ( ! safe ) return;

		removeAllLoadedNotice();

		const tmp = document.createElement( 'div' );
		tmp.innerHTML = safe;
		const node = tmp.firstElementChild;
		if ( ! node ) return;

		const paginationNode = getPaginationNode();
		if ( paginationNode && paginationNode.parentNode ) {
			paginationNode.parentNode.insertBefore( node, paginationNode );
			return;
		}

		if ( pagWrap && pagWrap.parentNode ) {
			pagWrap.parentNode.insertBefore( node, pagWrap );
			return;
		}

		priceList.appendChild( node );
	}

	function isLastPageByDOM() {
		const paginationNode = getPaginationNode();

		if ( ! paginationNode ) return true;

		const hasNext = !! qs( paginationNode, 'a.next.page-numbers' );
		if ( hasNext ) return false;

		const currentEl = qs(
			paginationNode,
			'.page-numbers.current[aria-current="page"]'
		);
		const currentNum = currentEl
			? parseInt( ( currentEl.textContent || '' ).trim(), 10 )
			: NaN;

		let maxNum = 0;
		Array.from( paginationNode.querySelectorAll( 'a.page-numbers' ) ).forEach(
			( a ) => {
				const n = parseInt( ( a.textContent || '' ).trim(), 10 );
				if ( Number.isFinite( n ) ) maxNum = Math.max( maxNum, n );
			}
		);

		if ( Number.isFinite( currentNum ) && maxNum > 0 ) {
			return currentNum >= maxNum;
		}

		if ( maxNum > 0 ) {
			return state.page >= maxNum;
		}

		return true;
	}

	function syncAllLoadedFromResponse( d ) {
		const html =
			d && typeof d.all_loaded_html === 'string' ? d.all_loaded_html : '';
		if ( html && html.trim() !== '' ) {
			insertAllLoadedNoticeBeforePagination( html );
			return;
		}
		removeAllLoadedNotice();
	}

	function ensureAllLoadedOnInit() {
		if ( qs( root, '#' + allLoadedId ) ) return;
		if ( ! isLastPageByDOM() ) return;

		return fetchPage( state.page, state.acat, state.q, { silent: true } )
			.then( ( res ) => {
				if ( ! res || ! res.success || ! res.data ) return;
				syncAllLoadedFromResponse( res.data );
			} )
			.catch( () => {} );
	}

	function syncMoreFromResponse( d ) {
		const existing = qs( root, '[data-more]' );
		if ( existing ) existing.remove();

		const hasMoreFromFlag = !! ( typeof d.has_more !== 'undefined' && d.has_more );
		const hasMoreFromHtml = !! ( typeof d.more === 'string' && d.more.trim() !== '' );

		if ( hasMoreFromHtml ) {
			const tmp = document.createElement( 'div' );
			tmp.innerHTML = d.more;
			const btn = tmp.querySelector( '[data-more]' );
			if ( btn ) {
				pagWrap && pagWrap.parentNode
					? pagWrap.parentNode.insertBefore( btn, pagWrap )
					: priceList.appendChild( btn );
			}
			return;
		}

		if ( hasMoreFromFlag ) {
			const btn2 = document.createElement( 'button' );
			btn2.type = 'button';
			btn2.className =
				'price__button btn btn--middle btn--blue-sky load-more';
			btn2.setAttribute( 'data-more', '' );
			btn2.setAttribute( 'aria-label', 'Завантажити ще' );
			btn2.textContent = 'Завантажити ще';
			pagWrap && pagWrap.parentNode
				? pagWrap.parentNode.insertBefore( btn2, pagWrap )
				: priceList.appendChild( btn2 );
		}
	}

	function replaceContent( d ) {
		if ( rowsWrap ) rowsWrap.innerHTML = d.rows || '';
		if ( typeof d.pagination !== 'undefined' ) {
			if ( d.pagination ) {
				ensurePagWrap().innerHTML = d.pagination;
			} else if ( pagWrap ) {
				pagWrap.innerHTML = '';
			}
		}
		syncMoreFromResponse( d );
		syncAllLoadedFromResponse( d );
	}

	function appendContent( d ) {
		if ( rowsWrap ) {
			const tmp = document.createElement( 'div' );
			tmp.innerHTML = d.rows || '';
			const frag = document.createDocumentFragment();
			Array.from( tmp.children ).forEach( ( n ) => frag.appendChild( n ) );
			rowsWrap.appendChild( frag );
		}
		if ( typeof d.pagination !== 'undefined' && d.pagination ) {
			ensurePagWrap().innerHTML = d.pagination;
		}
		syncMoreFromResponse( d );
		syncAllLoadedFromResponse( d );
	}

	function setActiveFilter( slug ) {
		qsa( root, '[data-term-slug]' ).forEach( ( btn ) => {
			const active =
				( btn.getAttribute( 'data-term-slug' ) || '' ) ===
				( slug || '' );
			btn.classList.toggle( 'is-active', active );
			btn.setAttribute( 'aria-pressed', active ? 'true' : 'false' );
		} );
	}

	function pushUrl( nextUrl, page, acat, q ) {
		try {
			if ( nextUrl ) {
				history.pushState(
					{ page, acat: acat || '', q: q || '' },
					'',
					nextUrl
				);
				return;
			}
			const u = new URL( location.href );
			const basePath = u.pathname.replace( /\/page\/\d+\/?$/, '/' );
			u.pathname =
				page > 1
					? basePath.replace( /\/$/, '' ) + '/page/' + page + '/'
					: basePath;

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

			history.pushState(
				{ page, acat: acat || '', q: q || '' },
				'',
				u.toString()
			);
		} catch ( _ ) {}
	}

	let reqCounter = 0;
	let lastApplied = 0;

	function expectedSkeletonCount( mode ) {
		const base = Math.max( 1, parseInt( ppp || 1, 10 ) );
		if ( mode === 'append' ) return base;
		if ( ! rowsWrap ) return base;
		const curr = rowsWrap.children ? rowsWrap.children.length : 0;
		return Math.max( 1, curr || base );
	}

	function go( page, acat, q, mode = 'replace', push = true ) {
		const ex = enforceExclusive( acat, q );
		const targetPage = Math.max( 1, parseInt( page || 1, 10 ) );
		const seq = ++reqCounter;

		startSkeleton( seq, mode, expectedSkeletonCount( mode ) );

		return fetchPage( targetPage, ex.acat, ex.q )
			.then( ( res ) => {
				if ( ! res || ! res.success ) {
					throw new Error(
						( res && res.data && res.data.message ) || 'ajax error'
					);
				}
				if ( seq < lastApplied ) return;

				const nextCount = rowsCountFromHTML(
					res && res.data && typeof res.data.rows === 'string'
						? res.data.rows
						: ''
				);
				if ( nextCount > 0 ) updateSkeletonCount( seq, nextCount );

				return ensureSkeletonMinTime( seq ).then( () => {
					if ( seq < lastApplied ) {
						finishSkeleton( seq );
						return;
					}

					if ( mode === 'append' ) {
						finishSkeleton( seq );
						appendContent( res.data );
					} else {
						replaceContent( res.data );
						finishSkeleton( seq );
					}

					lastApplied = seq;
					state.page = targetPage;
					state.acat = ex.acat || '';
					state.q = ex.q || '';

					if ( push ) {
						pushUrl(
							res.data && res.data.url ? res.data.url : '',
							state.page,
							state.acat,
							state.q
						);
					}

					setActiveFilter( state.acat );
					updateTitle( state );

					root.dispatchEvent(
						new CustomEvent( 'price:state', { detail: { ...state } } )
					);
				} );
			} )
			.catch( ( err ) => {
				console.error( '[price] ajax error:', err );
				failSkeleton( seq );
			} );
	}

	function setActiveFilterOnInit() {
		setActiveFilter( state.acat );
		updateTitle( state );
		if ( state.q ) setSearchField( state.q );
		else if ( ! state.acat ) setSearchField( '' );
	}

	function pageFromHref( href ) {
		try {
			const u = new URL( href, window.location.origin );
			const p1 = parseInt( u.searchParams.get( 'paged' ) || '', 10 );
			if ( p1 && Number.isFinite( p1 ) ) return Math.max( 1, p1 );
			return getPageFromPath( u.pathname );
		} catch ( _ ) {
			return 1;
		}
	}

	function onPaginationClick( e ) {
		const a =
			e.target && e.target.closest
				? e.target.closest( '.pagination a.page-numbers' )
				: null;

		if ( ! a ) return;
		if ( ! root.contains( a ) ) return;

		const href = a.getAttribute( 'href' ) || '';
		if ( ! href ) return;

		e.preventDefault();

		const page = pageFromHref( href );
		Promise.resolve( go( page, state.acat, state.q, 'replace', true ) ).then(
			scrollToPriceTop
		);
	}

	root.addEventListener( 'click', onPaginationClick );

	const demoBtn = qs( root, '[data-skeleton-demo]' );
	let demoOn = false;
	let demoPrevHTML = '';
	let demoMode = 'replace';

	function showSkeletonDemo( count, mode ) {
		if ( ! rowsWrap ) return;

		demoMode = mode === 'append' ? 'append' : 'replace';
		rowsWrap.setAttribute( 'aria-busy', 'true' );

		if ( demoMode === 'replace' ) {
			demoPrevHTML = rowsWrap.innerHTML;
			rowsWrap.innerHTML = skeletonHTML( Math.max( 1, count ), 'demo', true );
			demoOn = true;
			return;
		}

		const tmp = document.createElement( 'div' );
		tmp.innerHTML = skeletonHTML( Math.max( 1, count ), 'demo', true );
		const frag = document.createDocumentFragment();
		Array.from( tmp.children ).forEach( ( n ) => frag.appendChild( n ) );
		rowsWrap.appendChild( frag );
		demoOn = true;
	}

	function hideSkeletonDemo() {
		if ( ! rowsWrap ) return;

		if ( demoMode === 'replace' ) {
			rowsWrap.innerHTML = demoPrevHTML || '';
			rowsWrap.removeAttribute( 'aria-busy' );
			demoOn = false;
			return;
		}

		Array.from(
			rowsWrap.querySelectorAll( '[data-price-skeleton-demo="1"]' )
		).forEach( ( n ) => n.remove() );

		rowsWrap.removeAttribute( 'aria-busy' );
		demoOn = false;
	}

	function toggleSkeletonDemo() {
		if ( ! rowsWrap ) return;

		if ( demoOn ) {
			hideSkeletonDemo();
			return;
		}

		const btnCount = demoBtn
			? parseInt( demoBtn.getAttribute( 'data-skeleton-count' ) || '0', 10 )
			: 0;

		const btnMode = demoBtn
			? ( demoBtn.getAttribute( 'data-skeleton-mode' ) || 'replace' )
			: 'replace';

		const count = Math.max( 1, btnCount || ppp || 1 );
		showSkeletonDemo( count, btnMode );
	}

	if ( demoBtn ) {
		demoBtn.addEventListener( 'click', ( e ) => {
			e.preventDefault();
			toggleSkeletonDemo();
		} );
	}

	function applyAllLoadedOnInit() {
		if ( ! isLastPageByDOM() ) {
			removeAllLoadedNotice();
			return;
		}
		if ( qs( root, '#' + allLoadedId ) ) return;
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
		},
	};
}

export { createController };
export default createController;
