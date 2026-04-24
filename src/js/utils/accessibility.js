export function generateId( prefix = 'element' ) {
	return `${ prefix }-${ Math.random().toString( 36 ).substr( 2, 9 ) }`;
}

export function createScreenReaderText( text, className = 'sr-only' ) {
	const element = document.createElement( 'span' );
	element.className = className;
	element.textContent = text;
	return element;
}

export function enhancePhoneFieldA11y( input, options = {} ) {
	const {
		label = 'Номер телефону у форматі +38 XXX XXX XX XX',
		formatHint = 'Формат: +38 XXX XXX XX XX',
		wrapSelector = '.input-wrap',
	} = options;

	if (
		! input.getAttribute( 'aria-label' ) &&
		! input.getAttribute( 'aria-labelledby' )
	) {
		input.setAttribute( 'aria-label', label );
	}

	let hintId = input.getAttribute( 'aria-describedby' );
	if ( ! hintId ) {
		const wrap = input.closest?.( wrapSelector );
		if ( wrap ) {
			hintId = generateId( 'tel-format' );
			let hint = wrap.querySelector( '.tel-format-hint' );

			if ( ! hint ) {
				hint = document.createElement( 'div' );
				hint.id = hintId;
				hint.className = 'tel-format-hint sr-only';
				hint.textContent = formatHint;
				wrap.appendChild( hint );
			}

			input.setAttribute( 'aria-describedby', hintId );
		}
	}
}

export function enhanceValidationA11y( element, message ) {
	if ( ! element || ! message ) return;

	element.setAttribute( 'role', 'alert' );
	element.setAttribute( 'aria-live', 'assertive' );

	const field = element
		.closest( '.input-wrap' )
		?.querySelector( 'input, textarea, select' );
	if ( field ) {
		const existingDescribedBy =
			field.getAttribute( 'aria-describedby' ) || '';
		const elementId = element.id || generateId( 'validation' );

		if ( ! element.id ) element.id = elementId;

		const describedByIds = existingDescribedBy
			.split( ' ' )
			.filter( ( id ) => id && id !== elementId )
			.concat( elementId )
			.join( ' ' );

		field.setAttribute( 'aria-describedby', describedByIds );
	}
}

export function setAccessibleFocus( element, announcement ) {
	if ( ! element ) return;

	element.focus();

	if ( announcement ) {
		const liveRegion = document.createElement( 'div' );
		liveRegion.setAttribute( 'aria-live', 'polite' );
		liveRegion.className = 'sr-only';
		liveRegion.textContent = announcement;

		document.body.appendChild( liveRegion );

		setTimeout( () => {
			document.body.removeChild( liveRegion );
		}, 1000 );
	}
}

export function createAccessibleCloseButton( onClose, label = 'Закрити' ) {
	const button = document.createElement( 'button' );
	button.type = 'button';
	button.className = 'close-btn';
	button.setAttribute( 'aria-label', label );
	button.innerHTML = '×';

	button.addEventListener( 'click', onClose );
	button.addEventListener( 'keydown', ( e ) => {
		if ( e.key === 'Escape' ) onClose( e );
	} );

	return button;
}

export class FocusManager {
	constructor( container ) {
		this.container = container;
		this.focusableElements = null;
		this.firstElement = null;
		this.lastElement = null;
		this.previousFocus = null;
	}

	init() {
		this.previousFocus = document.activeElement;
		this.updateFocusableElements();

		if ( this.firstElement ) {
			this.firstElement.focus();
		}

		this.container.addEventListener(
			'keydown',
			this.handleKeyDown.bind( this )
		);
	}

	updateFocusableElements() {
		const selector =
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
		this.focusableElements = this.container.querySelectorAll( selector );
		this.firstElement = this.focusableElements[ 0 ];
		this.lastElement =
			this.focusableElements[ this.focusableElements.length - 1 ];
	}

	handleKeyDown( e ) {
		if ( e.key === 'Tab' ) {
			if ( e.shiftKey ) {
				if ( document.activeElement === this.firstElement ) {
					e.preventDefault();
					this.lastElement?.focus();
				}
			} else {
				if ( document.activeElement === this.lastElement ) {
					e.preventDefault();
					this.firstElement?.focus();
				}
			}
		}
	}

	destroy() {
		this.container.removeEventListener(
			'keydown',
			this.handleKeyDown.bind( this )
		);

		if ( this.previousFocus ) {
			this.previousFocus.focus();
		}
	}
}
