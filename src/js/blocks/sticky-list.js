export function initHeadStickyToggle() {
	const headerSel = '#header';
	const stickySel = '.head-sticky';
	const targetSel = '.buttons-wrapper';
	const visibleClass = 'is-visible';

	const header = document.querySelector( headerSel );
	const sticky = document.querySelector( stickySel );
	const target = document.querySelector( targetSel );
	if ( ! sticky || ! target ) return { update() {}, destroy() {} };

	let ticking = false;
	let resizeTimeout = null;

	function compute() {
		if ( ! document.contains( sticky ) || ! document.contains( target ) )
			return;

		try {
			const hb = header ? header.getBoundingClientRect().bottom : 0;
			const tt = target.getBoundingClientRect().top;
			if ( hb >= tt ) sticky.classList.add( visibleClass );
			else sticky.classList.remove( visibleClass );
		} catch ( error ) {
			console.warn( 'Error in sticky compute:', error );
		}
	}

	function onTick() {
		if ( ticking ) return;
		ticking = true;
		requestAnimationFrame( () => {
			ticking = false;
			compute();
		} );
	}

	function onResize() {
		if ( resizeTimeout ) clearTimeout( resizeTimeout );
		resizeTimeout = setTimeout( onTick, 100 );
	}

	compute();
	window.addEventListener( 'scroll', onTick, { passive: true } );
	window.addEventListener( 'resize', onResize );
	if ( header ) {
		header.addEventListener( 'transitionstart', compute );
		header.addEventListener( 'transitionend', compute );
	}

	return {
		update: compute,
		destroy() {
			if ( resizeTimeout ) {
				clearTimeout( resizeTimeout );
				resizeTimeout = null;
			}
			window.removeEventListener( 'scroll', onTick );
			window.removeEventListener( 'resize', onResize );
			if ( header ) {
				header.removeEventListener( 'transitionstart', compute );
				header.removeEventListener( 'transitionend', compute );
			}
		},
	};
}
