/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/blocks/short-description/editor.scss":
/*!**************************************************!*\
  !*** ./src/blocks/short-description/editor.scss ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!************************************************!*\
  !*** ./src/blocks/short-description/editor.js ***!
  \************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/short-description/editor.scss");

(function (wp) {
  const {
    addFilter
  } = wp.hooks;
  const el = wp.element.createElement;
  const {
    SVG,
    Path
  } = wp.primitives;
  const ensuriaIcon = el(SVG, {
    width: 21,
    height: 30,
    viewBox: '0 0 21 30'
  }, el(Path, {
    d: 'M0 29.4362V5.05785C0 4.59937 0.182699 4.18018 0.495894 3.85269L4.07153 0.263407C4.39778 -0.0640821 4.81537 -0.234375 5.27211 -0.234375H20.5142V4.28498H5.9507C5.29821 4.28498 4.77622 4.80896 4.77622 5.46394V11.1754C4.77622 11.8303 5.29821 12.3543 5.9507 12.3543H20.3968V16.8344H5.9507C5.29821 16.8344 4.77622 17.3584 4.77622 18.0133V23.7771C4.77622 24.4321 5.29821 24.9561 5.9507 24.9561H20.5012V29.4231H0V29.4362Z',
    fill: 'currentColor',
    fillRule: 'evenodd',
    clipRule: 'evenodd'
  }));
  addFilter('blocks.registerBlockType', 'ensuria/short-description/icon', function (settings, name) {
    if (name !== 'ensuria/short-description') return settings;
    return {
      ...settings,
      icon: ensuriaIcon
    };
  });
})(window.wp);
})();

/******/ })()
;
//# sourceMappingURL=editor.js.map