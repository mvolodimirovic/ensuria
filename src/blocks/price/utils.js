import {
	EASING,
	PX_PER_SECOND,
	MIN_DUR,
	MAX_DUR,
	PREF_REDUCED,
} from './config';

export const qs = ( el, sel ) => ( el || document ).querySelector( sel );
export const qsa = ( el, sel ) =>
	Array.prototype.slice.call( ( el || document ).querySelectorAll( sel ) );
export const on = ( el, type, handler, opts ) =>
	el && el.addEventListener( type, handler, opts );

export function durationFor( heightPx ) {
	let ms = ( heightPx / PX_PER_SECOND ) * 1000;
	if ( ms < MIN_DUR ) ms = MIN_DUR;
	if ( ms > MAX_DUR ) ms = MAX_DUR;
	return ms;
}

function setTransition( el, ms ) {
	el.style.transitionProperty = 'height';
	el.style.transitionTimingFunction = EASING;
	el.style.transitionDuration = ms + 'ms';
}
function clearTransition( el ) {
	el.style.transitionProperty = '';
	el.style.transitionTimingFunction = '';
	el.style.transitionDuration = '';
}

export function slideOpen( wrap ) {
	const inner = qs( wrap, '.aside__filter__inner' );
	if ( ! inner || inner.getAttribute( 'data-animating' ) === '1' ) return;
	if ( PREF_REDUCED ) {
		wrap.classList.add( 'open' );
		inner.style.height = 'auto';
		inner.style.display = 'flex';
		inner.style.flexDirection = 'column';
		return;
	}
	inner.setAttribute( 'data-animating', '1' );
	const startH = inner.offsetHeight;
	inner.style.display = 'flex';
	inner.style.flexDirection = 'column';
	inner.style.height = startH + 'px';
	void inner.offsetHeight;
	const targetH = inner.scrollHeight;
	setTransition( inner, durationFor( targetH ) );
	inner.style.height = targetH + 'px';
	wrap.classList.add( 'open' );
	const onEnd = ( e ) => {
		if ( e.propertyName !== 'height' ) return;
		inner.removeEventListener( 'transitionend', onEnd );
		clearTransition( inner );
		inner.style.height = 'auto';
		inner.setAttribute( 'data-animating', '0' );
	};
	inner.addEventListener( 'transitionend', onEnd );
}

export function slideClose( wrap ) {
	const inner = qs( wrap, '.aside__filter__inner' );
	if ( ! inner || inner.getAttribute( 'data-animating' ) === '1' ) return;
	if ( PREF_REDUCED ) {
		wrap.classList.remove( 'open' );
		inner.style.height = '0px';
		inner.style.display = 'flex';
		inner.style.flexDirection = 'column';
		return;
	}
	inner.setAttribute( 'data-animating', '1' );
	const currentH = inner.scrollHeight;
	inner.style.height = currentH + 'px';
	void inner.offsetHeight;
	setTransition( inner, durationFor( currentH ) );
	inner.style.height = '0px';
	wrap.classList.remove( 'open' );
	const onEnd = ( e ) => {
		if ( e.propertyName !== 'height' ) return;
		inner.removeEventListener( 'transitionend', onEnd );
		clearTransition( inner );
		inner.setAttribute( 'data-animating', '0' );
	};
	inner.addEventListener( 'transitionend', onEnd );
}

export function closeAllParentsExcept( container, exceptWrap ) {
	qsa( container, '.aside__filter__wrapper.has-children.open' ).forEach(
		( w ) => {
			if ( ! exceptWrap || w !== exceptWrap ) slideClose( w );
		}
	);
}
