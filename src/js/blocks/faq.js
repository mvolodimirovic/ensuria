export function faqTab() {
	const items = document.querySelectorAll( '.faq__details' );
	if ( ! items.length ) return;

	items.forEach( ( item ) => {
		const detail = item.querySelector( '.faq__summary' );
		const wrap = item.querySelector( '.faq__text' );
		const inner = item.querySelector( '.faq__text-inner' );
		if ( ! detail || ! wrap || ! inner ) return;

		wrap.style.overflow = 'hidden';
		wrap.style.maxHeight = detail.classList.contains( 'open' )
			? inner.scrollHeight + 'px'
			: '0px';

		detail.addEventListener( 'click', ( e ) => {
			e.preventDefault();

			const isOpen = detail.classList.contains( 'open' );

			items.forEach( ( otherItem ) => {
				if ( otherItem === item ) return;
				const otherDetail = otherItem.querySelector( '.faq__summary' );
				const otherWrap = otherItem.querySelector( '.faq__text' );
				if ( otherDetail ) otherDetail.classList.remove( 'open' );
				if ( otherWrap ) otherWrap.style.maxHeight = '0px';
			} );

			if ( isOpen ) {
				detail.classList.remove( 'open' );
				wrap.style.maxHeight = '0px';
			} else {
				detail.classList.add( 'open' );
				wrap.style.maxHeight = inner.scrollHeight + 'px';
			}
		} );
	} );

	let resizeTimer;
	const recalc = () => {
		items.forEach( ( item ) => {
			const detail = item.querySelector( '.faq__summary' );
			const wrap = item.querySelector( '.faq__text' );
			const inner = item.querySelector( '.faq__text-inner' );
			if ( ! detail || ! wrap || ! inner ) return;
			if ( detail.classList.contains( 'open' ) ) {
				wrap.style.maxHeight = inner.scrollHeight + 'px';
			}
		} );
	};
	window.addEventListener( 'resize', () => {
		clearTimeout( resizeTimer );
		resizeTimer = setTimeout( recalc, 150 );
	} );
}
