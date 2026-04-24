export const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const PX_PER_SECOND = 400;
export const MIN_DUR = 120;
export const MAX_DUR = 400;
export const PREF_REDUCED = !! (
	window.matchMedia &&
	window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
);
