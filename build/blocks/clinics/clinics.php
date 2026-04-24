<?php 
$abs_block = isset($block) ? $block : '';
$abs_args  = isset($args) ? $args : '';

$abs_defaults = [
	'show_arrows'         => true,
	'show_pagination'     => true,
	'allowed_innerblocks' => [''],
	'id'                  => (isset($block) && !empty($block['anchor'])) ? $block['anchor'] : '',
	'fields'              => [],
];
 
[$abs_defaults, $abs_atts] = setup_block_defaults($abs_args, $abs_defaults, $abs_block);

$abs_slider = !empty($abs_defaults['fields']) ? $abs_defaults['fields'] : get_acf_fields(['clinic_group'], $block['id']);
$button_navigation = get_field('button_navigation', $block['id']);
if (!empty($abs_block['data']['_is_preview'])) : ?> 
  <figure>
    <img src="<?php echo esc_url(get_stylesheet_directory_uri() . '/img/clinics-preview.webp'); ?>"
      alt="<?php esc_html_e('Preview of the Clinics Block', 'ensuria'); ?>" width="100%">
  </figure>
<?php elseif ( !empty($abs_slider['clinic_group'])) : 
  get_template_part('/template-parts/sections/clinic', null, ['clinic_group' => $abs_slider['clinic_group'], 'button_navigation' => $button_navigation, 'block' => $block]);
endif; 