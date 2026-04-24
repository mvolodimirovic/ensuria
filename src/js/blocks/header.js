export function hideHeaderOnScroll( selector = '#header' ) {
	const headerEl =
		document.querySelector( selector ) ||
		document.querySelector( '.header' );
	const headerTop = document.querySelector( '.header__top' );
	const headerBanner = document.querySelector( '.header__banner' );
	const menuItems = Array.from(
		document.querySelectorAll( '.menu-item-has-children' )
	);
	const mainEl = document.querySelector( '.main' );

	let lastScrollY = window.scrollY;
	let ticking = false;
	let hovered = 0;
	let hoverBound = false;
	const mq = window.matchMedia( '(min-width: 1024px)' );

	let padRAF = null;
	let headerRO = null;
	let destroyed = false;
	let scrollRAF = null;

	function applyMainPadding() {
		padRAF = null;
		if ( destroyed ) return;
		if ( ! headerEl || ! mainEl ) return;
		const h = Math.ceil( headerEl.getBoundingClientRect().height || 0 );
		mainEl.style.paddingTop = h > 0 ? `${ h }px` : '';
	}

	function scheduleMainPadding() {
		if ( destroyed ) return;
		if ( ! headerEl || ! mainEl ) return;
		if ( padRAF ) return;
		padRAF = requestAnimationFrame( applyMainPadding );
	}

	function handleEnter() {
		hovered += 1;
		if ( hovered > 0 && mainEl ) {
			mainEl.classList.add( 'modal-view' );
		}
	}

	function handleLeave() {
		hovered = Math.max( 0, hovered - 1 );
		if ( hovered === 0 && mainEl ) {
			mainEl.classList.remove( 'modal-view' );
		}
	}

	function bindHover() {
		if ( hoverBound ) return;
		menuItems.forEach( ( item ) => {
			item.addEventListener( 'mouseenter', handleEnter );
			item.addEventListener( 'mouseleave', handleLeave );
		} );
		hoverBound = true;
	}

	function unbindHover() {
		if ( ! hoverBound ) return;
		menuItems.forEach( ( item ) => {
			item.removeEventListener( 'mouseenter', handleEnter );
			item.removeEventListener( 'mouseleave', handleLeave );
		} );
		hoverBound = false;
		hovered = 0;
		if ( mainEl ) mainEl.classList.remove( 'modal-view' );
	}

	function applyMQ( e ) {
		if ( destroyed ) return;
		if ( e.matches ) {
			bindHover();
		} else {
			unbindHover();
		}
	}

	function onScroll() {
		if ( destroyed ) return;
		if ( ! headerTop && ! headerBanner ) return;

		if ( ! ticking ) {
			scrollRAF = window.requestAnimationFrame( updateHeader );
			ticking = true;
		}
	}

	function updateHeader() {
		scrollRAF = null;

		if ( destroyed ) {
			ticking = false;
			return;
		}

		const currentScrollY = window.scrollY;
		const shouldHide = currentScrollY > lastScrollY && currentScrollY > 100;

		if ( headerTop || headerBanner ) {
			const topHidden = headerTop
				? headerTop.classList.contains( 'header__top--hidden' )
				: false;
			const bannerHidden = headerBanner
				? headerBanner.classList.contains( 'header__top--hidden' )
				: false;

			if ( shouldHide ) {
				let changed = false;

				if ( headerTop && ! topHidden ) {
					headerTop.classList.add( 'header__top--hidden' );
					changed = true;
				}

				if ( headerBanner && ! bannerHidden ) {
					headerBanner.classList.add( 'header__top--hidden' );
					changed = true;
				}

				if ( changed ) scheduleMainPadding();
			} else {
				let changed = false;

				if ( headerTop && topHidden ) {
					headerTop.classList.remove( 'header__top--hidden' );
					changed = true;
				}

				if ( headerBanner && bannerHidden ) {
					headerBanner.classList.remove( 'header__top--hidden' );
					changed = true;
				}

				if ( changed ) scheduleMainPadding();
			}
		}

		lastScrollY = currentScrollY;
		ticking = false;
	}

	function destroy() {
		if ( destroyed ) return;
		destroyed = true;

		window.removeEventListener( 'resize', scheduleMainPadding );
		window.removeEventListener( 'scroll', onScroll );

		if ( mq ) {
			if ( typeof mq.removeEventListener === 'function' )
				mq.removeEventListener( 'change', applyMQ );
			else if ( typeof mq.removeListener === 'function' )
				mq.removeListener( applyMQ );
		}

		unbindHover();

		if ( headerRO ) {
			headerRO.disconnect();
			headerRO = null;
		}

		if ( padRAF ) {
			cancelAnimationFrame( padRAF );
			padRAF = null;
		}

		if ( scrollRAF ) {
			cancelAnimationFrame( scrollRAF );
			scrollRAF = null;
		}

		ticking = false;

		if ( mainEl ) {
			mainEl.style.paddingTop = '';
			mainEl.classList.remove( 'modal-view' );
		}
	}

	scheduleMainPadding();

	if ( window.ResizeObserver && headerEl ) {
		headerRO = new ResizeObserver( () => scheduleMainPadding() );
		try {
			headerRO.observe( headerEl );
		} catch {}
	}

	if (
		document.fonts &&
		document.fonts.ready &&
		typeof document.fonts.ready.then === 'function'
	) {
		document.fonts.ready
			.then( () => scheduleMainPadding() )
			.catch( () => {} );
	}

	window.addEventListener( 'resize', scheduleMainPadding );

	applyMQ( mq );

	if ( mq ) {
		if ( typeof mq.addEventListener === 'function' )
			mq.addEventListener( 'change', applyMQ );
		else if ( typeof mq.addListener === 'function' )
			mq.addListener( applyMQ );
	}

	window.addEventListener( 'scroll', onScroll );

	( function () {
		if ( ! Element.prototype.matches )
			Element.prototype.matches =
				Element.prototype.msMatchesSelector ||
				Element.prototype.webkitMatchesSelector;
		if ( ! Node.prototype.closest )
			Node.prototype.closest = function ( sel ) {
				var el = this.nodeType === 1 ? this : this.parentElement;
				while ( el && el.nodeType === 1 ) {
					if ( el.matches && el.matches( sel ) ) return el;
					el = el.parentElement;
				}
				return null;
			};

		if ( window.__ensHeaderInit ) return;
		window.__ensHeaderInit = true;

		const CFG = {
			selectors: {
				burger: '.header__burger',
				openModalTrigger: '.open-modal',
				reviewBtn: '.reviews__item-btn',
				reviewText: '.reviews__item__text p',
			},
			modal: {
				root: '.modal',
				bg: '.modal__bg',
				wrap: '.modal__wrapper',
				closeBtn: '.modal__close',
				showClass: 'modal--show',
				slugAttr: 'data-modal-slug',
				defaultSlug: 'contact',
				removeDelay: 300,
			},
			menu: {
				rootShowClass: 'header-mobile--show',
				panelSelector: '.header-mobile__wrapper',
				removeDelay: 300,
				duration: 300,
				easing: 'ease',
				translateClose: 'translate3d(100%,0,0)',
				loaderClass: 'header-mobile__loader',
				openGuardMs: 350,
				storageTTL: 3600,
				storageKey: 'ens:menu:v1',
			},
			ajax: {
				urlVar: 'appAjax',
				nonceKey: 'ajax-fragments',
				actionModal: 'get_modal',
				actionMenu: 'get_mobile_menu',
				method: 'POST',
			},
			behavior: {
				lockBodyClass: 'no-scroll',
				viewFlagClass: 'modal-view',
				enableCache: true,
				minSpinnerMs: 0,
				storageTTL: 3600,
				maxLines: 6,
			},
		};

		function nextFrame( fn ) {
			requestAnimationFrame( () => requestAnimationFrame( fn ) );
		}

		const ajaxCtx = window[ CFG.ajax.urlVar ];
		if (
			! ajaxCtx ||
			! ajaxCtx.url ||
			( ! ajaxCtx.nonce && ! ajaxCtx.nonces )
		) {
			return;
		}

		function resolveNonce( key ) {
			const nonces = ( ajaxCtx && ajaxCtx.nonces ) || {};
			if ( nonces[ key ] ) return nonces[ key ];
			const camel = key.replace( /-([a-z])/g, ( _, c ) =>
				c.toUpperCase()
			);
			if ( nonces[ camel ] ) return nonces[ camel ];
			return ( ajaxCtx && ajaxCtx.nonce ) || '';
		}

		const body = document.body;
		const add = ( n, c ) => n && n.classList.add( c );
		const rm = ( n, c ) => n && n.classList.remove( c );

		function createHTML( html ) {
			if ( ! html || typeof html !== 'string' ) return null;
			const tmp = document.createElement( 'div' );
			tmp.innerHTML = html.trim();
			return tmp.firstElementChild || null;
		}

		function afterTransition( el, fallbackMs ) {
			return new Promise( ( resolve ) => {
				if ( ! el ) return resolve();
				let done = false;
				const finish = () => {
					if ( done ) return;
					done = true;
					el.removeEventListener( 'transitionend', onEnd, true );
					clearTimeout( tid );
					resolve();
				};
				const onEnd = ( ev ) => {
					if ( ev.target === el ) finish();
				};
				const tid = setTimeout( finish, fallbackMs );
				el.addEventListener( 'transitionend', onEnd, true );
			} );
		}

		function storageKey( slug, params = {} ) {
			const id = params ? params.video_id || params.post_id || '' : '';
			return 'ens:modal:' + slug + ( id ? ':' + id : '' );
		}

		function storageGet( slug, params = {} ) {
			try {
				const raw = localStorage.getItem( storageKey( slug, params ) );
				if ( ! raw ) return null;
				const obj = JSON.parse( raw );
				if ( ! obj || ! obj.t || ! obj.h ) return null;
				if ( Date.now() / 1000 - obj.t > CFG.behavior.storageTTL )
					return null;
				return String( obj.h );
			} catch {
				return null;
			}
		}

		function storageSet( slug, params = {}, html ) {
			try {
				localStorage.setItem(
					storageKey( slug, params ),
					JSON.stringify( {
						t: Math.floor( Date.now() / 1000 ),
						h: String( html || '' ),
					} )
				);
			} catch {}
		}

		function menuStorageGet() {
			try {
				const raw = localStorage.getItem( CFG.menu.storageKey );
				if ( ! raw ) return null;
				const obj = JSON.parse( raw );
				if ( ! obj || ! obj.t || ! obj.h ) return null;
				if ( Date.now() / 1000 - obj.t > CFG.menu.storageTTL )
					return null;
				return String( obj.h );
			} catch {
				return null;
			}
		}

		function menuStorageSet( html ) {
			try {
				localStorage.setItem(
					CFG.menu.storageKey,
					JSON.stringify( {
						t: Math.floor( Date.now() / 1000 ),
						h: String( html || '' ),
					} )
				);
			} catch {}
		}

		async function fetchFragment( action, params = {} ) {
			const fd = new FormData();
			fd.append( 'action', action );
			fd.append( 'nonce', resolveNonce( CFG.ajax.nonceKey ) );
			for ( const k in params ) {
				if ( Object.prototype.hasOwnProperty.call( params, k ) ) {
					fd.append( k, params[ k ] );
				}
			}
			const res = await fetch( ajaxCtx.url, {
				method: CFG.ajax.method || 'POST',
				credentials: 'same-origin',
				body: fd,
				keepalive: true,
				cache: 'no-store',
			} );
			if ( ! res.ok ) throw new Error( String( res.status ) );
			const raw = await res.text();
			try {
				const json = JSON.parse( raw );
				if (
					json &&
					json.success &&
					json.data &&
					typeof json.data.html === 'string'
				)
					return json.data.html;
				if ( json && typeof json === 'object' && json.html )
					return String( json.html );
				throw new Error( 'bad json' );
			} catch {
				if ( raw.trim().startsWith( '<' ) ) return raw;
				throw new Error( 'bad payload' );
			}
		}

		const once = ( fn ) => {
			let done = false;
			return ( ...a ) => {
				if ( done ) return;
				done = true;
				fn( ...a );
			};
		};

		const preconnectAjax = once( () => {
			try {
				const u = new URL( ajaxCtx.url, location.href );
				const o = u.origin;
				const h =
					document.head ||
					document.getElementsByTagName( 'head' )[ 0 ];
				const l1 = document.createElement( 'link' );
				l1.rel = 'preconnect';
				l1.href = o;
				const l2 = document.createElement( 'link' );
				l2.rel = 'dns-prefetch';
				l2.href = o;
				h.appendChild( l2 );
				h.appendChild( l1 );
			} catch {}
		} );

		function isVideoSlug( slug ) {
			return slug === 'video';
		}

		function prepareSelfVideo( root ) {
			if ( ! root ) return;
			const v = root.querySelector( 'video' );
			if ( ! v ) return;
			v.setAttribute( 'playsinline', '' );
			v.setAttribute( 'preload', 'none' );
			const sources = v.querySelectorAll( 'source[src]' );
			sources.forEach( ( s ) => {
				s.dataset.src = s.getAttribute( 'src' );
				s.removeAttribute( 'src' );
			} );
			if ( v.getAttribute( 'src' ) ) {
				v.dataset.src = v.getAttribute( 'src' );
				v.removeAttribute( 'src' );
			}
			root.classList.add( 'is-video' );
		}

		function mountSelfVideo( root ) {
			if ( ! root ) return;
			const v = root.querySelector( 'video' );
			if ( ! v ) return;
			const sources = v.querySelectorAll( 'source[data-src]' );
			sources.forEach( ( s ) => s.setAttribute( 'src', s.dataset.src ) );
			if ( ! v.getAttribute( 'src' ) && v.dataset.src ) {
				v.setAttribute( 'src', v.dataset.src );
			}
			v.load();
			if ( v.muted || v.hasAttribute( 'muted' ) ) {
				v.play().catch( () => {} );
			}
		}

		function teardownSelfVideo( root ) {
			if ( ! root ) return;
			const v = root.querySelector( 'video' );
			if ( ! v ) return;
			v.pause();
			if ( v.getAttribute( 'src' ) ) {
				v.dataset.src = v.getAttribute( 'src' );
				v.removeAttribute( 'src' );
			}
			const sources = v.querySelectorAll( 'source[src]' );
			sources.forEach( ( s ) => {
				s.dataset.src = s.getAttribute( 'src' );
				s.removeAttribute( 'src' );
			} );
		}

		function createModalShell( slug ) {
			const root = document.createElement( 'div' );
			root.className = 'modal modal--loading';
			root.setAttribute( CFG.modal.slugAttr, slug );
			root.innerHTML =
				'<div class="modal__bg modal__bg--blur"></div>' +
				'<div class="modal__wrapper" aria-busy="true">' +
				'<button type="button" class="modal__close" aria-label="Close"></button>' +
				'<div class="modal__body" data-modal-body><div class="modal__loader" aria-hidden="true"></div></div>' +
				'</div>';
			return root;
		}

		function eventTargetElement( e ) {
			if ( ! e ) return null;
			if ( typeof e.composedPath === 'function' ) {
				try {
					const path = e.composedPath();
					for ( let i = 0; i < path.length; i++ ) {
						const n = path[ i ];
						if ( n && n.nodeType === 1 ) return n;
					}
				} catch {}
			}
			let t = e.target || e.srcElement;
			if ( ! t ) return null;
			if ( t.nodeType === 1 ) return t;
			return t.parentElement || null;
		}

		function closestFromEvent( e, sel ) {
			const el = eventTargetElement( e );
			return el && el.closest ? el.closest( sel ) : null;
		}

		const _peFrozen = new Set();
		const _swipersFrozen = new Set();
		const _swiperStates = new WeakMap();
		const _specificSwipersFrozen = new Set();
		const _specificSwiperStates = new WeakMap();

		function ensureFreezeCSS() {
			if ( document.getElementById( 'ens-pe-style' ) ) return;
			const s = document.createElement( 'style' );
			s.id = 'ens-pe-style';
			s.textContent =
				'.ens-pe-none{pointer-events:none!important}.ens-modal-lock .swiper-wrapper{pointer-events:none!important}';
			document.head.appendChild( s );
		}

		function pauseBackgroundCarousels() {
			ensureFreezeCSS();
			add( body, 'ens-modal-lock' );
			document.querySelectorAll( '.swiper-wrapper' ).forEach( ( el ) => {
				if ( _peFrozen.has( el ) ) return;
				el.classList.add( 'ens-pe-none' );
				_peFrozen.add( el );
			} );
			document
				.querySelectorAll(
					'.swiper, .swiper-container, .swiper-initialized'
				)
				.forEach( ( container ) => {
					const inst = container.swiper || container._swiper;
					if ( ! inst || _swipersFrozen.has( inst ) ) return;
					const state = {
						enabled:
							typeof inst.enabled === 'boolean'
								? inst.enabled
								: true,
						autoplay: !! (
							inst.autoplay &&
							( inst.autoplay.running ||
								( inst.params && inst.params.autoplay ) )
						),
						keyboard: !! ( inst.keyboard && inst.keyboard.enabled ),
						mousewheel: !! (
							inst.mousewheel && inst.mousewheel.enabled
						),
						allowTouchMove:
							inst.params && inst.params.allowTouchMove !== false,
						detached: false,
					};
					_swiperStates.set( inst, state );
					try {
						inst.autoplay &&
							inst.autoplay.stop &&
							inst.autoplay.stop();
					} catch {}
					try {
						inst.keyboard &&
							inst.keyboard.disable &&
							inst.keyboard.disable();
					} catch {}
					try {
						inst.mousewheel &&
							inst.mousewheel.disable &&
							inst.mousewheel.disable();
					} catch {}
					try {
						if ( inst.params ) inst.params.allowTouchMove = false;
						inst.allowTouchMove = false;
					} catch {}
					try {
						inst.disable && inst.disable();
					} catch {}
					try {
						inst.detachEvents && inst.detachEvents();
						state.detached = true;
					} catch {}
					_swipersFrozen.add( inst );
				} );
			try {
				document.activeElement &&
					document.activeElement.blur &&
					document.activeElement.blur();
				const evs = [
					'pointercancel',
					'mouseup',
					'touchcancel',
					'touchend',
				];
				evs.forEach( ( t ) =>
					document.dispatchEvent(
						new Event( t, { bubbles: true, cancelable: true } )
					)
				);
			} catch {}
		}

		function resumeBackgroundCarousels() {
			rm( body, 'ens-modal-lock' );
			_peFrozen.forEach( ( el ) => el.classList.remove( 'ens-pe-none' ) );
			_peFrozen.clear();
			_swipersFrozen.forEach( ( inst ) => {
				const s = _swiperStates.get( inst ) || {};
				try {
					s.detached && inst.attachEvents && inst.attachEvents();
				} catch {}
				try {
					s.enabled && inst.enable && inst.enable();
				} catch {}
				try {
					if ( s.allowTouchMove && inst.params ) {
						inst.params.allowTouchMove = true;
						inst.allowTouchMove = true;
					}
				} catch {}
				try {
					if ( s.keyboard && inst.keyboard && inst.keyboard.enable )
						inst.keyboard.enable();
				} catch {}
				try {
					if (
						s.mousewheel &&
						inst.mousewheel &&
						inst.mousewheel.enable
					)
						inst.mousewheel.enable();
				} catch {}
				try {
					if ( s.autoplay && inst.autoplay && inst.autoplay.start )
						inst.autoplay.start();
				} catch {}
				_swiperStates.delete( inst );
			} );
			_swipersFrozen.clear();
		}

		function pauseSpecificSwiper( triggerElement ) {
			if ( ! triggerElement ) return null;

			const reviewItem = triggerElement.closest( '.reviews__item' );
			if ( ! reviewItem ) return null;

			const swiperContainer = reviewItem.closest(
				'.swiper, .swiper-container, .swiper-initialized'
			);
			if ( ! swiperContainer ) return null;

			const inst = swiperContainer.swiper || swiperContainer._swiper;
			if ( ! inst || _specificSwipersFrozen.has( inst ) ) return inst;

			const state = {
				enabled:
					typeof inst.enabled === 'boolean' ? inst.enabled : true,
				autoplay: !! (
					inst.autoplay &&
					( inst.autoplay.running ||
						( inst.params && inst.params.autoplay ) )
				),
				keyboard: !! ( inst.keyboard && inst.keyboard.enabled ),
				mousewheel: !! ( inst.mousewheel && inst.mousewheel.enabled ),
				allowTouchMove:
					inst.params && inst.params.allowTouchMove !== false,
				detached: false,
			};

			_specificSwiperStates.set( inst, state );

			try {
				inst.autoplay && inst.autoplay.stop && inst.autoplay.stop();
			} catch {}
			try {
				inst.keyboard &&
					inst.keyboard.disable &&
					inst.keyboard.disable();
			} catch {}
			try {
				inst.mousewheel &&
					inst.mousewheel.disable &&
					inst.mousewheel.disable();
			} catch {}
			try {
				if ( inst.params ) inst.params.allowTouchMove = false;
				inst.allowTouchMove = false;
			} catch {}
			try {
				inst.disable && inst.disable();
			} catch {}
			try {
				inst.detachEvents && inst.detachEvents();
				state.detached = true;
			} catch {}

			_specificSwipersFrozen.add( inst );

			return inst;
		}

		function resumeSpecificSwiper( swiperInstance ) {
			if (
				! swiperInstance ||
				! _specificSwipersFrozen.has( swiperInstance )
			)
				return;

			const s = _specificSwiperStates.get( swiperInstance ) || {};

			try {
				s.detached &&
					swiperInstance.attachEvents &&
					swiperInstance.attachEvents();
			} catch {}
			try {
				s.enabled && swiperInstance.enable && swiperInstance.enable();
			} catch {}
			try {
				if ( s.allowTouchMove && swiperInstance.params ) {
					swiperInstance.params.allowTouchMove = true;
					swiperInstance.allowTouchMove = true;
				}
			} catch {}
			try {
				if (
					s.keyboard &&
					swiperInstance.keyboard &&
					swiperInstance.keyboard.enable
				)
					swiperInstance.keyboard.enable();
			} catch {}
			try {
				if (
					s.mousewheel &&
					swiperInstance.mousewheel &&
					swiperInstance.mousewheel.enable
				)
					swiperInstance.mousewheel.enable();
			} catch {}
			try {
				if (
					s.autoplay &&
					swiperInstance.autoplay &&
					swiperInstance.autoplay.start
				)
					swiperInstance.autoplay.start();
			} catch {}

			_specificSwiperStates.delete( swiperInstance );
			_specificSwipersFrozen.delete( swiperInstance );
		}

		const Modal = ( () => {
			let modalEl = null;
			let isClosing = false;
			let untrap = null;
			let unbindModalEvents = null;
			let blockedSwiperInstance = null;
			const cache = new Map();
			const inflight = new Map();

			function isOpen() {
				return (
					!! modalEl &&
					modalEl.classList.contains( CFG.modal.showClass ) &&
					! isClosing
				);
			}

			function trapFocus( container ) {
				if ( ! container ) return () => {};
				const focusable = container.querySelectorAll(
					'a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])'
				);
				if ( ! focusable.length ) return () => {};
				const first = focusable[ 0 ];
				const last = focusable[ focusable.length - 1 ];
				function onKey( e ) {
					if ( e.key !== 'Tab' ) return;
					if ( e.shiftKey && document.activeElement === first ) {
						e.preventDefault();
						last.focus();
					} else if (
						! e.shiftKey &&
						document.activeElement === last
					) {
						e.preventDefault();
						first.focus();
					}
				}
				container.addEventListener( 'keydown', onKey );
				return () => container.removeEventListener( 'keydown', onKey );
			}

			function focusInside( root ) {
				if ( ! root ) return;
				const t = root.querySelector(
					'[data-autofocus], input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
				);
				if ( t && typeof t.focus === 'function' ) {
					try {
						t.focus();
					} catch {}
				}
			}

			function bindModalEvents( root ) {
				if ( ! root ) return () => {};
				const bg = root.querySelector( CFG.modal.bg );
				const wrap = root.querySelector( CFG.modal.wrap );
				const stopAll = ( e ) => {
					e.preventDefault();
					e.stopImmediatePropagation();
				};
				const blockOutside = ( e ) => {
					if ( ! isOpen() ) return;
					if ( ! wrap || ! wrap.contains( e.target ) ) stopAll( e );
				};
				const optsPassiveFalse = { passive: false };
				const optsCaptureBlock = { passive: false, capture: true };
				if ( bg ) {
					bg.addEventListener(
						'touchstart',
						stopAll,
						optsPassiveFalse
					);
					bg.addEventListener(
						'touchmove',
						stopAll,
						optsPassiveFalse
					);
					bg.addEventListener(
						'pointerdown',
						stopAll,
						optsPassiveFalse
					);
					bg.addEventListener(
						'pointermove',
						stopAll,
						optsPassiveFalse
					);
					bg.addEventListener( 'wheel', stopAll, optsPassiveFalse );
				}
				document.addEventListener(
					'touchstart',
					blockOutside,
					optsCaptureBlock
				);
				document.addEventListener(
					'touchmove',
					blockOutside,
					optsCaptureBlock
				);
				document.addEventListener(
					'pointerdown',
					blockOutside,
					optsCaptureBlock
				);
				document.addEventListener(
					'pointermove',
					blockOutside,
					optsCaptureBlock
				);
				document.addEventListener(
					'wheel',
					blockOutside,
					optsCaptureBlock
				);

				const isEditable = ( el ) => {
					if ( ! el ) return false;
					if ( el.isContentEditable ) return true;
					const tag = String( el.tagName || '' ).toUpperCase();
					return (
						tag === 'INPUT' ||
						tag === 'TEXTAREA' ||
						tag === 'SELECT'
					);
				};

				const onKeyBlock = ( e ) => {
					if ( ! isOpen() ) return;
					if ( e.key === 'Escape' ) return;

					if ( isEditable( e.target ) ) return;

					const blocked = [
						'ArrowLeft',
						'ArrowRight',
						'ArrowUp',
						'ArrowDown',
						'PageUp',
						'PageDown',
						'Home',
						'End',
						' ',
					];
					if ( blocked.includes( e.key ) ) {
						e.preventDefault();
						e.stopImmediatePropagation();
					}
				};
				document.addEventListener( 'keydown', onKeyBlock, true );
				window.addEventListener( 'keydown', onKeyBlock, true );

				function onBgClick( e ) {
					e.preventDefault();
					close();
				}
				function onCloseClick( e ) {
					const btn = closestFromEvent( e, CFG.modal.closeBtn );
					if ( btn ) {
						e.preventDefault();
						close();
					}
				}
				function onDown( downEvt ) {
					if ( ! isOpen() ) return;
					const outside = wrap && ! wrap.contains( downEvt.target );
					if ( ! outside ) return;
					function onUp( upEvt ) {
						document.removeEventListener( 'mouseup', onUp, true );
						if ( wrap && ! wrap.contains( upEvt.target ) ) close();
					}
					document.addEventListener( 'mouseup', onUp, true );
				}
				if ( bg ) bg.addEventListener( 'click', onBgClick );
				root.addEventListener( 'click', onCloseClick );
				document.addEventListener( 'mousedown', onDown );
				function onEsc( e ) {
					if ( e.key === 'Escape' && isOpen() ) close();
				}
				document.addEventListener( 'keydown', onEsc );
				return () => {
					if ( bg ) {
						bg.removeEventListener( 'touchstart', stopAll );
						bg.removeEventListener( 'touchmove', stopAll );
						bg.removeEventListener( 'pointerdown', stopAll );
						bg.removeEventListener( 'pointermove', stopAll );
						bg.removeEventListener( 'wheel', stopAll );
						bg.removeEventListener( 'click', onBgClick );
					}
					document.removeEventListener(
						'touchstart',
						blockOutside,
						true
					);
					document.removeEventListener(
						'touchmove',
						blockOutside,
						true
					);
					document.removeEventListener(
						'pointerdown',
						blockOutside,
						true
					);
					document.removeEventListener(
						'pointermove',
						blockOutside,
						true
					);
					document.removeEventListener( 'wheel', blockOutside, true );
					document.removeEventListener( 'keydown', onKeyBlock, true );
					window.removeEventListener( 'keydown', onKeyBlock, true );
					root.removeEventListener( 'click', onCloseClick );
					document.removeEventListener( 'mousedown', onDown );
					document.removeEventListener( 'keydown', onEsc );
				};
			}

			async function close( immediate = false ) {
				if ( ! modalEl || isClosing ) return;
				isClosing = true;
				const m = modalEl;
				const wrap = m.querySelector( CFG.modal.wrap );
				const fallback = Math.max( CFG.modal.removeDelay, 400 );
				if ( m.classList.contains( 'is-video' ) )
					teardownSelfVideo( m );
				if ( immediate ) {
					if ( untrap ) {
						untrap();
						untrap = null;
					}
					if ( unbindModalEvents ) {
						unbindModalEvents();
						unbindModalEvents = null;
					}
					rm( body, CFG.behavior.lockBodyClass );
					rm( body, CFG.behavior.viewFlagClass );
					if ( CFG.behavior.enableCache ) {
						rm( m, CFG.modal.showClass );
						m.style.display = 'none';
					} else {
						m.remove();
					}
					modalEl = null;
					isClosing = false;
					if ( blockedSwiperInstance ) {
						resumeSpecificSwiper( blockedSwiperInstance );
						blockedSwiperInstance = null;
					} else {
						resumeBackgroundCarousels();
					}
					return;
				}
				add( m, 'modal--closing' );
				if ( unbindModalEvents ) {
					unbindModalEvents();
					unbindModalEvents = null;
				}
				if ( untrap ) {
					untrap();
					untrap = null;
				}
				rm( body, CFG.behavior.lockBodyClass );
				rm( body, CFG.behavior.viewFlagClass );
				rm( m, CFG.modal.showClass );
				await Promise.all( [
					afterTransition( m, fallback ),
					afterTransition( wrap, fallback ),
				] );
				rm( m, 'modal--closing' );
				if ( CFG.behavior.enableCache ) {
					m.style.display = 'none';
				} else {
					m.remove();
				}
				modalEl = null;
				isClosing = false;
				if ( blockedSwiperInstance ) {
					resumeSpecificSwiper( blockedSwiperInstance );
					blockedSwiperInstance = null;
				} else {
					resumeBackgroundCarousels();
				}
			}

			document.addEventListener( 'keydown', ( e ) => {
				if ( e.key === 'Escape' && isOpen() ) close();
			} );

			const cacheKeyOf = ( slug, params = {} ) =>
				slug +
				( params && ( params.video_id || params.post_id )
					? `:${ params.video_id || params.post_id }`
					: '' );

			function startFetch( slug, params ) {
				const key = cacheKeyOf( slug, params );
				if ( inflight.has( key ) ) return inflight.get( key );
				const p = ( async () => {
					const fromLS = storageGet( slug, params );
					if ( fromLS ) {
						const node = createHTML( fromLS );
						if ( node ) {
							if ( isVideoSlug( slug ) ) prepareSelfVideo( node );
							cache.set( key, node );
							return node;
						}
					}
					const html = await fetchFragment( CFG.ajax.actionModal, {
						slug,
						...params,
					} );
					storageSet( slug, params, html );
					const root = createHTML( html );
					if ( ! root ) throw new Error( 'modal' );
					if ( isVideoSlug( slug ) ) prepareSelfVideo( root );
					cache.set( key, root );
					return root;
				} )();
				inflight.set(
					key,
					p.finally( () => inflight.delete( key ) )
				);
				return p;
			}

			async function ensureModal( slug, params = {} ) {
				const key = cacheKeyOf( slug, params );
				if ( cache.has( key ) ) return cache.get( key );
				try {
					return await startFetch( slug, params );
				} catch {
					return null;
				}
			}

			return {
				prefetch( slug, params = {} ) {
					if ( ! CFG.behavior.enableCache ) return;
					if ( slug === 'review' && ( ! params || ! params.post_id ) )
						return;
					ensureModal( slug, params ).catch( () => {} );
				},
				async openBySlug( slug, params = {}, triggerElement = null ) {
					if ( slug === 'review' && ( ! params || ! params.post_id ) )
						return;
					if ( isOpen() ) await close( true );
					if ( unbindModalEvents ) {
						unbindModalEvents();
						unbindModalEvents = null;
					}

					blockedSwiperInstance = null;
					if ( slug === 'review' && triggerElement ) {
						blockedSwiperInstance =
							pauseSpecificSwiper( triggerElement );
					}
					const key = cacheKeyOf( slug, params );
					if ( cache.has( key ) ) {
						const root = cache.get( key );
						if ( ! root ) return;
						root.style.display = '';
						document.body.appendChild( root );
						unbindModalEvents = bindModalEvents( root );
						rm( root, CFG.modal.showClass );
						void root.offsetWidth;
						nextFrame( () => {
							add( root, CFG.modal.showClass );
							add( body, CFG.behavior.lockBodyClass );
							add( body, CFG.behavior.viewFlagClass );
							if ( untrap ) untrap();
							untrap = trapFocus( root );
							setTimeout( () => {
								if ( isVideoSlug( slug ) )
									mountSelfVideo( root );
								focusInside( root );
							}, 0 );
						} );
						modalEl = root;
						if ( ! blockedSwiperInstance ) {
							pauseBackgroundCarousels();
						}
						return;
					}
					const shell = createModalShell( slug );
					document.body.appendChild( shell );
					const unbind = bindModalEvents( shell );
					rm( shell, CFG.modal.showClass );
					void shell.offsetWidth;
					nextFrame( () => {
						add( shell, CFG.modal.showClass );
						add( body, CFG.behavior.lockBodyClass );
						add( body, CFG.behavior.viewFlagClass );
						if ( untrap ) untrap();
						untrap = trapFocus( shell );
					} );
					modalEl = shell;
					if ( ! blockedSwiperInstance ) {
						pauseBackgroundCarousels();
					}
					const started = performance.now();
					let root = await ensureModal( slug, params );
					if ( ! root ) {
						await close( true );
						return;
					}
					const elapsed = performance.now() - started;
					const waitLeft = Math.max(
						0,
						CFG.behavior.minSpinnerMs - elapsed
					);
					await new Promise( ( r ) => setTimeout( r, waitLeft ) );
					unbind();
					shell.replaceWith( root );
					unbindModalEvents = bindModalEvents( root );
					root.style.display = '';
					rm( root, CFG.modal.showClass );
					void root.offsetWidth;
					nextFrame( () => {
						add( root, CFG.modal.showClass );
						add( body, CFG.behavior.lockBodyClass );
						add( body, CFG.behavior.viewFlagClass );
						if ( untrap ) untrap();
						untrap = trapFocus( root );
						setTimeout( () => {
							if ( isVideoSlug( slug ) ) mountSelfVideo( root );
							focusInside( root );
						}, 0 );
					} );
					modalEl = root;
				},
				close,
				isOpen,
			};
		} )();

		const MobileMenu = ( () => {
			let menuEl = null;
			let cachedEl = null;
			let unbindMenuEvents = null;
			let isOpening = false;
			let openedAt = 0;
			let ensuring = null;

			function prefersReducedMotion() {
				return (
					window.matchMedia &&
					window.matchMedia( '(prefers-reduced-motion: reduce)' )
						.matches
				);
			}

			function getPanel( root ) {
				if ( ! root ) return null;
				return root.querySelector( CFG.menu.panelSelector ) || root;
			}

			function createMenuShell() {
				const root = document.createElement( 'div' );
				root.className = 'header__mobile header-mobile';
				root.innerHTML =
					'<div class="header-mobile__wrapper wrapper" aria-busy="true">' +
					`<div class="${ CFG.menu.loaderClass }"></div>` +
					'</div>' +
					'<div class="header-mobile__bg"></div>';
				return root;
			}

			function isOpen() {
				return (
					!! menuEl &&
					menuEl.classList.contains( CFG.menu.rootShowClass )
				);
			}

			function bindMenuEvents( root ) {
				if ( ! root ) return () => {};
				function onClick( e ) {
					if ( Date.now() - openedAt < CFG.menu.openGuardMs ) {
						e.preventDefault();
						return;
					}
					const bg = closestFromEvent( e, '.header-mobile__bg' );
					if ( bg ) {
						e.preventDefault();
						close();
						return;
					}
					const closeBtn = closestFromEvent(
						e,
						'.button-close-menu'
					);
					if ( closeBtn ) {
						e.preventDefault();
						close();
						return;
					}
					const link = closestFromEvent(
						e,
						'.menu-item-has-children > .menu-item__label'
					);
					if ( link && link.parentElement ) {
						e.preventDefault();
						link.parentElement.classList.toggle(
							'active-item-link'
						);
					}
				}
				root.addEventListener( 'click', onClick, { passive: false } );
				function onEsc( e ) {
					if ( e.key === 'Escape' && isOpen() ) close();
				}
				document.addEventListener( 'keydown', onEsc );
				return () => {
					root.removeEventListener( 'click', onClick );
					document.removeEventListener( 'keydown', onEsc );
				};
			}

			function animateOpen( root ) {
				if ( ! root ) return;
				const panel = getPanel( root );
				if ( ! panel ) return;
				openedAt = Date.now();
				root.style.display = 'block';
				panel.style.transition = 'none';
				panel.style.willChange = 'transform';
				panel.style.transform = CFG.menu.translateClose;
				panel.getBoundingClientRect();
				add( body, CFG.behavior.lockBodyClass );
				add( root, CFG.menu.rootShowClass );
				nextFrame( () => {
					if ( prefersReducedMotion() ) {
						panel.style.transform = '';
						panel.style.transition = '';
						panel.style.willChange = '';
						return;
					}
					panel.style.transition = `transform ${ CFG.menu.duration }ms ${ CFG.menu.easing }`;
					panel.style.transform = '';
					setTimeout( () => {
						panel.style.transition = '';
						panel.style.willChange = '';
					}, CFG.menu.duration + 50 );
				} );
			}

			function animateClose( root, done ) {
				if ( ! root ) {
					done();
					return;
				}
				const panel = getPanel( root );
				if ( ! panel ) {
					done();
					return;
				}
				if ( prefersReducedMotion() ) {
					done();
					return;
				}
				panel.style.transition = `transform ${ CFG.menu.duration }ms ${ CFG.menu.easing }`;
				panel.style.willChange = 'transform';
				panel.style.transform = CFG.menu.translateClose;
				let finished = false;
				const finish = () => {
					if ( finished ) return;
					finished = true;
					panel.style.transition = '';
					panel.style.willChange = '';
					done();
				};
				panel.addEventListener( 'transitionend', finish, {
					once: true,
				} );
				setTimeout( finish, CFG.menu.duration + 120 );
			}

			function hydrateShellWithContent( shellRoot, fetchedRoot ) {
				if ( ! shellRoot || ! fetchedRoot ) return;
				const shellPanel = getPanel( shellRoot );
				const fetchedPanel =
					fetchedRoot.querySelector( CFG.menu.panelSelector ) ||
					fetchedRoot;
				const shellBg = shellRoot.querySelector( '.header-mobile__bg' );
				const fetchedBg =
					fetchedRoot.querySelector( '.header-mobile__bg' );
				if ( fetchedPanel && shellPanel ) {
					shellPanel.innerHTML = fetchedPanel.innerHTML;
					shellPanel.removeAttribute( 'aria-busy' );
					const loader = shellPanel.querySelector(
						`.${ CFG.menu.loaderClass }`
					);
					if ( loader ) loader.remove();
				}
				if ( fetchedBg && shellBg ) {
					shellBg.className = fetchedBg.className;
				}
			}

			async function ensureMenu() {
				if ( ensuring ) return ensuring;
				ensuring = ( async () => {
					const fromLS = menuStorageGet();
					if ( fromLS ) {
						const node = createHTML( fromLS );
						if ( node ) return node;
					}
					const html = await fetchFragment( CFG.ajax.actionMenu );
					menuStorageSet( html );
					const node = createHTML( html );
					return node;
				} )().finally( () => {
					ensuring = null;
				} );
				return ensuring;
			}

			async function refreshMenuInBg() {
				try {
					const html = await fetchFragment( CFG.ajax.actionMenu );
					menuStorageSet( html );
				} catch {}
			}

			function close( immediate = false ) {
				if ( ! menuEl ) return;
				const current = menuEl;
				const cleanup = () => {
					rm( current, CFG.menu.rootShowClass );
					rm( body, CFG.behavior.lockBodyClass );
					if ( unbindMenuEvents ) {
						unbindMenuEvents();
						unbindMenuEvents = null;
					}
					const removeNow = () => {
						if ( CFG.behavior.enableCache ) {
							cachedEl = current;
							cachedEl.style.display = 'none';
						} else {
							current.remove();
						}
						if ( current === menuEl ) menuEl = null;
					};
					setTimeout( removeNow, CFG.menu.removeDelay );
				};
				if ( immediate ) {
					cleanup();
					return;
				}
				animateClose( current, cleanup );
			}

			return {
				async prefetch() {
					if ( ! CFG.behavior.enableCache ) return;
					try {
						const node = await ensureMenu();
						if ( node && ! cachedEl ) {
							node.style.display = 'none';
							document.body.appendChild( node );
							cachedEl = node;
						}
					} catch {}
				},
				async openLazy() {
					if ( isOpening ) return;
					isOpening = true;
					if ( Modal.isOpen() ) Modal.close( true );
					if ( unbindMenuEvents ) {
						unbindMenuEvents();
						unbindMenuEvents = null;
					}
					if ( CFG.behavior.enableCache && cachedEl ) {
						cachedEl.style.display = '';
						document.body.appendChild( cachedEl );
						menuEl = cachedEl;
						unbindMenuEvents = bindMenuEvents( menuEl );
						animateOpen( menuEl );
						refreshMenuInBg();
						isOpening = false;
						return;
					}
					const shell = createMenuShell();
					document.body.appendChild( shell );
					menuEl = shell;
					unbindMenuEvents = bindMenuEvents( menuEl );
					animateOpen( menuEl );
					try {
						const node = await ensureMenu();
						if ( node ) {
							hydrateShellWithContent( shell, node );
							cachedEl = shell;
						}
					} catch {
					} finally {
						isOpening = false;
					}
				},
				close,
				isOpen,
			};
		} )();

		const openModalByEvent = ( e ) => {
			const t = closestFromEvent( e, CFG.selectors.openModalTrigger );
			if ( ! t ) return false;
			e.preventDefault();
			if ( MobileMenu.isOpen() ) MobileMenu.close( true );
			const slug =
				t.getAttribute( CFG.modal.slugAttr ) || CFG.modal.defaultSlug;
			const params =
				slug === 'video'
					? { video_id: t.getAttribute( 'data-video' ) || '' }
					: slug === 'review'
					? {
							post_id:
								t.getAttribute( 'data-id' ) ||
								t.dataset.id ||
								'',
					  }
					: {};
			if ( slug === 'review' && ! params.post_id ) return false;
			Modal.openBySlug( slug, params, t ).catch( () => {} );
			return true;
		};

		let modalPointerHandled = false;
		const onModalPointerDown = ( e ) => {
			const did = openModalByEvent( e );
			if ( did ) modalPointerHandled = true;
		};
		const onModalClick = ( e ) => {
			if ( modalPointerHandled ) {
				modalPointerHandled = false;
				return;
			}
			openModalByEvent( e );
		};
		document.addEventListener( 'pointerdown', onModalPointerDown, {
			capture: true,
		} );
		document.addEventListener( 'click', onModalClick, { capture: true } );

		const burger = document.querySelector( CFG.selectors.burger );
		if ( burger ) {
			let handled = false;
			const openNow = () => {
				if ( Modal.isOpen() ) Modal.close( true );
				MobileMenu.openLazy().catch( () => {} );
			};
			const onPointerDown = ( e ) => {
				handled = true;
				e.preventDefault();
				requestAnimationFrame( openNow );
			};
			const onClick = ( e ) => {
				if ( handled ) {
					handled = false;
					return;
				}
				e.preventDefault();
				requestAnimationFrame( openNow );
			};
			burger.addEventListener( 'pointerdown', onPointerDown );
			burger.addEventListener( 'click', onClick );
			const onPre = () => MobileMenu.prefetch();
			burger.addEventListener( 'pointerenter', onPre, { passive: true } );
			burger.addEventListener( 'focus', onPre );
			burger.addEventListener( 'touchstart', onPre, { passive: true } );
		}

		function parsePreloadItem( item ) {
			if ( ! item ) return null;
			if ( typeof item === 'string' ) {
				if ( item.indexOf( ':' ) > -1 ) {
					const [ slug, video_id ] = item.split( ':' );
					return {
						slug:
							String( slug || '' ).trim() ||
							CFG.modal.defaultSlug,
						params: { video_id: String( video_id || '' ).trim() },
					};
				}
				return { slug: item, params: {} };
			}
			if ( typeof item === 'object' && item !== null ) {
				const slug = String( item.slug || CFG.modal.defaultSlug );
				const params = {};
				if ( item.video_id ) params.video_id = String( item.video_id );
				if ( item.post_id ) params.post_id = String( item.post_id );
				return { slug, params };
			}
			return null;
		}

		function collectTriggersOnce( root ) {
			const set = new Set();
			const list = [];
			const scope = root || document;
			if ( ! scope.querySelectorAll ) return list;
			const triggers = Array.from(
				scope.querySelectorAll( CFG.selectors.openModalTrigger )
			);
			triggers.forEach( ( el ) => {
				const slug =
					el.getAttribute( CFG.modal.slugAttr ) ||
					CFG.modal.defaultSlug;
				const params = {};
				if ( slug === 'video' )
					params.video_id = el.getAttribute( 'data-video' ) || '';
				if ( slug === 'review' )
					params.post_id = el.getAttribute( 'data-id' ) || '';
				if ( slug === 'review' && ! params.post_id ) return;
				const key =
					slug +
					( params.video_id
						? ':' + params.video_id
						: params.post_id
						? ':' + params.post_id
						: '' );
				if ( ! set.has( key ) ) {
					set.add( key );
					list.push( { slug, params } );
				}
			} );
			return list;
		}

		function preloadList( list ) {
			if ( ! CFG.behavior.enableCache || ! Array.isArray( list ) ) return;
			for ( const it of list ) {
				Modal.prefetch( it.slug, it.params );
			}
		}

		function observeTriggers() {
			if ( ! window.MutationObserver ) return;
			const seen = new Set();
			const push = ( slug, params ) => {
				if ( slug === 'review' && ( ! params || ! params.post_id ) )
					return;
				const key =
					slug +
					( params.video_id
						? ':' + params.video_id
						: params.post_id
						? ':' + params.post_id
						: '' );
				if ( seen.has( key ) ) return;
				seen.add( key );
				Modal.prefetch( slug, params );
			};
			const handleNode = ( node ) => {
				if ( ! node || node.nodeType !== 1 ) return;
				if (
					node.matches &&
					node.matches( CFG.selectors.openModalTrigger )
				) {
					const slug =
						node.getAttribute( CFG.modal.slugAttr ) ||
						CFG.modal.defaultSlug;
					const params = {};
					if ( slug === 'video' )
						params.video_id =
							node.getAttribute( 'data-video' ) || '';
					if ( slug === 'review' )
						params.post_id = node.getAttribute( 'data-id' ) || '';
					push( slug, params );
				}
				if ( ! node.querySelectorAll ) return;
				const inner = node.querySelectorAll(
					CFG.selectors.openModalTrigger
				);
				inner.forEach( ( el ) => {
					const slug =
						el.getAttribute( CFG.modal.slugAttr ) ||
						CFG.modal.defaultSlug;
					const params = {};
					if ( slug === 'video' )
						params.video_id = el.getAttribute( 'data-video' ) || '';
					if ( slug === 'review' )
						params.post_id = el.getAttribute( 'data-id' ) || '';
					push( slug, params );
				} );
			};
			const initSweep = collectTriggersOnce( document );
			initSweep.forEach( ( it ) => push( it.slug, it.params ) );
			const mo = new MutationObserver( ( mut ) => {
				mut.forEach( ( m ) => {
					if ( m.type === 'childList' )
						m.addedNodes.forEach( handleNode );
					if (
						m.type === 'attributes' &&
						m.target &&
						m.target.matches &&
						m.target.matches( CFG.selectors.openModalTrigger )
					) {
						const slug =
							m.target.getAttribute( CFG.modal.slugAttr ) ||
							CFG.modal.defaultSlug;
						const params = {};
						if ( slug === 'video' )
							params.video_id =
								m.target.getAttribute( 'data-video' ) || '';
						if ( slug === 'review' )
							params.post_id =
								m.target.getAttribute( 'data-id' ) || '';
						push( slug, params );
					}
				} );
			} );
			mo.observe( document.documentElement, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: [
					CFG.modal.slugAttr,
					'data-video',
					'data-id',
				],
			} );
		}

		function immediatePreload() {
			if ( ! CFG.behavior.enableCache ) return;
			const list = [];
			if ( Array.isArray( window.PRELOAD_MODALS ) ) {
				window.PRELOAD_MODALS.forEach( ( item ) => {
					const parsed = parsePreloadItem( item );
					if ( parsed ) list.push( parsed );
				} );
			}
			list.push( { slug: CFG.modal.defaultSlug, params: {} } );
			preloadList( list );
		}

		function getLineHeightPx( el ) {
			const cs = getComputedStyle( el );
			let lh = cs.lineHeight;
			if ( ! lh || lh === 'normal' ) {
				const fs = parseFloat( cs.fontSize ) || 16;
				return fs * 1.2;
			}
			if ( typeof lh === 'string' && lh.endsWith( 'px' ) )
				return parseFloat( lh ) || 0;
			const fs = parseFloat( cs.fontSize ) || 16;
			const num = parseFloat( lh );
			return ! isNaN( num ) ? num * fs : fs * 1.2;
		}

		const naturalHeightCache = new WeakMap();
		const pendingMeasurements = new Set();
		let measurementRAF = null;

		function createCacheKey( el, width ) {
			const cs = getComputedStyle( el );
			return `${ width }-${ cs.fontSize }-${ cs.lineHeight }-${ cs.fontFamily }-${ el.textContent.length }`;
		}

		function measureNaturalHeight( el ) {
			const rect = el.getBoundingClientRect();
			const clone = el.cloneNode( true );
			const cs = getComputedStyle( el );

			Object.assign( clone.style, {
				position: 'absolute',
				left: '-99999px',
				top: '0',
				width: ( rect.width || el.clientWidth || 0 ) + 'px',
				maxHeight: 'none',
				height: 'auto',
				overflow: 'visible',
				display: 'block',
				visibility: 'hidden',
				whiteSpace: 'normal',
				WebkitLineClamp: 'unset',
				WebkitBoxOrient: 'initial',
				margin: '0',
				padding: cs.padding || '0',
				border: '0',
			} );

			const parent = el.parentNode || document.body;
			parent.appendChild( clone );
			const h = clone.scrollHeight || clone.clientHeight || 0;
			clone.remove();

			return h;
		}

		function naturalHeight( el ) {
			if ( ! el ) return 0;

			const rect = el.getBoundingClientRect();
			const width = rect.width || el.clientWidth || 0;

			if ( width < 5 ) return 0;

			let cache = naturalHeightCache.get( el );
			if ( ! cache ) {
				cache = new Map();
				naturalHeightCache.set( el, cache );
			}

			const cacheKey = createCacheKey( el, width );

			if ( cache.has( cacheKey ) ) {
				return cache.get( cacheKey );
			}

			const height = measureNaturalHeight( el );
			cache.set( cacheKey, height );

			return height;
		}

		function batchMeasureNaturalHeights() {
			measurementRAF = null;

			pendingMeasurements.forEach( ( el ) => {
				if ( document.contains( el ) ) {
					naturalHeight( el );
				}
			} );

			pendingMeasurements.clear();
		}

		function scheduleNaturalHeightMeasurement( el ) {
			if ( ! el ) return;

			pendingMeasurements.add( el );

			if ( ! measurementRAF ) {
				measurementRAF = requestAnimationFrame(
					batchMeasureNaturalHeights
				);
			}
		}

		let heightObserver = null;

		function initHeightObserver() {
			if ( heightObserver || ! window.ResizeObserver ) return;

			heightObserver = new ResizeObserver( ( entries ) => {
				entries.forEach( ( entry ) => {
					const el = entry.target;
					const cache = naturalHeightCache.get( el );
					if ( cache ) {
						cache.clear();
					}
				} );
			} );
		}

		function observeElementForHeightChanges( el ) {
			if ( ! el || ! heightObserver ) return;

			try {
				heightObserver.observe( el );
			} catch ( e ) {}
		}

		function checkTextLines( textElement ) {
			if ( ! textElement ) return false;
			const rect = textElement.getBoundingClientRect();
			if ( rect.width < 5 ) return null;
			const lh = getLineHeightPx( textElement );
			if ( ! lh ) return false;
			const fullH = naturalHeight( textElement );
			const lines = Math.round( fullH / lh );
			return lines > CFG.behavior.maxLines;
		}

		let reviewButtonsRAF = null;
		let reviewButtonsInitialized = false;

		function initReviewButtons() {
			reviewButtonsRAF = null;

			if ( ! reviewButtonsInitialized ) {
				initHeightObserver();
				reviewButtonsInitialized = true;
			}

			const buttons = document.querySelectorAll(
				CFG.selectors.reviewBtn
			);
			let needsReschedule = false;

			buttons.forEach( ( btn ) => {
				const item = btn.closest( '.reviews__item' );
				if ( ! item ) return;

				const textP = item.querySelector( CFG.selectors.reviewText );
				if ( ! textP ) return;

				observeElementForHeightChanges( textP );

				const res = checkTextLines( textP );
				if ( res === null ) {
					scheduleNaturalHeightMeasurement( textP );
					needsReschedule = true;
					return;
				}

				btn.style.display = res ? '' : 'none';
				btn.hidden = ! res;
			} );

			if ( needsReschedule && ! reviewButtonsRAF ) {
				reviewButtonsRAF = requestAnimationFrame( initReviewButtons );
			}
		}

		function clearHeightCache( el = null ) {
			if ( el ) {
				const cache = naturalHeightCache.get( el );
				if ( cache ) {
					cache.clear();
				}
			} else {
				if ( typeof naturalHeightCache?.clear === 'function' ) {
					naturalHeightCache.clear();
				} else if (
					typeof naturalHeightCache?.forEach === 'function'
				) {
					naturalHeightCache.forEach( ( cache ) => cache?.clear?.() );
				}
			}
		}

		function destroyHeightObserver() {
			if ( heightObserver ) {
				heightObserver.disconnect();
				heightObserver = null;
			}
		}

		window.ensUpdateReviewButtons = initReviewButtons;
		window.ensClearHeightCache = clearHeightCache;
		window.ensDestroyHeightObserver = destroyHeightObserver;

		preconnectAjax();

		if ( 'requestIdleCallback' in window ) {
			requestIdleCallback(
				() => {
					immediatePreload();
					observeTriggers();
					if ( document.readyState === 'loading' ) {
						document.addEventListener(
							'DOMContentLoaded',
							() => {
								preloadList( collectTriggersOnce( document ) );
								requestAnimationFrame( () => {
									initReviewButtons();
									requestAnimationFrame( initReviewButtons );
								} );
							},
							{ once: true }
						);
					} else {
						preloadList( collectTriggersOnce( document ) );
						requestAnimationFrame( () => {
							initReviewButtons();
							requestAnimationFrame( initReviewButtons );
						} );
					}
					MobileMenu.prefetch();
				},
				{ timeout: 2000 }
			);
		} else {
			setTimeout( () => {
				immediatePreload();
				observeTriggers();
				if ( document.readyState === 'loading' ) {
					document.addEventListener(
						'DOMContentLoaded',
						() => {
							preloadList( collectTriggersOnce( document ) );
							requestAnimationFrame( () => {
								initReviewButtons();
								requestAnimationFrame( initReviewButtons );
							} );
						},
						{ once: true }
					);
				} else {
					preloadList( collectTriggersOnce( document ) );
					requestAnimationFrame( () => {
						initReviewButtons();
						requestAnimationFrame( initReviewButtons );
					} );
				}
				MobileMenu.prefetch();
			}, 0 );
		}

		let rT;
		window.addEventListener( 'resize', () => {
			if ( rT ) cancelAnimationFrame( rT );
			rT = requestAnimationFrame( initReviewButtons );
		} );
	} )();

	return destroy;
}
