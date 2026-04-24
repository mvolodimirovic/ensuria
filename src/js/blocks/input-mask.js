import { fieldManager } from '../utils/field-manager.js';
import { enhancePhoneFieldA11y } from '../utils/accessibility.js';

let OBSERVER = null;

const elementIntervals = new WeakMap();

function cleanupRemovedElements() {
	for ( const [ el, id ] of elementIntervals ) {
		if ( ! document.contains( el ) ) {
			clearInterval( id );
			elementIntervals.delete( el );
		}
	}
}

export function initTelMaskUA( options = {} ) {
	const PREFIX = options.prefix ?? '+38 ';
	const GROUPS = options.groups ?? [ 3, 3, 2, 2 ];
	const TEL_SELECTOR = options.selector ?? 'input[type="tel"]';
	const WRAP_SELECTOR = options.wrapSelector ?? '.input-wrap';
	const HOVER_SELECTOR =
		options.hoverSelector ?? 'input[name="tel"], input#tel';
	const PLACEHOLDER_CHAR = options.placeholderChar ?? '_';
	const OBSERVE = options.observe !== false;

	const PREFIX_LEN = PREFIX.length;
	const TOTAL = GROUPS.reduce( ( a, b ) => a + b, 0 );
	const RE_DIGIT = /^\d$/;

	const maskUnderscores = ( () => {
		let s = '',
			i = 0;
		for ( const g of GROUPS ) {
			s += ( i ? ' ' : '' ) + PLACEHOLDER_CHAR.repeat( g );
			i++;
		}
		return s;
	} )();
	const MASK_PLACEHOLDER_STR = PREFIX + maskUnderscores;

	function slotsEmpty() {
		return new Array( TOTAL ).fill( PLACEHOLDER_CHAR );
	}

	function digitsLen( slots ) {
		let n = 0;
		for ( const c of slots ) {
			if ( /\d/.test( c ) ) n++;
		}
		return n;
	}

	function firstEmpty( slots ) {
		for ( let i = 0; i < TOTAL; i++ ) {
			if ( ! /\d/.test( slots[ i ] ) ) return i;
		}
		return TOTAL;
	}

	function valueFromSlots( slots ) {
		let out = PREFIX,
			acc = 0;
		for ( let g = 0; g < GROUPS.length; g++ ) {
			const len = GROUPS[ g ];
			out += slots.slice( acc, acc + len ).join( '' );
			acc += len;
			if ( g < GROUPS.length - 1 ) out += ' ';
		}
		return out;
	}

	function spacesBeforeIndex( idx ) {
		let s = 0,
			acc = 0;
		for ( let g = 0; g < GROUPS.length - 1; g++ ) {
			acc += GROUPS[ g ];
			if ( idx > acc ) s++;
		}
		return s;
	}

	function charPos( idx ) {
		return PREFIX_LEN + idx + spacesBeforeIndex( idx );
	}

	function indexFromPos( pos ) {
		if ( pos <= charPos( 0 ) ) return 0;
		for ( let i = 0; i < TOTAL; i++ ) {
			if ( pos <= charPos( i ) ) return i;
		}
		return TOTAL;
	}

	function setCaretByIndex( el, idx ) {
		const p = Math.min( charPos( idx ), el.value.length );
		try {
			el.setSelectionRange( p, p );
		} catch ( _ ) {}
	}

	function ensureDataset( el ) {
		if ( el.dataset.uaSlots ) return el.dataset.uaSlots.split( '' );
		const s = slotsEmpty();
		const rawDigits = (
			String( el.value || '' ).match( /\d/g ) || []
		).join( '' );
		const d =
			rawDigits.length > TOTAL ? rawDigits.slice( -TOTAL ) : rawDigits;
		for ( let i = 0; i < d.length && i < TOTAL; i++ ) {
			s[ i ] = d[ i ];
		}
		el.dataset.uaSlots = s.join( '' );
		return s;
	}

	function setSlots( el, slots ) {
		el.dataset.uaSlots = slots.join( '' );
	}

	function bindPhoneHover( scope = document ) {
		scope.querySelectorAll( HOVER_SELECTOR ).forEach( ( inp ) => {
			if ( inp.dataset.hoverBound === '1' ) return;
			const wrap = inp.closest?.( WRAP_SELECTOR );
			if ( ! wrap ) return;
			const onEnter = () => wrap.classList.add( 'is-hover' );
			const onLeave = () => wrap.classList.remove( 'is-hover' );
			inp.addEventListener( 'mouseenter', onEnter );
			inp.addEventListener( 'mouseleave', onLeave );
			inp.addEventListener( 'blur', onLeave );
			inp.dataset.hoverBound = '1';
		} );
	}

	function applyMask( el ) {
		if ( el.dataset.uaMask === '1' ) return;
		el.dataset.uaMask = '1';
		el.autocomplete = el.autocomplete || 'tel';
		el.inputMode = 'numeric';
		el.placeholder = MASK_PLACEHOLDER_STR;

		enhancePhoneFieldA11y( el, { wrapSelector: WRAP_SELECTOR } );

		let slots = ensureDataset( el );
		if ( digitsLen( slots ) > 0 ) {
			el.value = valueFromSlots( slots );
		} else {
			el.value = '';
		}

		const wrap = el.closest?.( WRAP_SELECTOR );
		if ( wrap )
			wrap.classList.toggle( 'is-filled', digitsLen( slots ) > 0 );

		const ensureValueForEdit = () => {
			if ( ! el.value ) el.value = valueFromSlots( slots );
		};

		const clampToProgress = ( idx ) => Math.min( idx, firstEmpty( slots ) );

		const syncOut = ( caretIdx ) => {
			setSlots( el, slots );
			if ( digitsLen( slots ) > 0 ) {
				el.value = valueFromSlots( slots );
			} else {
				el.value = '';
			}
			if ( wrap ) {
				wrap.classList.toggle( 'is-filled', digitsLen( slots ) > 0 );
				fieldManager.updateFieldState( wrap );
			}
			setCaretByIndex( el, caretIdx );
		};

		const reflowFromCurrentValue = () => {
			const rawDigits = (
				String( el.value || '' ).match( /\d/g ) || []
			).join( '' );
			const d =
				rawDigits.length > TOTAL
					? rawDigits.slice( -TOTAL )
					: rawDigits;
			slots = slotsEmpty();
			for ( let i = 0; i < d.length && i < TOTAL; i++ ) {
				slots[ i ] = d[ i ];
			}
			setSlots( el, slots );
		};

		const onFocus = () => {
			slots = ensureDataset( el );
			ensureValueForEdit();
			setCaretByIndex( el, firstEmpty( slots ) );
			const isInModal = el.closest(
				'.modal, [role="dialog"], .popup, .add-ajax-request'
			);
			if ( isInModal ) {
				setTimeout( () => {
					if ( document.activeElement === el ) {
						slots = ensureDataset( el );
						const correctPos = firstEmpty( slots );
						setCaretByIndex( el, correctPos );
					}
				}, 50 );
				setTimeout( () => {
					if ( document.activeElement === el ) {
						slots = ensureDataset( el );
						const correctPos = firstEmpty( slots );
						setCaretByIndex( el, correctPos );
					}
				}, 150 );
			}
			enforceCaretPosition();
		};

		const onBlur = () => {
			slots = ensureDataset( el );
			if ( digitsLen( slots ) === 0 ) el.value = '';
			if ( wrap )
				wrap.classList.toggle( 'is-filled', digitsLen( slots ) > 0 );
		};

		const onClickClamp = () => {
			if ( ! el.value ) ensureValueForEdit();
			const idx = indexFromPos( el.selectionStart ?? 0 );
			const isModalContext = el.closest(
				'.modal, [role="dialog"], .popup, .add-ajax-request'
			);
			if ( isModalContext ) {
				slots = ensureDataset( el );
				const correctPos = firstEmpty( slots );
				setCaretByIndex( el, correctPos );
			} else {
				setCaretByIndex( el, clampToProgress( idx ) );
			}
		};

		const enforceCaretPosition = () => {
			setTimeout( () => {
				if ( document.activeElement === el ) {
					slots = ensureDataset( el );
					if ( ! el.value || el.value === MASK_PLACEHOLDER_STR ) {
						ensureValueForEdit();
					}
					const correctPos = firstEmpty( slots );
					setCaretByIndex( el, correctPos );
				}
			}, 10 );
		};

		const onKeyDown = ( e ) => {
			const k = e.key;
			if (
				k === 'Tab' ||
				k === 'Enter' ||
				k === 'Escape' ||
				e.ctrlKey ||
				e.metaKey ||
				e.altKey
			)
				return;
			ensureValueForEdit();
			slots = ensureDataset( el );
			let start = el.selectionStart ?? 0;
			let end = el.selectionEnd ?? start;
			let sIdx = indexFromPos( start );
			let eIdx = indexFromPos( end );
			if ( k === 'ArrowLeft' ) {
				e.preventDefault();
				setCaretByIndex( el, Math.max( 0, sIdx - 1 ) );
				return;
			}
			if ( k === 'ArrowRight' ) {
				e.preventDefault();
				setCaretByIndex( el, clampToProgress( sIdx + 1 ) );
				return;
			}
			if ( k === 'Home' ) {
				e.preventDefault();
				setCaretByIndex( el, 0 );
				return;
			}
			if ( k === 'End' ) {
				e.preventDefault();
				setCaretByIndex( el, clampToProgress( TOTAL ) );
				return;
			}
			if ( k === 'Backspace' ) {
				e.preventDefault();
				if ( sIdx !== eIdx ) {
					const a = Math.min( sIdx, eIdx );
					const b = Math.max( sIdx, eIdx );
					for ( let i = a; i < b; i++ ) {
						slots[ i ] = PLACEHOLDER_CHAR;
					}
					syncOut( a );
					return;
				}
				if ( sIdx > 0 ) {
					const delIdx = sIdx - 1;
					slots[ delIdx ] = PLACEHOLDER_CHAR;
					syncOut( delIdx );
				} else {
					syncOut( 0 );
				}
				return;
			}
			if ( k === 'Delete' ) {
				e.preventDefault();
				if ( sIdx !== eIdx ) {
					const a = Math.min( sIdx, eIdx );
					const b = Math.max( sIdx, eIdx );
					for ( let i = a; i < b; i++ ) {
						slots[ i ] = PLACEHOLDER_CHAR;
					}
					syncOut( a );
					return;
				}
				if ( sIdx < TOTAL ) {
					slots[ sIdx ] = PLACEHOLDER_CHAR;
					syncOut( sIdx );
				} else {
					syncOut( TOTAL );
				}
				return;
			}
			if ( RE_DIGIT.test( k ) ) {
				e.preventDefault();
				if ( sIdx !== eIdx ) {
					const a = Math.min( sIdx, eIdx );
					const b = Math.max( sIdx, eIdx );
					for ( let i = a; i < b; i++ ) {
						slots[ i ] = PLACEHOLDER_CHAR;
					}
					sIdx = a;
				}
				sIdx = clampToProgress( sIdx );
				if ( sIdx >= TOTAL ) {
					syncOut( TOTAL );
					return;
				}
				slots[ sIdx ] = k;
				syncOut( Math.min( sIdx + 1, TOTAL ) );
				return;
			}
			e.preventDefault();
		};

		const onPaste = () => {
			setTimeout( () => {
				reflowFromCurrentValue();
				syncOut( firstEmpty( slots ) );
			}, 0 );
		};

		const onInput = () => {
			reflowFromCurrentValue();
			syncOut( firstEmpty( slots ) );
		};

		const onChange = () => {
			reflowFromCurrentValue();
			syncOut( firstEmpty( slots ) );
		};

		el.addEventListener( 'focus', onFocus, { passive: true } );
		el.addEventListener( 'blur', onBlur, { passive: true } );
		el.addEventListener( 'click', onClickClamp, { passive: true } );
		el.addEventListener( 'mouseup', onClickClamp, { passive: true } );
		el.addEventListener( 'keydown', onKeyDown );
		el.addEventListener( 'paste', onPaste );
		el.addEventListener( 'input', onInput );
		el.addEventListener( 'change', onChange );

		const isModalField = el.closest(
			'.modal, [role="dialog"], .popup, .add-ajax-request'
		);
		if ( isModalField ) {
			const existingInterval = elementIntervals.get( el );
			if ( existingInterval ) {
				clearInterval( existingInterval );
			}
			const forceModalCursor = () => {
				if ( document.activeElement === el && el.value ) {
					setTimeout( () => {
						slots = ensureDataset( el );
						const correctPos = firstEmpty( slots );
						const currentPos = el.selectionStart ?? 0;
						if ( currentPos !== correctPos ) {
							setCaretByIndex( el, correctPos );
						}
					}, 0 );
				}
			};
			const cleanupInterval = () => {
				const intervalId = elementIntervals.get( el );
				if ( intervalId ) {
					clearInterval( intervalId );
					elementIntervals.delete( el );
				}
			};
			const events = [
				'mousedown',
				'mouseup',
				'click',
				'touchstart',
				'touchend',
				'keyup',
				'select',
				'selectstart',
				'selectionchange',
			];
			events.forEach( ( event ) => {
				el.addEventListener( event, forceModalCursor );
			} );
			const modalCursorInterval = setInterval( () => {
				if ( ! document.contains( el ) ) {
					cleanupInterval();
					return;
				}
				if ( document.activeElement === el && el.value ) {
					slots = ensureDataset( el );
					const correctPos = firstEmpty( slots );
					const currentPos = el.selectionStart ?? 0;
					if ( currentPos !== correctPos ) {
						setCaretByIndex( el, correctPos );
					}
				}
			}, 50 );
			elementIntervals.set( el, modalCursorInterval );
			const onBlurCleanup = () => {
				setTimeout( () => {
					if ( document.activeElement !== el ) {
						cleanupInterval();
						el.removeEventListener( 'blur', onBlurCleanup );
					}
				}, 200 );
			};
			el.addEventListener( 'blur', onBlurCleanup, { once: false } );
		}
	}

	function initScope( scope = document ) {
		scope.querySelectorAll( TEL_SELECTOR ).forEach( applyMask );
		fieldManager.refreshFields( scope );
		bindPhoneHover( scope );
	}

	fieldManager.initGlobalListeners();

	if ( OBSERVER ) {
		OBSERVER.disconnect();
		OBSERVER = null;
	}

	if ( OBSERVE ) {
		OBSERVER = new MutationObserver( ( muts ) => {
			for ( const m of muts ) {
				for ( const n of m.addedNodes || [] ) {
					if ( ! ( n instanceof HTMLElement ) ) continue;
					if (
						n.matches?.( TEL_SELECTOR ) ||
						n.querySelector?.( TEL_SELECTOR ) ||
						n.matches?.( WRAP_SELECTOR ) ||
						n.querySelector?.( WRAP_SELECTOR )
					) {
						initScope( n );
					}
				}
				for ( const n of m.removedNodes || [] ) {
					if ( ! ( n instanceof HTMLElement ) ) continue;
					const telInputs = n.matches?.( TEL_SELECTOR )
						? [ n ]
						: n.querySelectorAll?.( TEL_SELECTOR ) || [];
					telInputs.forEach( ( input ) => {
						const intervalId = elementIntervals.get( input );
						if ( intervalId ) {
							clearInterval( intervalId );
							elementIntervals.delete( input );
						}
					} );
				}
			}
		} );
		OBSERVER.observe( document.documentElement, {
			childList: true,
			subtree: true,
		} );
	}

	initScope( document );
	window.initTelMaskUA = () => {
		initScope( document );
	};
	window.initTelMaskScope = ( scope ) => {
		initScope( scope || document );
	};
	window.clearTelMaskIntervals = () => {
		cleanupRemovedElements();
	};

	return {
		refresh: initScope,
		disconnect: () => {
			if ( OBSERVER ) {
				OBSERVER.disconnect();
				OBSERVER = null;
			}
		},
		clearIntervals: () => {
			cleanupRemovedElements();
		},
	};
}
