<?php 
$abs_block = isset($block) ? $block : '';
$abs_args  = isset($args) ? $args : '';

$abs_defaults = [
	'allowed_innerblocks' => [''],
	'id'                  => (isset($block) && !empty($block['anchor'])) ? $block['anchor'] : '',
	'fields'              => [],
];
 
[$abs_defaults, $abs_atts] = setup_block_defaults($abs_args, $abs_defaults, $abs_block);
$button_navigation = get_field('button_navigation', $block['id']);
$abs_directions = !empty($abs_defaults['fields']) ? $abs_defaults['fields'] : get_acf_fields(['directions_group'], $block['id']);

if ( !empty($abs_directions['directions_group'])) : 

  $directions = $abs_directions['directions_group'] ?? [];
  $directions_list = $directions['directions_list'] ?? [];
  if(!empty($directions_list)):?>
    <section class="directions section" <?php echo $button_navigation ? 'data-content="'.esc_attr(ensuria_block_runtime_key( $block )).'"' : ''; ?>>
        <?php 
        echo wp_kses_post($directions_list);?>
    </section>
  <?php endif; 
endif; ?>