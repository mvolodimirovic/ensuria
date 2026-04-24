import { fieldManager } from '../utils/field-manager.js';

export class FloatingLabels {
	constructor( options = {} ) {
		this.wrapSelector = options.wrapSelector ?? '.field-wrap';
		this.hoverSelector =
			options.hoverSelector ?? 'input[name="phone"], input#phone';
		this.initialized = false;
	}

	bindPhoneHover( scope = document ) {
		scope.querySelectorAll( this.hoverSelector ).forEach( ( input ) => {
			if ( input.dataset.hoverBound === '1' ) return;

			const wrap = input.closest?.( this.wrapSelector );
			if ( ! wrap ) return;

			const onEnter = () => wrap.classList.add( 'is-hover' );
			const onLeave = () => wrap.classList.remove( 'is-hover' );

			input.addEventListener( 'mouseenter', onEnter );
			input.addEventListener( 'mouseleave', onLeave );
			input.addEventListener( 'blur', onLeave );
			input.dataset.hoverBound = '1';
		} );
	}

	init( scope = document ) {
		if ( ! this.initialized ) {
			fieldManager.init();
			this.initialized = true;
		}

		this.bindPhoneHover( scope );

		fieldManager.refreshFields( scope );
	}

	refresh( scope = document ) {
		fieldManager.refreshFields( scope );
		this.bindPhoneHover( scope );
	}
}

export const floatingLabels = new FloatingLabels();

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', () => {
		floatingLabels.init();
	} );
} else {
	floatingLabels.init();
}
