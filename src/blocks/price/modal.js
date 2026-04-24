export function initAnalizyFiltersModal( {
	root,
	modalEl,
	getAcat,
	getTitle,
	searchForm,
	go,
	onStateChangedSource,
} ) {
	if ( ! root ) return;
	const filtersHost = root.querySelector( '[data-analizy-filters]' );
	if ( ! filtersHost ) return;

	const AJAX_URL =
		( window.appAjax && ( appAjax.url || appAjax.ajaxurl ) ) ||
		'/wp-admin/admin-ajax.php';
	const NONCE =
		( window.appAjax &&
			appAjax.nonces &&
			( appAjax.nonces.price || appAjax.nonces[ 'price' ] ) ) ||
		'';

	const inlineSlot =
		filtersHost.querySelector( '[data-filters-inline]' ) ||
		( function () {
			const d = document.createElement( 'div' );
			d.setAttribute( 'data-filters-inline', '' );
			filtersHost.appendChild( d );
			return d;
		} )();
	const openBtn = filtersHost.querySelector( '[data-filters-open]' );
	const modalBody =
		modalEl && modalEl.querySelector( '[data-filters-modal-body]' );
	const mqlDesk = window.matchMedia( '(min-width: 1024px)' );

	function openModal() {
		if ( ! modalEl ) return;
		modalEl.hidden = false;
		modalEl.setAttribute( 'aria-hidden', 'false' );
		modalEl.classList.add( 'is-open' );
	}
	function closeModal() {
		if ( ! modalEl ) return;
		modalEl.classList.remove( 'is-open' );
		modalEl.setAttribute( 'aria-hidden', 'true' );
		modalEl.hidden = true;
	}

	async function fetchFiltersHTML() {
		const body = new URLSearchParams();
		body.set( 'action', 'get_analizy_filters' );
		const acat = ( getAcat && getAcat() ) || '';
		const title = ( getTitle && getTitle() ) || '';
		if ( NONCE ) {
			body.set( 'security', NONCE );
			body.set( 'nonce', NONCE );
			body.set( 'price', NONCE );
		}
		if ( acat ) body.set( 'acat', acat );
		if ( title ) body.set( 'title', title );
		const r = await fetch( AJAX_URL, {
			method: 'POST',
			headers: {
				'Content-Type':
					'application/x-www-form-urlencoded; charset=UTF-8',
			},
			credentials: 'same-origin',
			body,
		} );
		const t = await r.text();
		if ( ! r.ok ) {
			console.error( 'get_analizy_filters HTTP', r.status, t );
			throw new Error( String( r.status ) );
		}
		let res;
		try {
			res = JSON.parse( t );
		} catch ( e ) {
			console.error( 'get_analizy_filters JSON', t );
			throw e;
		}
		if ( ! res || ! res.success ) {
			console.error( 'get_analizy_filters payload', res );
			throw new Error( 'filters ajax error' );
		}
		return String( res.data.html || '' );
	}

	function mountTo( target, html ) {
		target.innerHTML = `<div class="aside__filter__content" data-analizy-filters>${ html }</div>`;
	}

	async function renderDesktop() {
		if ( openBtn ) openBtn.style.display = 'none';
		closeModal();
		try {
			const html = await fetchFiltersHTML();
			mountTo( inlineSlot, html );
		} catch ( e ) {}
	}

	function renderMobile() {
		inlineSlot.innerHTML = '';
		if ( openBtn ) openBtn.style.display = '';
	}

	function renderResponsive() {
		if ( mqlDesk.matches ) renderDesktop();
		else renderMobile();
	}

	if ( openBtn && modalBody ) {
		openBtn.addEventListener( 'click', async function () {
			try {
				const html = await fetchFiltersHTML();
				mountTo( modalBody, html );
				openModal();
			} catch ( e ) {}
		} );
	}

	root.addEventListener( 'click', function ( e ) {
		if ( e.target.closest( '[data-filters-close]' ) ) closeModal();
	} );

	root.addEventListener( 'click', function ( e ) {
		const scope = e.target.closest( '[data-analizy-filters]' );
		if ( ! scope || ! root.contains( scope ) ) return;

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
			if ( modalEl && ! modalEl.hidden ) closeModal();
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

	renderResponsive();
	mqlDesk.addEventListener( 'change', renderResponsive );

	const src = onStateChangedSource || document;
	src.addEventListener( 'analizy:state-changed', function () {
		if ( mqlDesk.matches ) renderDesktop();
	} );
}
