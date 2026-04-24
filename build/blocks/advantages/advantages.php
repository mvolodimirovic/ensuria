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

$abs_advantage = !empty($abs_defaults['fields']) ? $abs_defaults['fields'] : get_acf_fields(['individual_group'], $block['id']);
if ( !empty($abs_advantage['individual_group'])) : 

$individual_group = $abs_advantage['individual_group'] ?? [];
// Individual
if(is_array($individual_group) && array_filter($individual_group)){
  get_template_part('template-parts/sections/individual', null, [
    'individual_group'    => $individual_group, 
    'is_block' => true,
  ]);
}
endif; 