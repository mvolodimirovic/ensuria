/**
 * Click to Copy functionality
 *
 * - For links: works on mobile only
 * - For buttons: works always
 * - Shows toast message with smooth fade in/out
 *
 * @package Ensuria
 */

const CONFIG = {
	selector: '.click-to-copy',
	toastClass: 'copy-toast',
	hiddenClass: 'visually-hidden',
	copiedClass: 'is-copied',
	visibleDuration: 3000, // ms
	fadeOutDuration: 300, // ms
};

/**
 * Check if device is mobile
 *
 * @return {boolean} True if mobile device
 */
function isMobileDevice() {
	return (
		( window.matchMedia &&
			window.matchMedia( '(pointer: coarse)' ).matches ) ||
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent
		)
	);
}

/**
 * Copy text to clipboard
 *
 * @param {string} text Text to copy
 * @return {Promise} Promise that resolves on success
 */
function copyToClipboard( text ) {
	if ( navigator.clipboard && window.isSecureContext ) {
		return navigator.clipboard.writeText( text );
	}

	return new Promise( ( resolve, reject ) => {
		const textarea = document.createElement( 'textarea' );
		textarea.value = text;
		textarea.setAttribute( 'readonly', '' );
		textarea.style.position = 'fixed';
		textarea.style.top = '-9999px';
		textarea.style.left = '-9999px';

		document.body.appendChild( textarea );

		const selection = document.getSelection();
		const originalRange =
			selection && selection.rangeCount > 0
				? selection.getRangeAt( 0 )
				: null;

		textarea.select();

		try {
			const successful = document.execCommand( 'copy' );
			if ( successful ) {
				resolve();
			} else {
				reject( new Error( 'execCommand failed' ) );
			}
		} catch ( err ) {
			reject( err );
		} finally {
			document.body.removeChild( textarea );

			if ( originalRange ) {
				selection.removeAllRanges();
				selection.addRange( originalRange );
			}
		}
	} );
}

/**
 * Show toast message with smooth animation
 *
 * @param {HTMLElement} element Parent element
 * @param {string} message Message to display
 */
function showToast( element, message ) {
	let toast = element.querySelector( '.' + CONFIG.toastClass );

	if ( ! toast ) {
		toast = document.createElement( 'span' );
		toast.className = CONFIG.toastClass + ' ' + CONFIG.hiddenClass;
		toast.setAttribute( 'role', 'status' );
		toast.setAttribute( 'aria-live', 'polite' );
		element.appendChild( toast );
	}

	toast.textContent = message;
	element.classList.add( CONFIG.copiedClass );

	requestAnimationFrame( () => {
		toast.classList.remove( CONFIG.hiddenClass );
	} );

	setTimeout( () => {
		toast.classList.add( CONFIG.hiddenClass );

		setTimeout( () => {
			element.classList.remove( CONFIG.copiedClass );
		}, CONFIG.fadeOutDuration );
	}, CONFIG.visibleDuration );
}

/**
 * Handle click to copy
 *
 * @param {Event} event Click event
 */
function handleCopyClick( event ) {
	const element = event.currentTarget;
	const tagName = element.tagName.toLowerCase();

	const isMobile = isMobileDevice();
	const isLink = tagName === 'a';

	// For links: only on mobile
	if ( isLink && ! isMobile ) {
		return;
	}

	event.preventDefault();

	// Get text to copy from data-email attribute
	let textToCopy = element.getAttribute( 'data-email' );

	if ( ! textToCopy ) {
		console.warn( 'No data-email attribute found on element:', element );
		return;
	}

	const successMessage =
		element.getAttribute( 'data-success-message' ) || 'Скопійовано';

	copyToClipboard( textToCopy )
		.then( () => {
			showToast( element, successMessage );
		} )
		.catch( ( error ) => {
			console.error( 'Failed to copy text:', error );

			const errorMessage =
				element.getAttribute( 'data-error-message' ) ||
				'Помилка копіювання';
			showToast( element, errorMessage );
		} );
}

/**
 * Initialize click to copy functionality
 *
 * @param {Object} options Configuration options
 */
export function initClickToCopy( options = {} ) {
	const config = { ...CONFIG, ...options };
	const elements = document.querySelectorAll( config.selector );

	if ( elements.length === 0 ) {
		return;
	}

	elements.forEach( ( element ) => {
		element.removeEventListener( 'click', handleCopyClick );
		element.addEventListener( 'click', handleCopyClick );
	} );
}

/**
 * Destroy click to copy functionality
 */
export function destroyClickToCopy() {
	const elements = document.querySelectorAll( CONFIG.selector );

	elements.forEach( ( element ) => {
		element.removeEventListener( 'click', handleCopyClick );

		const toast = element.querySelector( '.' + CONFIG.toastClass );
		if ( toast ) {
			toast.remove();
		}

		element.classList.remove( CONFIG.copiedClass );
	} );
}

export default { initClickToCopy, destroyClickToCopy, isMobileDevice };
