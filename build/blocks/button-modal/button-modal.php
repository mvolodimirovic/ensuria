<?php 
$abs_block = isset($block) ? $block : '';
$abs_args  = isset($args) ? $args : '';

$abs_defaults = [
	'id'                  => (isset($block) && !empty($block['anchor'])) ? $block['anchor'] : '',
	'fields'              => [],
];
 
[$abs_defaults, $abs_atts] = setup_block_defaults($abs_args, $abs_defaults, $abs_block);

$abs_button = !empty($abs_defaults['fields']) ? $abs_defaults['fields'] : get_acf_fields(['button_group'], $block['id'] ?? '');
if ( !empty($abs_button['button_group'])) : 
  $group = $abs_button['button_group'];
  $text_button = $group['text_button'] ?? '';

  if (!empty($text_button)): ?>
    <button class="btn btn--icon btn--blue-sky open-modal" data-modal-slug="contact" aria-label="<?php echo esc_attr__('Відкрити модальне вікно','ensuria'); ?>">
      <?php echo esc_html($text_button); ?>
      <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
    </button>
  <?php endif;
endif;  