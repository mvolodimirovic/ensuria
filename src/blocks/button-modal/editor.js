import './editor.scss';

(function (wp) {
  const { addFilter } = wp.hooks;
  const el = wp.element.createElement;
  const { SVG, Path } = wp.primitives;

  const ensuriaIcon = el(
    SVG,
    { width: 21, height: 30, viewBox: '0 0 21 30' },
    el(Path, {
      d: 'M0 29.4362V5.05785C0 4.59937 0.182699 4.18018 0.495894 3.85269L4.07153 0.263407C4.39778 -0.0640821 4.81537 -0.234375 5.27211 -0.234375H20.5142V4.28498H5.9507C5.29821 4.28498 4.77622 4.80896 4.77622 5.46394V11.1754C4.77622 11.8303 5.29821 12.3543 5.9507 12.3543H20.3968V16.8344H5.9507C5.29821 16.8344 4.77622 17.3584 4.77622 18.0133V23.7771C4.77622 24.4321 5.29821 24.9561 5.9507 24.9561H20.5012V29.4231H0V29.4362Z',
      fill: 'currentColor',
      fillRule: 'evenodd',
      clipRule: 'evenodd'
    })
  );

  addFilter(
    'blocks.registerBlockType',
    'ensuria/button-modal/icon',
    function (settings, name) {
      if (name !== 'ensuria/button-modal') return settings;
      return { ...settings, icon: ensuriaIcon };
    }
  );
})(window.wp);
