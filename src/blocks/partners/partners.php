<?php 
$abs_block = isset($block) ? $block : '';
$abs_args  = isset($args) ? $args : '';

$abs_defaults = [
	'allowed_innerblocks' => [''],
	'id'                  => (isset($block) && !empty($block['anchor'])) ? $block['anchor'] : '',
	'fields'              => [],
];
 
[$abs_defaults, $abs_atts] = setup_block_defaults($abs_args, $abs_defaults, $abs_block);

$abs_partners = !empty($abs_defaults['fields']) ? $abs_defaults['fields'] : get_acf_fields(['partners_group'], $block['id']);
if ( !empty($abs_partners['partners_group'])) : 
  $partners_group = $abs_partners['partners_group'];
  // Partners
  
  if(is_array($partners_group) && array_filter($partners_group)){
    get_template_part('template-parts/sections/partners', null, [
      'partners_group'    => $partners_group, 
      'remove_padding' => true,
    ]);
  }
endif; 