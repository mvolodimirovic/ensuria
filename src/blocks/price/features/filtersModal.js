import {
	qs,
	qsa,
	on,
	slideOpen,
	slideClose,
	closeAllParentsExcept,
} from '../utils';

const bound = new WeakSet();

/**
 * Prepare filter markup inside a given container:
 * - Ensures collapsible areas have explicit inline styles for height-based transitions
 * - Normalizes ARIA for buttons and makes them keyboard-focusable
 *
 * @param {Element|Document} container
 */
function primeFilterDOM( container ) {
	// Set transition-friendly styles for collapsible inner sections
	qsa(
		container,
		'.aside__filter__wrapper.has-children .aside__filter__inner'
	).forEach( ( inner ) => {
		inner.style.overflow = 'hidden';
		inner.style.willChange = 'height';

		const wrap = inner.closest( '.aside__filter__wrapper' );
		// Start opened groups at "auto", closed ones at "0px" for clean transitions
		inner.style.height =
			wrap && wrap.classList.contains( 'open' ) ? 'auto' : '0px';

		// Keep layout consistent when the inner is "opened"
		inner.style.display = 'flex';
		inner.style.flexDirection = 'column';
	} );

	// Parent toggles: set ARIA and keyboard semantics
	qsa( container, '.aside__filter-btn' ).forEach( ( btn ) => {
		const wrap = btn.closest( '.aside__filter__wrapper.has-children' );
		if ( ! wrap ) return;

		btn.setAttribute(
			'aria-expanded',
			wrap.classList.contains( 'open' ) ? 'true' : 'false'
		);
		btn.setAttribute( 'role', 'button' );
		btn.setAttribute( 'tabindex', '0' );
	} );

	// Term buttons (AJAX): make them accessible as buttons
	qsa( container, '.aside__filter--ajax' ).forEach( ( btn ) => {
		btn.setAttribute( 'role', 'button' );
		btn.setAttribute( 'tabindex', '0' );
	} );
}

/**
 * Toggle a parent group open/closed and update ARIA.
 * Closes sibling groups to keep only one open at a time.
 *
 * @param {Element} scope - Container in which to close other parents
 * @param {Element} btn   - The clicked parent toggle button
 */
