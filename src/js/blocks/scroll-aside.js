/**
 * Creates a sticky scroll effect for an element within the visual viewport.
 *
 * Positioning modes:
 * - RESET/ABSOLUTE(pre): Before sticky zone begins
 * - FIXED(sticky): Element is attached to viewport
 * - PIN(stop): Element stopped before stopAt element
 * - ABSOLUTE(bottom): Element reached end of parent container
 *
 * Options available via opts object:
 * - topOffset: Offset from viewport top (number or function)
 * - breakpoint: Minimum screen width to activate (default: 1024)
 * - stopAt: CSS selector of element to stop before
 * - constrainToParent: Limit position to parent bounds (default: true)
 * - startFrom: 'self' or 'parent' - where sticky begins (default: 'parent')
 * - alignTo: CSS selector for width alignment (default: parent element)
 *
 * @param {string} elem - CSS selector of element to make sticky
 * @param {string} parent - CSS selector of parent container
 * @param {number|object} [topOffset=190] - Top offset or options object
 * @param {number} [breakpoint=1024] - Breakpoint for activation or options object
 * @returns {() => void | undefined} - Cleanup function
 */

// Helper functions for parsing values
const num = (v) => parseFloat(v) || 0;
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const isFn = (v) => typeof v === 'function';

export function scrollInfo(elem, parent, topOffset = 190, breakpoint = 1024) {
	// Parse parameters: accept object as topOffset or breakpoint
	let opts = null;

	if (isObj(topOffset)) {
		opts = topOffset;
		topOffset = 190;
		breakpoint = 1024;
	} else if (isObj(breakpoint)) {
		opts = breakpoint;
		breakpoint = 1024;
	}

	const el = document.querySelector(elem);
	const boundParent = document.querySelector(parent);

	// Exit if elements not found
	if (!el || !boundParent) return;

	// Extract parameters from options object
	const stopAt = opts && typeof opts.stopAt === 'string' ? opts.stopAt.trim() : '';
	const constrainToParent = !(opts && opts.constrainToParent === false);
	const startFrom = opts && (opts.startFrom === 'self' || opts.startFrom === 'parent') ? opts.startFrom : 'parent';
	const alignTo = opts && typeof opts.alignTo === 'string' ? opts.alignTo.trim() : '';

	// Get current topOffset value (can be function for dynamic calculation)
	const getTopOffsetPx = () => {
		const hasOptsTopOffset = opts && Object.prototype.hasOwnProperty.call(opts, 'topOffset');
		if (hasOptsTopOffset && isFn(opts.topOffset)) {
			const v = opts.topOffset();
			return Math.max(0, Number.isFinite(v) ? v : 0);
		}
		if (hasOptsTopOffset) {
			if (Number.isFinite(opts.topOffset)) {
				return Math.max(0, opts.topOffset);
			}
			// Explicitly provided but invalid topOffset option; treat as 0.
			return 0;
		}
		return Math.max(0, Number.isFinite(topOffset) ? topOffset : 0);
	};

	// Get breakpoint from options or parameter
	const getBreakpoint = () => {
		if (opts && Number.isFinite(opts.breakpoint)) return opts.breakpoint;
		return Number.isFinite(breakpoint) ? breakpoint : 1024;
	};

	// Calculate element's total height including margins
	const outerHeight = (node) => {
		const cs = getComputedStyle(node);
		return node.offsetHeight + num(cs.marginTop) + num(cs.marginBottom);
	};

	const parentPadTop = () => num(getComputedStyle(boundParent).paddingTop);
	const parentPadBottom = () => num(getComputedStyle(boundParent).paddingBottom);

	// Ensure parent has position for absolute positioning
	if (getComputedStyle(boundParent).position === 'static') {
		boundParent.style.position = 'relative';
	}

	// Store initial inline styles for restoration
	const initialInline = {
		position: el.style.position,
		top: el.style.top,
		left: el.style.left,
		width: el.style.width,
		transform: el.style.transform,
	};

	// Restore initial inline styles
	const restoreInitialInline = () => {
		el.style.position = initialInline.position;
		el.style.top = initialInline.top;
		el.style.left = initialInline.left;
		el.style.width = initialInline.width;
		el.style.transform = initialInline.transform;
	};

	// Set absolute position within parent container
	const setAbsoluteInParent = (topPx) => {
		el.style.position = 'absolute';
		el.style.top = `${topPx}px`;
		el.style.left = '';
		el.style.width = '100%';
		el.style.transform = '';
	};

	// Find element to align width to (alignTo or parent)
	const getAlignNode = () => {
		if (alignTo) {
			const n = document.querySelector(alignTo);
			if (n) return n;
		}
		return el.parentElement || boundParent;
	};

	// Set fixed position aligned with specific element
	const setFixedAligned = (topPx) => {
		const alignNode = getAlignNode();
		const r = alignNode.getBoundingClientRect();
		const width = alignNode.clientWidth || el.offsetWidth;

		el.style.position = 'fixed';
		el.style.top = `${topPx}px`;
		el.style.left = `${r.left + (window.pageXOffset || window.scrollX || 0)}px`;
		el.style.width = `${width}px`;
	};

	// Set fixed position pinned to specific document position (for stop)
	const setFixedPinnedToDocTop = (docTopPx, topPx) => {
		const scrollY = window.pageYOffset || window.scrollY || 0;
		const dy = docTopPx - (scrollY + topPx);

		setFixedAligned(topPx);
		el.style.transform = `translateY(${dy}px)`;
	};

	// Baseline position of element in document and relative to parent
	let baselineTopDoc = 0;
	let baselineTopInParent = 0;
	let needsMeasure = true;

	// Measure baseline element position (called on init and resize)
	const measureBaseline = () => {
		restoreInitialInline();

		const scrollY = window.pageYOffset || window.scrollY || 0;
		const pr = boundParent.getBoundingClientRect();
		const er = el.getBoundingClientRect();

		const parentTopDoc = pr.top + scrollY;
		const elTopDoc = er.top + scrollY;

		baselineTopDoc = elTopDoc;
		baselineTopInParent = elTopDoc - parentTopDoc;

		needsMeasure = false;
	};

	const getStopMetrics = (scrollY) => {
		if (!stopAt) return null;

		const stopEl = document.querySelector(stopAt);
		if (!stopEl) return null;

		const sr = stopEl.getBoundingClientRect();
		const stopTopDoc = sr.top + scrollY;
		const stopMarginTop = num(getComputedStyle(stopEl).marginTop);
		// Calculate stop line accounting for margin-top
		const stopLineDoc = stopTopDoc - stopMarginTop;

		return {
			stopTopDoc,
			stopMarginTop,
			stopLineDoc,
		};
	};

	let rafId = 0;

	// Main function to update element position
	const update = () => {
		// Disable on small screens
		if (window.innerWidth < getBreakpoint()) {
			restoreInitialInline();
			return;
		}

		if (needsMeasure) measureBaseline();

		const topOffsetPx = getTopOffsetPx();
		const scrollY = window.pageYOffset || window.scrollY || 0;

		const pr = boundParent.getBoundingClientRect();
		const parentTopDoc = pr.top + scrollY;
		const parentH = boundParent.offsetHeight;

		const padTop = parentPadTop();
		const padBottom = parentPadBottom();
		const elOuterH = outerHeight(el);

		// If element is taller than parent container, don't apply sticky
		if (constrainToParent && parentH <= elOuterH) {
			restoreInitialInline();
			return;
		}

		// Desired top position of element in document
		const desiredTopDoc = scrollY + topOffsetPx;

		// Sticky start point (from element or parent padding)
		const startTopDoc = (startFrom === 'self')
			? baselineTopDoc
			: (parentTopDoc + padTop);

		const preStickyTopInParent = (startFrom === 'self')
			? baselineTopInParent
			: padTop;

		// BEFORE sticky zone - element in initial position
		if (desiredTopDoc <= startTopDoc) {
			if (constrainToParent) {
				setAbsoluteInParent(preStickyTopInParent);
			} else {
				restoreInitialInline();
			}
			return;
		}

		// Calculate sticky end point
		let endTopDoc = Number.POSITIVE_INFINITY;
		let endKind = 'none';
		let endAbsTopInParent = 0;

		// Parent container end (if constrainToParent enabled)
		if (constrainToParent) {
			endAbsTopInParent = parentH - elOuterH - padBottom;
			endTopDoc = parentTopDoc + endAbsTopInParent;
			endKind = 'parent';
		}

		// Stop before stopAt element (if specified)
		const stopM = getStopMetrics(scrollY);
		if (stopM) {
			// Stop accounting for stopAt element's margin-top
			const stopEndTopDoc = stopM.stopLineDoc - elOuterH;

			if (!constrainToParent) {
				endTopDoc = stopEndTopDoc;
				endKind = 'stop';
			} else if (stopEndTopDoc < endTopDoc) {
				endTopDoc = stopEndTopDoc;
				endKind = 'stop';
			}
		}

		// If end point is before start - no sticky range
		if (Number.isFinite(endTopDoc) && endTopDoc <= startTopDoc) {
			setAbsoluteInParent(preStickyTopInParent);
			return;
		}

		// AFTER end point - stop element (PIN or ABSOLUTE)
		if (Number.isFinite(endTopDoc) && desiredTopDoc >= endTopDoc) {
			// If stopped by stopAt - use PIN mode
			if (endKind === 'stop') {
				setFixedPinnedToDocTop(endTopDoc, topOffsetPx);
				return;
			}
			// Otherwise - absolute at end of parent container
			setAbsoluteInParent(endAbsTopInParent);
			return;
		}

		// IN STICKY zone - fix element to viewport
		setFixedAligned(topOffsetPx);
		el.style.transform = '';
	};

	// Schedule update via requestAnimationFrame
	const scheduleUpdate = () => {
		if (rafId) return;
		rafId = requestAnimationFrame(() => {
			rafId = 0;
			update();
		});
	};

	const onScroll = () => scheduleUpdate();

	let enabled = false;

	const enable = () => {
		if (enabled) return;
		window.addEventListener('scroll', onScroll, { passive: true });
		enabled = true;
	};

	const disable = () => {
		if (!enabled) {
			restoreInitialInline();
			return;
		}
		window.removeEventListener('scroll', onScroll);
		enabled = false;
		restoreInitialInline();
	};

	// Handle resize - check breakpoint and remeasure positions
	const onResize = () => {
		needsMeasure = true;

		if (window.innerWidth < getBreakpoint()) {
			disable();
		} else {
			if (!enabled) enable();
			scheduleUpdate();
		}
	};

	// Initialize - check breakpoint
	if (window.innerWidth < getBreakpoint()) {
		disable();
	} else {
		enable();
		scheduleUpdate();
	}

	window.addEventListener('resize', onResize);

	// ResizeObserver to track element size changes
	const ro = new ResizeObserver(() => {
		needsMeasure = true;
		scheduleUpdate();
	});

	ro.observe(boundParent);
	ro.observe(el);

	// Return cleanup function to remove all subscriptions
	return function cleanup() {
		ro.disconnect();
		window.removeEventListener('resize', onResize);
		if (rafId) cancelAnimationFrame(rafId);
		rafId = 0;
		disable();
	};
}
