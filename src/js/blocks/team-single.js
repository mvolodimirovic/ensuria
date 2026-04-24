let smartAnchorScrollInited = false;

const buttonSelector = '.doctor__info-sticky__button[data-content]';
const headerId = 'header';
const activeClass = 'active';
const upVisibilityPad = 8;

let targets = [];
let ticking = false;
let resizeTimeout = null;
let lastKey = null;
let lastScrollY = 0;
let scrollDirUp = false;

function escAttr( v ) {
	if ( typeof CSS !== 'undefined' && CSS.escape ) return CSS.escape( v );
	return String( v ).replace( /['"\\]/g, '\\$&' );
}

function measureHeaderOnce() {
	const el = document.getElementById( headerId );
	if ( ! el ) return 0;
	const pos = getComputedStyle( el ).position;
	if ( pos !== 'fixed' && pos !== 'sticky' ) return 0;
	return el.offsetHeight || 0;
}

function isMobile() {
	return window.innerWidth <= 768;
}

function prefersReducedMotion() {
	return (
		window.matchMedia &&
		window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
	);
}

function smoothScrollTo( y ) {
	if ( prefersReducedMotion() ) {
		window.scrollTo( 0, y );
		return;
	}
	window.scrollTo( { top: y, behavior: 'smooth' } );
}

function getButtonsByKey( key ) {
	return Array.from(
		document.querySelectorAll(
			`${ buttonSelector }[data-content="${ escAttr( key ) }"]`
		)
	);
}

function findTargetByKey( key ) {
	const nodes = document.querySelectorAll(
		`[data-content="${ escAttr( key ) }"]`
	);
	for ( const el of nodes ) {
		if ( ! el.matches( buttonSelector ) ) return el;
	}
	return null;
}

function buildTargets() {
	const nodes = Array.from(
		document.querySelectorAll( '[data-content]' )
	).filter( ( el ) => ! el.matches( buttonSelector ) );
	const map = new Map();
	for ( const el of nodes ) {
		const key = el.getAttribute( 'data-content' ) || '';
		if ( key && ! map.has( key ) ) map.set( key, el );
	}
	targets = Array.from( map, ( [ key, el ] ) => ( { key, el } ) );

	if ( targets.length === 0 ) {
		console.warn( 'No targets found for smart anchor scroll' );
	}
}

function onClick( e ) {
	const btn = e.target.closest( buttonSelector );
	if ( ! btn ) return;
	e.preventDefault();
	const key = btn.getAttribute( 'data-content' ) || '';
	const target = findTargetByKey( key );
	if ( ! target ) return;

	const rect = target.getBoundingClientRect();
	const docY = window.pageYOffset + rect.top;
	const isUp = docY < window.pageYOffset;
	const currentHeaderOffset = measureHeaderOnce();

	let y;

	if ( isMobile() ) {
		y = Math.max( 0, docY - currentHeaderOffset );
	} else {
		if ( isUp || key === 'tab-1' ) {
			y = Math.max( 0, docY - currentHeaderOffset - 50 );
		} else {
			if ( key === 'tab-2' ) {
				y = Math.max( 0, docY - currentHeaderOffset + 50 );
			} else {
				y = Math.max( 0, docY - currentHeaderOffset );
			}
		}
	}

	smoothScrollTo( y );
}

function isVisibleRect( r, vTop, vBottom ) {
	return r.bottom > vTop && r.top < vBottom;
}

function updateActive() {
	ticking = false;
	if ( ! targets.length ) return;
	const currentHeaderOffset = measureHeaderOnce();
	const vTop = currentHeaderOffset + ( scrollDirUp ? upVisibilityPad : 0 );
	const vBottom = window.innerHeight;

	let bestKey = null;
	let bestTopRank = Infinity;

	for ( const { key, el } of targets ) {
		const r = el.getBoundingClientRect();
		if ( ! isVisibleRect( r, vTop, vBottom ) ) continue;
		const topRank = Math.max( r.top, vTop );
		if ( topRank < bestTopRank ) {
			bestTopRank = topRank;
			bestKey = key;
		}
	}

	if ( lastKey === bestKey ) return;

	const activeBtns = document.querySelectorAll(
		`${ buttonSelector }.${ activeClass }`
	);
	for ( const b of activeBtns ) b.classList.remove( activeClass );

	if ( bestKey ) {
		const btns = getButtonsByKey( bestKey );
		for ( const b of btns ) b.classList.add( activeClass );
	}

	lastKey = bestKey;
}

function onScrollOrResize() {
	const curY = window.pageYOffset || 0;
	scrollDirUp = curY < lastScrollY;
	lastScrollY = curY;
	if ( ticking ) return;
	ticking = true;
	requestAnimationFrame( () => {
		setTimeout( updateActive, 50 );
	} );
}

function onResize() {
	if ( resizeTimeout ) clearTimeout( resizeTimeout );
	resizeTimeout = setTimeout( () => {
		buildTargets();
		onScrollOrResize();
	}, 100 );
}

export function initSmartAnchorScroll() {
	if ( smartAnchorScrollInited ) return;
	smartAnchorScrollInited = true;

	lastScrollY = window.pageYOffset || 0;
	buildTargets();

	document.addEventListener( 'click', onClick, { passive: false } );
	window.addEventListener( 'scroll', onScrollOrResize, { passive: true } );
	window.addEventListener( 'resize', onResize );

	updateActive();

	return {
		update: updateActive,
		destroy() {
			if ( resizeTimeout ) {
				clearTimeout( resizeTimeout );
				resizeTimeout = null;
			}
			document.removeEventListener( 'click', onClick );
			window.removeEventListener( 'scroll', onScrollOrResize );
			window.removeEventListener( 'resize', onResize );
		},
	};
}

export default initSmartAnchorScroll;
