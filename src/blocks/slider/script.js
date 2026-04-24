import Swiper from 'swiper';
import { Navigation, Pagination, A11y, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './style.scss';

if (
	( document.readyState === 'complete' ||
		document.readyState !== 'loading' ) &&
	! document.documentElement.doScroll
) {
	sliderBlockGutenberg();
} else {
	document.addEventListener( 'DOMContentLoaded', sliderBlockGutenberg );
}

function attachAfterIndicator( sw ) {
	const pag = sw && sw.pagination && sw.pagination.el;
	if ( ! pag ) return;

	const update = () => {
		const bullets = pag.querySelectorAll( '.swiper-pagination-bullet' );
		if ( ! bullets.length ) {
			pag.style.setProperty( '--thumb-w', '0px' );
			pag.style.setProperty( '--thumb-x', '0px' );
			return;
		}
		const idx = Math.min(
			sw.realIndex ?? sw.activeIndex ?? 0,
			bullets.length - 1
		);
		const b = bullets[ idx ];
		if ( ! b ) return;
		const pr = pag.getBoundingClientRect();
		const br = b.getBoundingClientRect();
		const w = br.width;
		const x = br.left - pr.left + br.width / 2 - w / 2;
		pag.style.setProperty( '--thumb-w', `${ w }px` );
		pag.style.setProperty( '--thumb-x', `${ x }px` );
	};

	const resizeOptions = { passive: true };

	sw.on( 'init', update );
	sw.on( 'slideChange', update );
	sw.on( 'paginationUpdate', update );
	sw.on( 'slidesLengthChange', update );
	sw.on( 'resize', update );

	window.addEventListener( 'resize', update, resizeOptions );

	// Cleanup when swiper is destroyed
	sw.on( 'destroy', () => {
		window.removeEventListener( 'resize', update, resizeOptions );
	} );

	update();
}

function sliderBlockGutenberg() {
	const gallery = document.querySelectorAll( '.gallery' );
	if ( ! gallery.length ) return;

	gallery.forEach( ( slider ) => {
		if ( slider.swiper ) return;

		const nextBtn = slider.parentElement.querySelector(
			'.slider-button-next'
		);
		const prevBtn = slider.parentElement.querySelector(
			'.slider-button-prev'
		);
		const paginationEl = slider.parentElement.nextElementSibling;

		const slidesCount = slider.querySelectorAll( '.swiper-slide' ).length;
		const enableLoop = slidesCount >= 4;

		const BREAKPOINTS = {
			1: { slidesPerView: 1.08, slidesPerGroup: 1, spaceBetween: 6 },
			576: { slidesPerView: 2, slidesPerGroup: 1, spaceBetween: 6 },
			1024: { slidesPerView: 3, slidesPerGroup: 1, spaceBetween: 6 },
		};

		const sw = new Swiper( slider, {
			modules: [ Navigation, Pagination, A11y, Keyboard ],
			spaceBetween: 6,
			slidesPerView: 3,
			slidesPerGroup: 1,
			speed: 1000,
			loop: enableLoop,
			a11y: { enabled: true },
			keyboard: { enabled: true },
			preloadImages: false,
			pagination: {
				el: paginationEl,
				type: 'bullets',
			},
			breakpoints: BREAKPOINTS,
			navigation:
				nextBtn && prevBtn
					? { nextEl: nextBtn, prevEl: prevBtn }
					: undefined,
		} );

		attachAfterIndicator( sw );
	} );
}
