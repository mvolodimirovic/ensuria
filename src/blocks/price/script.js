import './style.scss';
import { initPriceBlock } from './init';

document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( '[data-analizy-root]' ).forEach( ( root ) => {
		initPriceBlock( root );
	} );
} );
