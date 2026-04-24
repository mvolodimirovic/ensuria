import { seoToggle } from './seo.js';

export function filters() {
	const root = document.getElementById( 'filters' );
	if ( ! root ) return;

	const lists = root.querySelectorAll( '.filters__list' );
	const sublists = root.querySelectorAll( '.filters__list-sublist' );
	const allLists = [ ...lists, ...sublists ];
	const urlBase = root.dataset.url || window.location.pathname;
	const postType = root.dataset.postType || '';
	const resetGroup = document.querySelector( '.filters-group--reset' );
	const resetBtn = document.querySelector( '.filters-reset' );
	const wrapperFilters = document.querySelector( '.wrapper-filters' );
	const postsContainers = document.querySelectorAll( '.team__list' );
	const pagination = document.querySelector( '.pagination' );
	const ajaxUrl =
		root.dataset.ajaxurl ||
		( window.appAjax && window.appAjax.url ) ||
		( typeof window.ajaxurl !== 'undefined' ? window.ajaxurl : '' ) ||
		'/wp-admin/admin-ajax.php';
	const iconHolders = document.querySelectorAll(
		'.filter-choice-icon[data-label]'
	);
	const choiceLabels = [ ...iconHolders ]
		.map( ( el ) => el.dataset.label )
		.filter( Boolean );
	let fetchController = null;

	function parseJSON( text ) {
		try {
			return JSON.parse( text );
		} catch ( e ) {
			console.error( 'AJAX JSON parse failed. Raw response:', text );
			return { posts: '', pagination: '', choiceIcons: {} };
		}
	}

	function getFilterParams() {
		const params = new URLSearchParams();

		allLists.forEach( ( list ) => {
			const name = list.dataset.name;
			if ( ! name ) return;

			const selected = root.querySelectorAll(
				`ul[data-name="${ name }"] > li.selected`
			);
			const values = [ ...selected ]
				.map( ( li ) => li.dataset.value )
				.filter( ( v ) => v && v !== 'select-all' );
			if ( values.length ) params.set( name, values.join( ',' ) );
		} );

		const q = params.toString();
		return q ? `?${ q }` : '';
	}

	function getListButton( listEl ) {
		const prev = listEl.previousElementSibling;
		return prev && prev.classList.contains( 'filters-choice' )
			? prev
			: null;
	}

	function setChoiceTitleToAll( listEl ) {
		const btn = getListButton( listEl );
		if ( ! btn ) return;
		const titleEl = btn.querySelector( '.filters-choice-title' );
		const allSingle = listEl.querySelector(
			'.filters__list__item.select-all.single'
		);
		const txt = allSingle ? allSingle.textContent.trim() : '';
		if ( titleEl && txt ) titleEl.textContent = txt;
	}

	function selectOnly( li ) {
		li.parentElement
			.querySelectorAll( '.filters__list__item' )
			.forEach( ( n ) => n.classList.remove( 'selected' ) );
		li.classList.add( 'selected' );
	}

	function updateChoiceIcons( map ) {
		if ( ! map || typeof map !== 'object' ) return;
		Object.entries( map ).forEach( ( [ label, html ] ) => {
			document
				.querySelectorAll(
					`.filter-choice-icon[data-label="${ label }"]`
				)
				.forEach( ( holder ) => {
					holder.innerHTML = typeof html === 'string' ? html : '';
				} );
		} );
	}

	function fetchPosts( qs ) {
		if ( fetchController ) {
			try {
				fetchController.abort();
			} catch {}
		}
		fetchController = new AbortController();

		const body = new URLSearchParams();
		body.set( 'action', 'filters' );
		body.set( 'post-type', postType );
		body.set( 'url-param', qs );
		if ( choiceLabels.length )
			body.set( 'choice-labels', choiceLabels.join( ',' ) );

		fetch( ajaxUrl, {
			method: 'POST',
			credentials: 'same-origin',
			body,
			signal: fetchController.signal,
		} )
			.then( ( r ) => r.text() )
			.then( ( text ) => {
				const res = parseJSON( text );

				history.pushState( '', '', urlBase + ( qs || '' ) );

				if ( resetGroup )
					qs
						? resetGroup.classList.remove( 'hide' )
						: resetGroup.classList.add( 'hide' );
				if ( wrapperFilters )
					qs
						? wrapperFilters.classList.add( 'open' )
						: wrapperFilters.classList.remove( 'open' );

				if ( res.posts !== '' && postsContainers.length ) {
					postsContainers.forEach( ( el ) => {
						el.innerHTML = res.posts;
					} );
				}
				if ( pagination ) pagination.innerHTML = res.pagination || '';
				seoToggle();
				updateChoiceIcons( res.choiceIcons );
			} )
			.catch( ( err ) => {
				if ( err?.name !== 'AbortError' )
					console.error( 'filters(): fetch error', err );
			} )
			.finally( () => {
				fetchController = null;
			} );
	}

	if ( resetBtn ) {
		resetBtn.addEventListener( 'click', ( e ) => {
			e.preventDefault();
			resetGroup?.classList.add( 'hide' );

			root.querySelectorAll( '.filters-choice' ).forEach( ( b ) => {
				b.classList.remove( 'active' );
				b.classList.remove( 'enable' );
			} );

			root.querySelectorAll( '.filters__list__item.selected' ).forEach(
				( li ) => li.classList.remove( 'selected' )
			);
			root.querySelectorAll( '.filters__list__item.select-all' ).forEach(
				( li ) => li.classList.add( 'selected' )
			);

			allLists.forEach( setChoiceTitleToAll );

			fetchPosts( getFilterParams() );
		} );
	}

	allLists.forEach( ( listEl ) => {
		const btn = getListButton( listEl );
		const removeBtn = btn?.querySelector( '.remove-filter' );
		if ( ! removeBtn ) return;

		removeBtn.addEventListener( 'click', ( e ) => {
			e.stopPropagation();
			btn.classList.remove( 'enable' );

			listEl
				.querySelectorAll( '.filters__list__item:not(.select-all)' )
				.forEach( ( li ) => li.classList.remove( 'selected' ) );

			const allItem = listEl.querySelector(
				'.filters__list__item.select-all'
			);
			allItem?.classList.add( 'selected' );

			fetchPosts( getFilterParams() );
		} );
	} );

	root.addEventListener( 'click', ( e ) => {
		const item = e.target.closest( '.filters__list__item' );
		if ( ! item || ! root.contains( item ) ) return;

		const listEl = item.closest( '.filters__list, .filters__list-sublist' );
		if ( ! listEl ) return;

		const btn = getListButton( listEl );
		const multiple =
			listEl.dataset.multiple === 'multiple' ? 'multiple' : 'single';
		const isAll = item.classList.contains( 'select-all' );
		const allItem = listEl.querySelector(
			'.filters__list__item.select-all'
		);

		if ( isAll ) {
			selectOnly( item );
			btn?.classList.remove( 'enable' );
			if ( btn && multiple === 'single' ) {
				const t = btn.querySelector( '.filters-choice-title' );
				if ( t ) t.textContent = item.textContent.trim();
			}
			fetchPosts( getFilterParams() );
			return;
		}

		if ( multiple === 'multiple' ) {
			allItem?.classList.remove( 'selected' );
			item.classList.toggle( 'selected' );
			btn?.classList.add( 'enable' );

			const anySelected = !! listEl.querySelector(
				'.filters__list__item.selected:not(.select-all)'
			);
			if ( ! anySelected ) {
				allItem?.classList.add( 'selected' );
				btn?.classList.remove( 'enable' );
			}
		} else {
			listEl
				.querySelectorAll( '.filters__list__item' )
				.forEach( ( li ) => li.classList.remove( 'selected' ) );
			item.classList.add( 'selected' );
			allItem?.classList.remove( 'selected' );

			if ( btn ) {
				btn.classList.remove( 'active' );
				btn.classList.add( 'enable' );
				const title = btn.querySelector( '.filters-choice-title' );
				if ( title ) title.textContent = item.textContent.trim();
			}
		}

		fetchPosts( getFilterParams() );
	} );

	document.addEventListener( 'click', ( e ) => {
		const choiceBtn = e.target.closest( '.filters-choice' );
		if ( choiceBtn && root.contains( choiceBtn ) ) {
			root.querySelectorAll( '.filters-choice' ).forEach( ( btn ) => {
				if ( btn !== choiceBtn ) btn.classList.remove( 'active' );
			} );
			choiceBtn.classList.toggle( 'active' );
			return;
		}

		if (
			! e.target.closest( '.filters__list' ) &&
			! e.target.closest( '.filters-choice' )
		) {
			root.querySelectorAll( '.filters-choice.active' ).forEach(
				( btn ) => btn.classList.remove( 'active' )
			);
		}
	} );
}
