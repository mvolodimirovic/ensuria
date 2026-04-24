import { EASING } from '../config';

export function initStickyAside( controller ) {
	const root = controller.root;
	const priceAside = root.querySelector( '.price__aside' );
	const header =
		document.querySelector( '.header' ) ||
		document.querySelector( 'header' );
	if ( ! priceAside ) return;

	const ICON_SPRITE = '/wp-content/themes/ensuria/assets/img/path-icon.svg';

	const mqlMobile = window.matchMedia( '(max-width: 1023.98px)' );
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
		if ( fsWrap ) return;
		fsWrap = document.createElement( 'div' );
		fsWrap.className = 'price-fixed-search';
		fsWrap.setAttribute( 'data-fixed-search', '' );

		fsBtn = document.createElement( 'button' );
		fsBtn.type = 'button';
		fsBtn.className = 'price-fixed-search__btn';
		fsBtn.setAttribute( 'aria-label', 'Пошук' );
		fsBtn.setAttribute( 'aria-expanded', 'false' );
		fsBtn.innerHTML = `<span class="icon-wrapper"><svg role="presentation" focusable="false"><use xlink:href="${ ICON_SPRITE }#icon-search"></use></svg></span>`;

		fsUse = fsBtn.querySelector( 'use' );

		fsPanel = document.createElement( 'div' );
		fsPanel.className = 'price-fixed-search__panel';
		fsPanel.setAttribute( 'data-fixed-search-panel', '' );

		fsForm = document.createElement( 'form' );
		fsForm.className = 'price-fixed-search__form';
		fsForm.setAttribute( 'role', 'search' );

		fsInput = document.createElement( 'input' );
		fsInput.type = 'search';
		fsInput.name = 'q';
		fsInput.className = 'price-fixed-search__input';
		fsInput.placeholder = 'Почніть вводити для пошуку';
		fsInput.autocomplete = 'off';

		fsForm.appendChild( fsInput );
		fsPanel.appendChild( fsForm );
		fsWrap.appendChild( fsBtn );
		fsWrap.appendChild( fsPanel );
		priceAside.insertBefore( fsWrap, priceAside.firstChild );

		fsBtn.addEventListener( 'click', () =>
			fsOpen ? closeFS() : openFS()
		);
		fsForm.addEventListener( 'submit', ( e ) => {
			e.preventDefault();
			const val = ( fsInput.value || '' ).trim();
			controller.setSearchField( val );
			controller.go( 1, '', val, 'replace', true );
		} );

		if ( controller.searchDelay > 0 ) {
			let t = null;
			fsInput.addEventListener( 'input', () => {
				clearTimeout( t );
				t = setTimeout( () => {
					const val = ( fsInput.value || '' ).trim();
					controller.setSearchField( val );
					controller.go( 1, '', val, 'replace', true );
				}, controller.searchDelay );
			} );
		}
		updateFSIcon();
	}

	function destroyFixedSearchUI() {
		if ( ! fsWrap ) return;
		fsWrap.remove();
		fsWrap = fsBtn = fsUse = fsPanel = fsForm = fsInput = null;
		fsOpen = false;
	}

	function openFS() {
		fsOpen = true;
		if ( fsBtn ) fsBtn.setAttribute( 'aria-expanded', 'true' );
		if ( fsWrap ) fsWrap.classList.add( 'is-open' );
		updateFSIcon();
		setTimeout( () => {
			if ( fsInput ) fsInput.focus();
		}, DUR + 20 );
	}

	function closeFS() {
		fsOpen = false;
		if ( fsBtn ) fsBtn.setAttribute( 'aria-expanded', 'false' );
		if ( fsWrap ) fsWrap.classList.remove( 'is-open' );
		updateFSIcon();
	}

	function updateFSIcon() {
		if ( ! fsUse ) return;
		const href = `${ ICON_SPRITE }${
			fsOpen ? '#icon-close' : '#icon-search'
		}`;
		fsUse.setAttributeNS(
			'http://www.w3.org/1999/xlink',
			'xlink:href',
			href
		);
		if ( fsBtn )
			fsBtn.setAttribute(
				'aria-label',
				fsOpen ? 'Закрити пошук' : 'Пошук'
			);
	}

	function applyFixedStyles() {
		priceAside.style.position = 'fixed';
		priceAside.style.top = headerH + 'px';
		priceAside.style.width =
			'calc(100% - clamp(1rem, 16px + 30.08 * (min(100vw, 1440px) - 375px) / 1065, 2.88rem) * 2)';
		priceAside.classList.add( 'is-fixed' );
		ensureFixedSearchUI();
	}

	function clearFixedStyles() {
		priceAside.classList.remove( 'is-fixed' );
		priceAside.style.position = '';
		priceAside.style.top = '';
		priceAside.style.width = '100%';
	}

	function fadeOutIn( cbMid ) {
		animating = true;
		priceAside.style.transition = `opacity ${ DUR }ms ${ EASING }`;
		priceAside.style.opacity = '0';
		setTimeout(
			() => {
				if ( cbMid ) cbMid();
				requestAnimationFrame( () => {
					priceAside.style.opacity = '1';
					const onEnd = ( e ) => {
						if ( e.propertyName !== 'opacity' ) return;
						priceAside.removeEventListener(
							'transitionend',
							onEnd
						);
						priceAside.style.transition = '';
						animating = false;
					};
					priceAside.addEventListener( 'transitionend', onEnd );
				} );
			},
			Math.max( 1, Math.floor( DUR * 0.45 ) )
		);
	}

	function fixWithFade() {
		if ( isFixed || animating ) return;
		fadeOutIn( () => {
			applyFixedStyles();
			isFixed = true;
		} );
	}

	function unfixWithFade() {
		if ( ! isFixed || animating ) return;
		destroyFixedSearchUI();
		fadeOutIn( () => {
			clearFixedStyles();
			isFixed = false;
		} );
	}

	function apply() {
		if ( animating ) return;
		if ( ! mqlMobile.matches ) {
			if ( isFixed ) unfixWithFade();
			return;
		}
		computeMetrics();
		const viewportTop = window.scrollY + headerH;
		const anchor = blockTopDoc;
		if ( ! isFixed ) {
			if ( viewportTop >= anchor ) fixWithFade();
		} else {
			if ( viewportTop < anchor ) unfixWithFade();
		}
	}

	function onScroll() {
		if ( ticking ) return;
		ticking = true;
		requestAnimationFrame( () => {
			apply();
			ticking = false;
		} );
	}

	function onResize() {
		if ( animating ) return;
		computeMetrics();
		apply();
	}

	priceAside.style.opacity = '1';
	computeMetrics();
	apply();

	window.addEventListener( 'scroll', onScroll, { passive: true } );
	window.addEventListener( 'resize', onResize );
	window.addEventListener( 'orientationchange', onResize );
	root.addEventListener( 'filters:toggle', onResize );
}
