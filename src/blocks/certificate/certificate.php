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

$abs_slider = !empty($abs_defaults['fields']) ? $abs_defaults['fields'] : get_acf_fields(['certificate_group'], $block['id']);
$button_navigation = get_field('button_navigation', $block['id']);
if ( !empty($abs_slider['certificate_group'])) : 

  $certificate_group = $abs_slider['certificate_group'];
  // Certificates
  
  if(is_array($certificate_group) && array_filter($certificate_group)){

    get_template_part('template-parts/sections/certificate', null, [
      'certificate_group'    => $certificate_group, 
      'remove_padding' => true,
    ]);
  }

endif; 