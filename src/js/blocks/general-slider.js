export function initGenericSwipers( configs = [] ) {
	if ( typeof Swiper === 'undefined' ) return [];

	const DEFAULT_BREAKPOINTS = {
		320: { slidesPerView: 1.05, spaceBetween: 6 },
		575: { slidesPerView: 2, spaceBetween: 6 },
		768: { slidesPerView: 3, spaceBetween: 6 },
	};

	const DEFAULTS = {
		slidesPerView: 3,
		spaceBetween: 6,
		speed: 1000,
		a11y: { enabled: false },
		keyboard: { enabled: true },
	};

	function toArray( v ) {
		if ( ! v ) return [];
		if ( Array.isArray( v ) ) return v;
		return [ v ];
	}

	function resolveEl( scope, selectorOrEl ) {
		if ( ! selectorOrEl ) return null;
		if ( selectorOrEl instanceof Element ) return selectorOrEl;
		if ( typeof selectorOrEl === 'string' ) {
			if ( scope && scope.querySelector ) {
				const local = scope.querySelector( selectorOrEl );
				if ( local ) return local;
			}
			return document.querySelector( selectorOrEl );
		}
		return null;
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

		sw.on( 'init', update );
		sw.on( 'slideChange', update );
		sw.on( 'paginationUpdate', update );
		sw.on( 'slidesLengthChange', update );
		sw.on( 'resize', update );
		update();
	}

	function buildOptions( swiperContainerEl, cfg, blockSel ) {
		const name = cfg.name || '';
		const rootScope = cfg.scope
			? resolveEl( null, cfg.scope )
			: ( blockSel ? swiperContainerEl.closest( blockSel ) : null ) || document;

		const nextEl = resolveEl(
			rootScope,
			( cfg.navigation && cfg.navigation.nextEl ) ||
				( name ? `.${ name }-button-next` : null )
		);

		const prevEl = resolveEl(
			rootScope,
			( cfg.navigation && cfg.navigation.prevEl ) ||
				( name ? `.${ name }-button-prev` : null )
		);

		const pagEl = resolveEl(
			rootScope,
			( cfg.pagination && cfg.pagination.el ) ||
				( name ? `.${ name }-progress, .${ name }__progress` : null )
		);

		const navigation =
			cfg.navigation === false
				? false
				: { nextEl: nextEl || undefined, prevEl: prevEl || undefined };

		const pagination =
			cfg.pagination === false
				? false
				: {
						el: pagEl || undefined,
						type:
							( cfg.pagination && cfg.pagination.type ) ||
							'bullets',
						clickable:
							cfg.pagination &&
							typeof cfg.pagination.clickable !== 'undefined'
								? !! cfg.pagination.clickable
								: true,
				  };

		const breakpoints = cfg.breakpoints || DEFAULT_BREAKPOINTS;

		const options = {
			...DEFAULTS,
			slidesPerView:
				cfg.slidesPerView !== undefined
					? cfg.slidesPerView
					: DEFAULTS.slidesPerView,
			spaceBetween:
				cfg.spaceBetween !== undefined
					? cfg.spaceBetween
					: DEFAULTS.spaceBetween,
			speed: cfg.speed !== undefined ? cfg.speed : DEFAULTS.speed,
			a11y: cfg.a11y || DEFAULTS.a11y,
			keyboard: cfg.keyboard || DEFAULTS.keyboard,
			navigation: navigation || undefined,
			pagination: pagination || undefined,
			breakpoints: breakpoints,
		};

		if ( cfg.slidesPerGroup !== undefined ) options.slidesPerGroup = cfg.slidesPerGroup;
		if ( cfg.loop !== undefined ) options.loop = cfg.loop;
		if ( cfg.autoplay !== undefined ) options.autoplay = cfg.autoplay;

		return options;
	}

	function getDisableBelow( cfg ) {
		if ( ! cfg ) return null;
		if ( cfg.disableBelow === undefined || cfg.disableBelow === null ) return null;
		const v = Number( cfg.disableBelow );
		return Number.isFinite( v ) ? v : null;
	}

	function resolveSwiperContainerFromRoot( rootEl ) {
		if ( ! rootEl ) return null;

		const directWrapper = rootEl.querySelector( ':scope > .swiper-wrapper' );
		if ( directWrapper ) return rootEl;

		if ( rootEl.classList && rootEl.classList.contains( 'swiper' ) ) return rootEl;

		const nestedSwiper = rootEl.querySelector( '.swiper' );
		if ( nestedSwiper ) return nestedSwiper;

		const anyWrapper = rootEl.querySelector( '.swiper-wrapper' );
		if ( anyWrapper && anyWrapper.parentElement ) return anyWrapper.parentElement;

		return rootEl;
	}

	function resolveWrapper( swiperContainerEl ) {
		if ( ! swiperContainerEl ) return null;

		let wrapperEl =
			swiperContainerEl.querySelector( '[data-gs-wrapper="1"]' ) ||
			swiperContainerEl.querySelector( '.swiper-wrapper' );

		if ( ! wrapperEl ) {
			const anySlide =
				swiperContainerEl.querySelector( '[data-gs-slide="1"]' ) ||
				swiperContainerEl.querySelector( '.swiper-slide' );

			if ( anySlide && anySlide.parentElement ) wrapperEl = anySlide.parentElement;
		}

		if ( wrapperEl ) wrapperEl.setAttribute( 'data-gs-wrapper', '1' );

		return wrapperEl;
	}

	function resolveSlides( wrapperEl ) {
		if ( ! wrapperEl ) return [];
		const slides = Array.from( wrapperEl.children ).filter( ( n ) => n && n.nodeType === 1 );
		slides.forEach( ( s ) => s.setAttribute( 'data-gs-slide', '1' ) );
		return slides;
	}

	function resolveProgressEl( swiperContainerEl, cfg, blockSel ) {
		const name = cfg.name || '';
		const rootScope = cfg.scope
			? resolveEl( null, cfg.scope )
			: ( blockSel ? swiperContainerEl.closest( blockSel ) : null ) || document;

		const selector =
			( cfg.pagination && cfg.pagination.el ) ||
			( name ? `.${ name }-progress, .${ name }__progress` : null );

		return selector ? resolveEl( rootScope, selector ) : null;
	}

	function hideProgress( el ) {
		if ( ! el ) return;
		if ( ! el.hasAttribute( 'data-gs-prev-display' ) ) {
			el.setAttribute( 'data-gs-prev-display', el.style.display || '' );
		}
		el.style.display = 'none';
	}

	function showProgress( el ) {
		if ( ! el ) return;
		const prev = el.getAttribute( 'data-gs-prev-display' );
		el.style.display = prev !== null ? prev : '';
	}

	function applyDestroyedMarkup( rec ) {
		if ( ! rec || ! rec.containerEl ) return;

		const wrapperEl = rec.wrapperEl;
		const slides = rec.slideEls || [];

		if ( wrapperEl ) {
			wrapperEl.classList.add( 'is-destroy' );
			wrapperEl.removeAttribute( 'style' );
			wrapperEl.classList.add( 'swiper-wrapper' );
		}

		slides.forEach( ( s ) => {
			s.classList.remove( 'swiper-slide' );
			s.removeAttribute( 'style' );
		} );

		rec.containerEl.classList.remove(
			'swiper-initialized',
			'swiper-horizontal',
			'swiper-vertical',
			'swiper-backface-hidden',
			'swiper-grid',
			'swiper-grid-column'
		);

		rec.containerEl.removeAttribute( 'style' );
		hideProgress( rec.progressEl );
	}

	function applyMountedMarkup( rec ) {
		if ( ! rec || ! rec.containerEl ) return;

		const wrapperEl = rec.wrapperEl;
		const slides = rec.slideEls || [];

		if ( wrapperEl ) {
			wrapperEl.classList.remove( 'is-destroy' );
			wrapperEl.classList.add( 'swiper-wrapper' );
			wrapperEl.removeAttribute( 'style' );
		}

		slides.forEach( ( s ) => {
			s.classList.add( 'swiper-slide' );
			s.removeAttribute( 'style' );
		} );

		rec.containerEl.removeAttribute( 'style' );
		showProgress( rec.progressEl );
	}

	function getExistingSwiper( swiperContainerEl ) {
		if ( ! swiperContainerEl ) return null;
		return swiperContainerEl.swiper ? swiperContainerEl.swiper : null;
	}

	const instances = [];

	function ensureRecRefs( rec, cfg, blockSel ) {
		if ( rec._refsReady ) return;

		rec.wrapperEl = resolveWrapper( rec.containerEl );
		rec.slideEls = resolveSlides( rec.wrapperEl );
		rec.progressEl = resolveProgressEl( rec.containerEl, cfg, blockSel );
		rec._refsReady = true;
	}

	function mountOne( rec, cfg, blockSel ) {
		ensureRecRefs( rec, cfg, blockSel );

		const existing = getExistingSwiper( rec.containerEl );
		if ( existing ) {
			rec.swiper = existing;
			return;
		}

		if ( rec.swiper ) return;

		applyMountedMarkup( rec );

		const options = buildOptions( rec.containerEl, cfg, blockSel );
		const sw = new Swiper( rec.containerEl, options );

		if ( options.pagination && options.pagination.el ) attachAfterIndicator( sw );

		rec.swiper = sw;
	}

	function unmountOne( rec, cfg, blockSel ) {
		ensureRecRefs( rec, cfg, blockSel );

		const sw = rec.swiper || getExistingSwiper( rec.containerEl );
		if ( sw ) sw.destroy( true, true );

		rec.swiper = null;
		applyDestroyedMarkup( rec );
	}

	function bindLifecycle( recs, cfg, blockSel, disableBelow ) {
		const mq = window.matchMedia( `(max-width: ${ disableBelow }px)` );
		const key = '__gs_bound';

		const apply = () => {
			const isMobile = mq.matches;
			recs.forEach( ( rec ) => {
				if ( isMobile ) {
					unmountOne( rec, cfg, blockSel );
					return;
				}
				mountOne( rec, cfg, blockSel );
			} );
		};

		recs.forEach( ( rec ) => {
			if ( rec.rootEl && rec.rootEl[ key ] ) return;
			if ( rec.rootEl ) rec.rootEl[ key ] = true;
		} );

		apply();

		if ( typeof mq.addEventListener === 'function' ) {
			mq.addEventListener( 'change', apply );
		} else if ( typeof mq.addListener === 'function' ) {
			mq.addListener( apply );
		}

		window.addEventListener(
			'resize',
			() => window.requestAnimationFrame( apply ),
			{ passive: true }
		);

		window.addEventListener(
			'orientationchange',
			() => window.requestAnimationFrame( apply ),
			{ passive: true }
		);
	}

	for ( const rawCfg of toArray( configs ) ) {
		if ( ! rawCfg || ( typeof rawCfg !== 'string' && typeof rawCfg !== 'object' ) ) continue;

		const cfg = typeof rawCfg === 'string' ? { name: rawCfg } : rawCfg;
		const name = cfg.name || '';
		const blockSel = cfg.blockSelector || ( name ? `.${ name }` : null );

		const containerSel = cfg.containerSelector || ( name ? `.${ name }__slider` : null );
		if ( ! containerSel ) continue;

		const roots = document.querySelectorAll( containerSel );
		if ( ! roots.length ) continue;

		const recs = [];

		roots.forEach( ( rootEl ) => {
			const swiperContainerEl = resolveSwiperContainerFromRoot( rootEl );
			if ( ! swiperContainerEl ) return;

			const rec = {
				name: name || containerSel,
				rootEl: rootEl,
				containerEl: swiperContainerEl,
				wrapperEl: null,
				slideEls: [],
				progressEl: null,
				swiper: null,
				_refsReady: false,
			};

			recs.push( rec );
			instances.push( {
				name: rec.name,
				el: rec.containerEl,
				swiper: rec.swiper,
			} );
		} );

		if ( ! recs.length ) continue;

		const disableBelow = getDisableBelow( cfg );

		if ( disableBelow !== null ) {
			bindLifecycle( recs, cfg, blockSel, disableBelow );
			continue;
		}

		recs.forEach( ( rec ) => mountOne( rec, cfg, blockSel ) );
	}

	return instances;
}
