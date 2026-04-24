// init.js
import { createController } from './core/controller';
import { initFilters, initFiltersModal } from './features/filtersModal';
import { initPagination, initSearch } from './features/paginationSearch';
import { initStickyAside } from './features/stickyAside';

export function initPriceBlock( root ) {
	const c = createController( root );
	c.setActiveFilterOnInit();
	initFilters( c );
	initFiltersModal( c );
	initPagination( c );
	initSearch( c );
	initStickyAside( c );
}
