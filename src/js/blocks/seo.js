/**
 * SEO "read more / read less" toggle with height caps and state classes.
 *
 * Behavior:
 * - Calculates collapsed and full heights based on paragraph content.
 * - Applies a CSS max-height using `max(MIN_HEIGHT, calculatedHeight)` for UX stability.
 * - Shows / hides .show-more and .show-less depending on whether expanding adds visual height.
 * - Adds `.no-more` to `.more__content` when:
 *    a) expanding would not increase visible height (i.e., toggles are not needed), or
 *    b) the content is currently expanded (clicked "show more").
 * - Removes `.no-more` when collapsing (clicked "show less") if toggles are actually needed.
 *
 * Class semantics:
 * - `.active` on `.more__content` (and its parent) means the content is expanded.
 * - `.no-more` on `.more__content` signals “no more to show” (either inherently short,
 *   or explicitly expanded).
 */
export function seoToggle() {
	document.querySelectorAll( '.more__content' ).forEach( ( content ) => {
		const btnMore = content.parentElement.querySelector( '.show-more' );
		const btnLess = content.parentElement.querySelector( '.show-less' );
		if ( ! content || ! btnMore || ! btnLess ) return;

		// Paragraph collection and layout constants
		const paragraphs = content.querySelectorAll( 'p' );
		const margin = 22; // vertical gap between stacked paragraphs

		// Visual constraints
		const MAX_HEIGHT_PX = 466; // minimum comfortable visible area (via CSS max())
		const MAX_FULL_PARAS = 10; // cap for "full" measured content
		const MAX_COLLAPSED_PARAS = 8; // cap for "collapsed" measured content

		// Runtime state
		let collapsedTargetPx = 0; // calculated collapsed height (content-only)
		let fullTargetPx = 0; // calculated full height (content-only)
		let isSingleShort = false; // true when a single short paragraph should not toggle

		/**
		 * Sum heights of a list of paragraphs including inter-paragraph margins.
		 */
		const getTotalHeight = ( elements ) => {
			let total = 0;
			elements.forEach( ( el, i ) => {
				total += el.offsetHeight;
				if ( i > 0 ) total += margin;
			} );
			return total;
		};

		/**
		 * Measure collapsed and full targets based on content structure.
		 * Single-paragraph behavior:
		 * - <=135px: treat as short text (no toggle).
		 * - >135px: collapsed uses a viewport-aware cutoff; full uses actual height.
		 * Multi-paragraph behavior:
		 * - Measure up to MAX_* caps for stability.
		 */
		const calculateHeights = () => {
			if ( paragraphs.length === 1 ) {
				const oneHeight = paragraphs[ 0 ]
					? paragraphs[ 0 ].offsetHeight
					: 0;

				if ( oneHeight <= 135 ) {
					isSingleShort = true;
					collapsedTargetPx = oneHeight;
					fullTargetPx = oneHeight;
				} else {
					isSingleShort = false;
					const cutoff = window.matchMedia( '(max-width: 768px)' )
						.matches
						? 117
						: 100;
					collapsedTargetPx = cutoff;
					fullTargetPx = oneHeight;
				}
			} else {
				isSingleShort = false;
				const firstCollapsed = Array.from( paragraphs ).slice(
					0,
					MAX_COLLAPSED_PARAS
				);
				const firstFull = Array.from( paragraphs ).slice(
					0,
					MAX_FULL_PARAS
				);
				collapsedTargetPx = getTotalHeight( firstCollapsed );
				fullTargetPx = getTotalHeight( firstFull );
			}
		};

		/**
		 * Decide if toggling is meaningful:
		 * - Compare “visual” max-heights (enforced minimum vs. measured content).
		 * - If expanding doesn't increase visible height, toggles are not needed.
		 */
		const togglesNeeded = () => {
			if ( isSingleShort ) return false;
			const collapsedVisual = Math.max(
				MAX_HEIGHT_PX,
				collapsedTargetPx
			);
			const fullVisual = Math.max( MAX_HEIGHT_PX, fullTargetPx );
			return fullVisual > collapsedVisual;
		};

		/**
		 * Keep `.no-more` on `.more__content` when:
		 * - expanded (active), OR
		 * - toggles are not needed at all.
		 * Otherwise remove it.
		 */
		const updateNoMoreFlag = () => {
			if ( content.classList.contains( 'active' ) ) {
				content.classList.add( 'no-more' );
				return;
			}
			if ( ! togglesNeeded() ) {
				content.classList.add( 'no-more' );
			} else {
				content.classList.remove( 'no-more' );
			}
		};

		/**
		 * Button visibility logic:
		 * - Hide both when single short paragraph or toggles aren't needed.
		 * - Otherwise, show the appropriate button for the current state.
		 */
		const updateButtonsVisibility = () => {
			const isActive = content.classList.contains( 'active' );

			if ( isSingleShort ) {
				btnMore.style.display = 'none';
				btnLess.style.display = 'none';
				return;
			}
			if ( togglesNeeded() ) {
				btnMore.style.display = isActive ? 'none' : 'block';
				btnLess.style.display = isActive ? 'block' : 'none';
			} else {
				btnMore.style.display = 'none';
				btnLess.style.display = 'none';
			}
		};

		/**
		 * Apply CSS max-height:
		 * - Use CSS `max()` so the visible area never shrinks below MIN for UX.
		 * - When expanded, use fullTargetPx; when collapsed, use collapsedTargetPx.
		 */
		const applyHeight = () => {
			if ( isSingleShort ) {
				// Reset to natural height for truly short one-paragraph content
				content.classList.remove( 'active' );
				btnMore.classList.remove( 'active' );
				btnLess.classList.remove( 'active' );
				content.style.maxHeight = '';
				return;
			}
			const target = content.classList.contains( 'active' )
				? `max(${ MAX_HEIGHT_PX }px, ${ fullTargetPx }px)`
				: `max(${ MAX_HEIGHT_PX }px, ${ collapsedTargetPx }px)`;

			content.style.maxHeight = target;
		};

		// Initial run: measure → set flags → set height → set buttons
		calculateHeights();
		updateNoMoreFlag();
		updateButtonsVisibility();
		applyHeight();

		// Responsive updates (debounced)
		let resizeTimeout;
		window.addEventListener( 'resize', () => {
			clearTimeout( resizeTimeout );
			resizeTimeout = setTimeout( () => {
				calculateHeights();
				updateNoMoreFlag();
				applyHeight();
				updateButtonsVisibility();
			}, 100 );
		} );

		// Expand handler
		btnMore.addEventListener( 'click', () => {
			// Expand state classes
			content.parentElement.classList.add( 'active' );
			content.classList.add( 'active' );
			btnMore.classList.add( 'active' );
			btnLess.classList.add( 'active' );

			// Explicitly add `.no-more` when expanded via user action
			content.classList.add( 'no-more' );

			// Recalculate / apply for accuracy after DOM class changes
			calculateHeights();
			applyHeight();

			// Toggle button visibility
			btnMore.style.display = 'none';
			btnLess.style.display = 'block';
		} );

		// Collapse handler
		btnLess.addEventListener( 'click', () => {
			// Collapse state classes
			content.parentElement.classList.remove( 'active' );
			content.classList.remove( 'active' );
			btnMore.classList.remove( 'active' );
			btnLess.classList.remove( 'active' );

			// Remove `.no-more` on explicit collapse
			content.classList.remove( 'no-more' );

			// Recalculate / apply; then re-evaluate whether `.no-more` should stick
			calculateHeights();
			applyHeight();

			// If toggles remain meaningful, keep `.no-more` off; if not, add it back.
			updateNoMoreFlag();

			// Toggle button visibility
			btnMore.style.display = 'block';
			btnLess.style.display = 'none';
		} );
	} );
}
