export class FieldManager {
	constructor( options = {} ) {
		this.wrapSelector = options.wrapSelector ?? '.input-wrap';
		this.inputSelector =
			options.inputSelector ??
			'.input-wrap .form-control:not([type="hidden"])';
		this.baseInputSelector =
			options.baseInputSelector ??
			'.input-wrap input:not([type="hidden"]), .input-wrap textarea, .input-wrap select';
		this.boundListeners = false;
	}

	isFieldFilled( input ) {
		if ( ! input ) return false;

		if ( input.matches( 'input[type="tel"]' ) && input.dataset.uaSlots ) {
			const slots = input.dataset.uaSlots.split( '' );
			return slots.some( ( slot ) => /\d/.test( slot ) );
		}

		return ( input.value || '' ).trim().length > 0;
	}

	updateFieldState( wrap ) {
		const input =
			wrap?.querySelector?.( this.inputSelector ) ||
			wrap?.querySelector?.( this.baseInputSelector );
		if ( ! input ) return;

		wrap.classList.toggle( 'is-filled', this.isFieldFilled( input ) );
	}

	refreshFields( scope = document ) {
		scope.querySelectorAll( this.wrapSelector ).forEach( ( wrap ) => {
			this.updateFieldState( wrap );
		} );
	}

	initGlobalListeners() {
		if ( this.boundListeners ) return;

		document.addEventListener(
			'click',
			( e ) => {
				const label =
					e.target.closest &&
					e.target.closest( `${ this.wrapSelector } label` );
				if ( ! label ) return;

				const wrap = label.closest( this.wrapSelector );
				if ( ! wrap ) return;

				const input =
					wrap.querySelector( this.inputSelector ) ||
					wrap.querySelector( this.baseInputSelector );
				if ( input ) {
					e.preventDefault();
					input.focus();
				}
			},
			true
		);

		document.addEventListener( 'focusin', ( e ) => {
			const target = e.target;
			if ( ! target?.closest?.( this.wrapSelector ) ) return;
			if (
				! target?.matches?.( this.inputSelector ) &&
				! target?.matches?.( this.baseInputSelector )
			)
				return;

			const wrap = target.closest?.( this.wrapSelector );
			if ( wrap ) wrap.classList.add( 'is-active' );
		} );

		document.addEventListener( 'focusout', ( e ) => {
			const target = e.target;
			if ( ! target?.closest?.( this.wrapSelector ) ) return;
			if (
				! target?.matches?.( this.inputSelector ) &&
				! target?.matches?.( this.baseInputSelector )
			)
				return;

			const wrap = target.closest?.( this.wrapSelector );
			if ( ! wrap ) return;

			wrap.classList.remove( 'is-active' );
			this.updateFieldState( wrap );
		} );

		document.addEventListener( 'input', ( e ) => {
			const target = e.target;
			if ( ! target?.closest?.( this.wrapSelector ) ) return;
			if (
				! target?.matches?.( this.inputSelector ) &&
				! target?.matches?.( this.baseInputSelector )
			)
				return;

			const wrap = target.closest?.( this.wrapSelector );
			if ( wrap ) this.updateFieldState( wrap );
		} );

		this.boundListeners = true;
	}

	init( scope = document ) {
		this.initGlobalListeners();
		this.refreshFields( scope );
	}
}

export const fieldManager = new FieldManager();
