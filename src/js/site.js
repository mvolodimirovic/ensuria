const blocks = [
	{ selector: '#header', name: 'header' },
	{ selector: '.specialoffers', name: 'specialoffers' },
	{ selector: '.team__slider', name: 'team' },
	{ selector: '.swiper-wrapper', name: 'swiper-initialized' },
	{ selector: '.blog__slider', name: 'blog' },
	{ selector: '.more__content', name: 'seo' },
	{ selector: '.filters', name: 'filters' },
	{ selector: '.faq', name: 'faq' },
	{ selector: '.click-to-copy', name: 'click-to-copy' },
	{ selector: '.scroll-aside', name: 'scroll-aside' },
	{ selector: '.doctor__info-sticky__button', name: 'team-buttons' },
	{ selector: '.certificate__item__img', name: 'certificate-modal' },
];

blocks.forEach( ( block ) => {
	if ( document.querySelector( block.selector ) ) {
		loadBlock( block.name );
	}
} );

function loadBlock( name ) {
	switch ( name ) {
		case 'header':
			import(
				/* webpackChunkName: "blocks/block-header" */ './blocks/header.js'
			).then( ( mod ) => {
				if ( mod.hideHeaderOnScroll ) {
					const destroyHeader = mod.hideHeaderOnScroll();
					// Store cleanup function for potential re-initialization
					if ( typeof destroyHeader === 'function' ) {
						window.__ensHeaderDestroy = destroyHeader;
					}
				}
			} );
			import(
				/* webpackChunkName: "blocks/floating-labels" */ './blocks/floating-labels.js'
			);
			import(
				/* webpackChunkName: "blocks/input-mask" */ './blocks/input-mask.js'
			).then( ( mod ) => {
				if ( mod.initTelMaskUA ) mod.initTelMaskUA();
			} );
			break;
		case 'swiper-initialized':
			import(
				/* webpackChunkName: "blocks/general-slider" */ './blocks/general-slider.js'
			).then( ( mod ) => {
				if ( mod.initGenericSwipers ) {
					mod.initGenericSwipers( [
						{
							name: 'reviews',
							slidesPerView: 3,
							breakpoints: {
								1: {
									slidesPerView: 1.08,
								},
								575: {
									slidesPerView: 2,
								},
								768: {
									slidesPerView: 3,
								},
							},
						},
						{
							name: 'clinic',
							slidesPerView: 3,
							slidesPerGroup: 1,
							breakpoints: {
								1: {
									slidesPerView: 1.15,
									slidesPerGroup: 1,
									spaceBetween: 6,
								},
								576: {
									slidesPerView: 2,
									slidesPerGroup: 1,
									spaceBetween: 6,
								},
								768: {
									slidesPerView: 2,
									slidesPerGroup: 1,
									spaceBetween: 6,
								},
								1024: {
									slidesPerView: 3,
									slidesPerGroup: 1,
									spaceBetween: 6,
								},
							},
						},
						{
							name: 'blog',
							slidesPerView: 3,
							breakpoints: {
								1: {
									slidesPerView: 1.08,
								},
								575: {
									slidesPerView: 1.5,
								},
								768: {
									slidesPerView: 2,
								},
								1024: {
									slidesPerView: 3,
								},
							},
						},
						{
							name: 'team',
							slidesPerView: 4.4,
							breakpoints: {
								1: {
									slidesPerView: 1.08,
								},
								575: {
									slidesPerView: 1.5,
								},
								768: {
									slidesPerView: 3.3,
								},
								1024: {
									slidesPerView: 4.4,
								},
							},
						},
						{
							name: 'certificate',
							slidesPerView: 6,
							breakpoints: {
								1: {
									slidesPerView: 1.08,
								},
								575: {
									slidesPerView: 2.5,
								},
								768: {
									slidesPerView: 4,
								},
								1024: {
									slidesPerView: 6,
								},
							},
						},
						{
							name: 'specialoffers',
							slidesPerView: 3,
							spaceBetween: 17,
              disableBelow: 575,
							breakpoints: {
								1: {
									slidesPerView: 1.08,
									spaceBetween: 6,
								},
								575: {
									slidesPerView: 1.5,
									spaceBetween: 10,
								},
								768: {
									slidesPerView: 2,
									spaceBetween: 17,
								},
								1024: {
									slidesPerView: 3,
									spaceBetween: 17,
								},
							},
						},
						{
							name: 'gallery',
							slidesPerView: 3,
							spaceBetween: 17,
							breakpoints: {
								1: {
									slidesPerView: 1.08,
									spaceBetween: 6,
								},
								575: {
									slidesPerView: 1.5,
									spaceBetween: 10,
								},
								768: {
									slidesPerView: 2,
									spaceBetween: 17,
								},
								1024: {
									slidesPerView: 3,
									spaceBetween: 17,
								},
							},
						},
					] );
				}
			} );
			break;
		case 'seo':
			import(
				/* webpackChunkName: "blocks/block-seo" */ './blocks/seo.js'
			).then( ( mod ) => {
				if ( mod.seoToggle ) mod.seoToggle();
			} );
			break;
		case 'filters':
			import(
				/* webpackChunkName: "blocks/block-filters" */ './blocks/filters.js'
			).then( ( mod ) => {
				if ( mod.filters ) mod.filters();
			} );
			break;
		case 'faq':
			import(
				/* webpackChunkName: "blocks/block-faq" */ './blocks/faq.js'
			).then( ( mod ) => {
				if ( mod.faqTab ) mod.faqTab();
			} );
			break;
		case 'click-to-copy':
			import(
				/* webpackChunkName: "blocks/copy-url" */ './blocks/copy-url.js'
			).then( ( mod ) => {
				if ( mod.initClickToCopy ) mod.initClickToCopy();
			} );
    break;
    case 'scroll-aside':
        import(
          /* webpackChunkName: "blocks/scroll-aside" */ './blocks/scroll-aside.js'
        ).then((mod) => {
          if (mod.scrollInfo) {
            mod.scrollInfo('.aside-content__list', '.blog-content__inner');
            // with stop section
            mod.scrollInfo('.scroll-aside__form', '.doctor__aside', {
              breakpoint: 1024,
              topOffset: 190,
              stopAt: '.stop-section',
              constrainToParent: false,
              startFrom: 'self',
              alignTo: '.doctor__aside',
            });
          }
        });
    break;
		case 'certificate-modal':
			import(
				/* webpackChunkName: "blocks/certificate-modal" */ './blocks/certificate-modal.js'
			).then( ( mod ) => {
				if ( mod.initCertificateModal ) {
					mod.initCertificateModal();
				}
			} );
			break;
		case 'team-buttons':
			import(
				/* webpackChunkName: "blocks/team-single" */ './blocks/team-single.js'
			).then( ( mod ) => {
				if ( mod.initSmartAnchorScroll ) mod.initSmartAnchorScroll();
			} );
			import(
				/* webpackChunkName: "blocks/sticky-list" */ './blocks/sticky-list.js'
			).then( ( mod ) => {
				if ( mod.initHeadStickyToggle ) mod.initHeadStickyToggle();
			} );
			break;
	}
}
