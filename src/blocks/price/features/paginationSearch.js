import { on } from '../utils';

function getPageFromUrl( href ) {
	try {
		const url = new URL( href || location.href, location.origin );
		const m = ( url.pathname || '' ).match( /\/page\/(\d+)\/?$/ );
		const p1 = m ? parseInt( m[ 1 ], 10 ) : 0;
		const p2 = parseInt(
			url.searchParams.get( 'paged' ) ||
				url.searchParams.get( 'page' ) ||
				'0',
			10
		);
		return Math.max( p1, p2, 1 ) || 1;
	} catch ( _ ) {
		return 1;
	}
}

function exclusive( acat, q ) {
	const qq = ( q || '' ).trim();
	return qq ? { acat: '', q: qq } : { acat: acat || '', q: '' };
}

function findSearchField( root ) {
	return root.querySelector(
		'[data-analizy-search] input[name="q"], #price__form input[name="q"]'
	);
}

function getConfig( controller ) {
	const el =
		controller?.root || document.querySelector( '[data-analizy-root]' );
	const data = el?.dataset || {};
	const base =
		data.root && data.root !== ''
			? data.root
			: location.pathname + location.search;
	const pretty =
		data.pretty === '1' ||
		data.pretty === 'true' ||
		( ! location.search && ! location.pathname.includes( 'index.php' ) );
	const hasTax = data.hasTax === '1' || data.hasTax === 'true';
	const isArchive =
		document.body.classList.contains( 'post-type-archive' ) ||
		!! document.querySelector( '[data-analizy-root][data-root]' );
	const paramName = isArchive ? 'paged' : 'page';
	return { base, pretty, paramName, hasTax };
}

function buildUrl( base, page, acat, q, cfg ) {
	let u;
	try {
		u = new URL( base, location.origin );
	} catch {
		u = new URL( location.href );
	}
	u.pathname = u.pathname.replace( /\/page\/\d+\/?$/, '/' );
	if ( cfg.pretty ) {
		if ( page > 1 ) {
			const p = u.pathname.endsWith( '/' )
				? u.pathname
				: u.pathname + '/';
			u.pathname = p + 'page/' + page + '/';
		}
		u.searchParams.delete( 'page' );
		u.searchParams.delete( 'paged' );
	} else {
		const key = cfg.paramName || 'page';
		if ( page > 1 ) u.searchParams.set( key, String( page ) );
		else u.searchParams.delete( key );
		u.searchParams.delete( key === 'page' ? 'paged' : 'page' );
	}
	const qq = ( q || '' ).trim();
	if ( qq ) {
		u.searchParams.set( 'q', qq );
		u.searchParams.delete( 'acat' );
	} else {
		u.searchParams.delete( 'q' );
		if ( cfg.hasTax && typeof acat === 'string' && acat )
			u.searchParams.set( 'acat', acat );
		else u.searchParams.delete( 'acat' );
	}
	return u.toString();
}

export function initPagination( controller ) {
	const { root, go, state } = controller;
	const cfg = getConfig( controller );

	on( root, 'click', ( e ) => {
		const pagA = e.target.closest(
			'[data-analizy-pagination] a, .analizy__pagination a'
		);
		if ( pagA ) {
			e.preventDefault();
			const href = pagA.getAttribute( 'href' ) || '';
			const page = getPageFromUrl( href );
			let q = '',
				acatParam = '';
			try {
				const url = new URL( href, location.origin );
				q = ( url.searchParams.get( 'q' ) || '' ).trim();
				acatParam = url.searchParams.get( 'acat' ) || '';
			} catch {}
			const ex = exclusive( acatParam || state.acat, q );
			if ( ! cfg.hasTax ) ex.acat = '';
			const target = buildUrl( cfg.base, page || 1, ex.acat, ex.q, cfg );
			go( page, ex.acat, ex.q, 'replace', false );
			history.pushState( {}, '', target );
			return;
		}

		const more = e.target.closest( '[data-more]' );
		if ( more ) {
			e.preventDefault();
			const ex = exclusive( state.acat, state.q );
			if ( ! cfg.hasTax ) ex.acat = '';
			const nextPage = ( state.page || 1 ) + 1;
			const target = buildUrl( cfg.base, nextPage, ex.acat, ex.q, cfg );
			go( nextPage, ex.acat, ex.q, 'append', false );
			history.pushState( {}, '', target );
			return;
		}

		const filterBtn = e.target.closest( '.aside__filter--ajax' );
		if ( filterBtn ) {
			e.preventDefault();
			if ( ! cfg.hasTax ) return;
			const slugAttr = filterBtn.getAttribute( 'data-term-slug' );
			const isAll = ! slugAttr || slugAttr.trim() === '';
			const slug = isAll ? '' : slugAttr.trim();
			const target = buildUrl( cfg.base, 1, slug, '', cfg );
			go( 1, slug, '', 'replace', false );
			history.pushState( {}, '', target );
		}
	} );
}

export function initSearch( controller ) {
	const { root, go } = controller;
	const delay =
		typeof controller.searchDelay === 'number'
			? controller.searchDelay
			: 600;
	const cfg = getConfig( controller );

	const sf =
		( controller.getSearchField && controller.getSearchField() ) ||
		findSearchField( root );
	let searchTimer = null;
	let lastQuery = ( controller.state && controller.state.q ) || '';

	if ( sf ) {
		on( sf, 'input', () => {
			clearTimeout( searchTimer );
			searchTimer = setTimeout( () => {
				const q = ( sf.value || '' ).trim();
				if ( q === lastQuery ) return;
				lastQuery = q;
				const target = buildUrl( cfg.base, 1, '', q, cfg );
				go( 1, '', q, 'replace', false );
				history.pushState( {}, '', target );
			}, delay );
		} );
	}

	const form =
		root.querySelector( '[data-analizy-search]' ) ||
		document.getElementById( 'price__form' );
	if ( form ) {
		on( form, 'submit', ( e ) => {
			e.preventDefault();
			clearTimeout( searchTimer );
			const q = sf ? ( sf.value || '' ).trim() : '';
			lastQuery = q;
			const target = buildUrl( cfg.base, 1, '', q, cfg );
			go( 1, '', q, 'replace', false );
			history.pushState( {}, '', target );
		} );
	}

	on( window, 'popstate', () => {
		const page = getPageFromUrl( location.href );
		let q = '',
			acat = '';
		try {
			const sp = new URLSearchParams( location.search );
			q = ( sp.get( 'q' ) || '' ).trim();
			acat = sp.get( 'acat' ) || '';
		} catch {}
		const ex = exclusive( acat, q );
		if ( ! cfg.hasTax ) ex.acat = '';
		if ( controller.setSearchField ) controller.setSearchField( ex.q );
		else {
			const fld = sf || findSearchField( root );
			if ( fld ) fld.value = ex.q || '';
		}
		go( page, ex.acat, ex.q, 'replace', false );
	} );
}