function handleParentBtn( scope, btn ) {
	const wrap = btn.closest( '.aside__filter__wrapper.has-children' );
	if ( ! wrap ) return;

	const willOpen = ! wrap.classList.contains( 'open' );

	if ( willOpen ) {
		// Close other groups in the same scope, then open this one
		closeAllParentsExcept( scope, wrap );
		slideOpen( wrap );
		btn.setAttribute( 'aria-expanded', 'true' );
	} else {
		// Close this group
		slideClose( wrap );
		btn.setAttribute( 'aria-expanded', 'false' );
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
function handleTermBtn( controller, termBtn, onPicked ) {
	const slug = termBtn.getAttribute( 'data-term-slug' ) || ' ';
	controller.setSearchField( '' );
	controller.go( 1, slug, '', 'replace', true );
	if ( typeof onPicked === 'function' ) onPicked();
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
function bindFilters( container, controller, onPicked ) {
	if ( ! container || bound.has( container ) ) return;
	bound.add( container );

	// Mouse interaction (delegated)
	container.addEventListener( 'click', ( e ) => {
		const t = e.target instanceof Element ? e.target : null;
		if ( ! t ) return;

		// Parent group toggle
		const parentBtn = t.closest(
			'.aside__filter-btn:not(.aside__filter--ajax)'
		);
		if ( parentBtn && container.contains( parentBtn ) ) {
			e.preventDefault();
			e.stopPropagation();
			handleParentBtn( container, parentBtn );
			return;
		}

		// Term (leaf) selection
		const termBtn = t.closest( '.aside__filter--ajax[data-term-slug]' );
		if ( termBtn && container.contains( termBtn ) ) {
			e.preventDefault();
			e.stopPropagation();
			handleTermBtn( controller, termBtn, onPicked );
		}
	} );

	// Keyboard interaction (Enter/Space activate)
	container.addEventListener( 'keydown', ( e ) => {
		const t = e.target instanceof Element ? e.target : null;
		if ( ! t ) return;
		if ( e.key !== 'Enter' && e.key !== ' ' ) return;

		const isParent = t.matches(
			'.aside__filter-btn:not(.aside__filter--ajax)'
		);
		const isTerm = t.matches( '.aside__filter--ajax[data-term-slug]' );

		if ( isParent ) {
			e.preventDefault();
			handleParentBtn( container, t );
		} else if ( isTerm ) {
			e.preventDefault();
			handleTermBtn( controller, t, onPicked );
		}
	} );
}

/**
 * Initialize filters in static layout (non-modal).
 * @param {Object} controller
 */
export function initFilters( controller ) {
	const { root, filters } = controller;
	if ( root ) primeFilterDOM( root );
	if ( filters ) {
		primeFilterDOM( filters );
		bindFilters( filters, controller );
	}
}

/**
 * Initialize mobile/overlay filters modal.
 * Builds a modal on-demand by cloning the source `.aside__filter-flex`
 * into the modal body to keep markup/parity with desktop.
 *
 * @param {Object} controller
 */
export function initFiltersModal( controller ) {
	const { root } = controller;
	const filterMobileBtn = qs( root, '.aside__filter-mobile' );
	const sourceFlex = qs( root, '.aside__filter-flex' );

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
	const mqlDesktop = window.matchMedia( '(min-width: 1024px)' );

	// Scroll lock helpers for body when modal is open
	const lockScroll = () =>
		document.body.classList.add( 'no-scroll', 'modal-view' );
	const unlockScroll = () =>
		document.body.classList.remove( 'no-scroll', 'modal-view' );

	/**
	 * Smoothly scroll back to the price list area (after picking a term in modal).
	 * Honors sticky header height or a custom `data-scroll-offset` if provided.
	 */
	function scrollToPrices() {
		const scrollOffsetExtra = 70;
		const offsetAttr = parseInt(
			root.getAttribute( 'data-scroll-offset' ) || '0',
			10
		);
		const header = document.querySelector(
			'.header.is-sticky, .site-header.is-sticky, .header.sticky, .site-header.sticky'
		);
		const headerH = header ? header.getBoundingClientRect().height : 0;

		// Prefer explicit offset; otherwise use detected header height
		const baseOffset =
			Number.isFinite( offsetAttr ) && offsetAttr > 0
				? offsetAttr
				: headerH;

		const top = Math.max(
			0,
			root.getBoundingClientRect().top +
				window.pageYOffset -
				( baseOffset + scrollOffsetExtra )
		);

		// Use next-tick to avoid clashing with DOM updates on modal close
		setTimeout( () => {
			window.scrollTo( { top, behavior: 'smooth' } );
		}, 0 );
	}

	/**
	 * Lazily create the modal structure and wire the core event handlers.
	 * @returns {Element} modal element
	 */
	function ensureModal() {
		if ( modalEl ) return modalEl;

		const ptypeLabel =
			root.getAttribute( 'data-ptype-label' ) ||
			qs( root, '.price__title' )?.getAttribute( 'data-title' ) ||
			'';

		const titleText = ptypeLabel
			? 'Показати всі ' + ptypeLabel
			: 'Показати всі';

		// Base modal markup; kept minimal and self-contained
		modalEl = document.createElement( 'div' );
		modalEl.className = 'modal modal--filters';
		modalEl.setAttribute( 'aria-hidden', 'true' );
		modalEl.hidden = true;
		modalEl.innerHTML =
			'<div class="modal__wrapper modal__wrapper--filters">' +
			'<button type="button" class="modal__close" data-filters-close aria-label="Закрити модальне вікно">' +
			'<span class="icon-wrapper icon-close"><svg role="presentation" focusable="false"><use xlink:href="/wp-content/themes/ensuria/assets/img/path-icon.svg#icon-close"></use></svg></span>' +
			'</button>' +
			'<h3 class="price__title" data-title="' +
			( ptypeLabel || '' ) +
			'">' +
			titleText +
			'</h3>' +
			'<div class="filters-modal__body modal__body--filters" data-filters-modal-body></div>' +
			'</div>' +
			'<div class="modal__bg modal__bg--filters" data-filters-close></div>';

		document.body.appendChild( modalEl );

		// Cache important nodes
		modalBody = qs( modalEl, '[data-filters-modal-body]' );
		modalWrapper = qs( modalEl, '.modal__wrapper' );
		modalBg = qs( modalEl, '.modal__bg' );

		// Avoid pointer-events dead zones on nested elements
		modalEl.style.pointerEvents = 'auto';
		modalWrapper.style.pointerEvents = 'auto';
		modalBody.style.pointerEvents = 'auto';

		// Local (modal) click handler: close on explicit close targets
		modalClickHandler = ( e ) => {
			const target = e.target instanceof Element ? e.target : null;
			if ( ! target ) return;
			if ( target.closest( '[data-filters-close], .modal__close' ) ) {
				closeModal();
			}
		};

		// Global capture-phase click handler to catch delegated interactions inside modal
		windowClickHandler = ( e ) => {
			if ( ! modalEl ) return;

			const target = e.target instanceof Element ? e.target : null;
			if ( ! target || ! modalEl.contains( target ) ) return;

			// Direct matches via closest(...)
			const parentDirect = target.closest(
				'.aside__filter-btn:not(.aside__filter--ajax)'
			);
			if ( parentDirect ) {
				e.preventDefault();
				handleParentBtn( modalEl, parentDirect );
				return;
			}

			const termDirect = target.closest(
				'.aside__filter--ajax[data-term-slug]'
			);
			if ( termDirect ) {
				e.preventDefault();
				handleTermBtn( controller, termDirect, () => {
					closeModal();
					scrollToPrices();
				} );
				return;
			}

			// Prefer composedPath() for accurate hit-testing across Shadow DOM boundaries
			const path =
				typeof e.composedPath === 'function' ? e.composedPath() : null;

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
			const findInPath = ( selector ) => {
				if ( Array.isArray( path ) ) {
					for ( let i = 0; i < path.length; i++ ) {
						const el = path[ i ];
						if (
							el instanceof Element &&
							modalEl.contains( el ) &&
							el.matches( selector )
						) {
							return el;
						}
						if ( el === modalEl ) break;
					}
				}
				let node = target.parentElement;
				while ( node && node !== modalEl ) {
					if ( node.matches( selector ) ) return node;
					node = node.parentElement;
				}
				return null;
			};

			const parentFromPath = findInPath(
				'.aside__filter-btn:not(.aside__filter--ajax)'
			);
			if ( parentFromPath ) {
				e.preventDefault();
				handleParentBtn( modalEl, parentFromPath );
				return;
			}

			const termFromPath = findInPath(
				'.aside__filter--ajax[data-term-slug]'
			);
			if ( termFromPath ) {
				e.preventDefault();
				handleTermBtn( controller, termFromPath, () => {
					closeModal();
					scrollToPrices();
				} );
			}
		};

		// Keyboard handler for focus-within modal (Enter/Space activate)
		keydownHandler = ( e ) => {
			if ( e.key !== 'Enter' && e.key !== ' ' ) return;

			const active = document.activeElement;
			if (
				! active ||
				! ( active instanceof Element ) ||
				! modalEl.contains( active )
			)
				return;

			if (
				active.matches( '.aside__filter-btn:not(.aside__filter--ajax)' )
			) {
				e.preventDefault();
				handleParentBtn( modalEl, active );
			} else if (
				active.matches( '.aside__filter--ajax[data-term-slug]' )
			) {
				e.preventDefault();
				handleTermBtn( controller, active, () => {
					closeModal();
					scrollToPrices();
				} );
			}
		};

		return modalEl;
	}

	/**
	 * Attach global listeners once per modal lifecycle.
	 * Using explicit unbind on close helps prevent memory leaks if modal is recreated.
	 */
	function bindGlobalHandlers() {
		if ( handlersBound || ! modalEl ) return;
		modalEl.addEventListener( 'click', modalClickHandler );
		window.addEventListener( 'click', windowClickHandler, true ); // capture
		document.addEventListener( 'keydown', keydownHandler );
		handlersBound = true;
	}

	/**
	 * Detach global listeners to avoid duplicate handlers and leaks.
	 */
	function unbindGlobalHandlers() {
		if ( ! handlersBound || ! modalEl ) return;
		modalEl.removeEventListener( 'click', modalClickHandler );
		window.removeEventListener( 'click', windowClickHandler, true );
		document.removeEventListener( 'keydown', keydownHandler );
		handlersBound = false;
	}

	/**
	 * Clone the source filter flex container into the modal and re-bind logic.
	 * This keeps desktop and modal markup in sync without duplicating templates.
	 * @returns {boolean} true if modal body was populated
	 */
	function buildModalFilters() {
		if ( ! modalBody ) return false;

		modalBody.innerHTML = '';
		if ( ! sourceFlex ) return false;

		// Clone to avoid moving the original DOM
		const clone = sourceFlex.cloneNode( true );
		modalBody.appendChild( clone );
		modalBody.style.pointerEvents = 'auto';

		// Re-prime and bind inside the modal context
		primeFilterDOM( modalBody );

		const flexInModal =
			modalBody.querySelector( '.aside__filter-flex' ) || modalBody;
		const afterPick = () => {
			closeModal();
			scrollToPrices();
		};
		bindFilters( flexInModal, controller, afterPick );

		return true;
	}

	/**
	 * Open the modal (lazy-build if needed), lock scroll, set ARIA/state classes.
	 * Falls back to "show all" if modal cannot be built (e.g., missing source markup).
	 */
	function openModal() {
		ensureModal();
		const ok = buildModalFilters();
		if ( ! ok ) {
			showAll();
			return;
		}

		bindGlobalHandlers();

		modalEl.classList.add( 'price' );
		modalEl.hidden = false;
		modalEl.setAttribute( 'aria-hidden', 'false' );
		modalEl.classList.add( 'modal--show' );

		root.classList.add( 'filters-open' );
		root.dispatchEvent( new CustomEvent( 'filters:toggle' ) );

		lockScroll();
	}

	/**
	 * Close the modal, unlock scroll, and clean up handlers.
	 */
	function closeModal() {
		if ( ! modalEl ) return;

		unbindGlobalHandlers();

		modalEl.classList.remove( 'modal--show' );
		modalEl.setAttribute( 'aria-hidden', 'true' );
		modalEl.hidden = true;
		modalEl.classList.remove( 'price' );

		root.classList.remove( 'filters-open' );
		root.dispatchEvent( new CustomEvent( 'filters:toggle' ) );

		unlockScroll();
	}

	/**
	 * Helper: clear search and show all results.
	 */
	function showAll() {
		controller.setSearchField( '' );
		controller.go( 1, '', '', 'replace', true );
	}

	// Entry point: mobile/overlay button
	if ( filterMobileBtn ) {
		on( filterMobileBtn, 'click', ( e ) => {
			e.preventDefault();

			// On desktop, mobile filter button acts like "show all"
			if ( mqlDesktop.matches ) {
				showAll();
				return;
			}

			openModal();
		} );
	}
}
