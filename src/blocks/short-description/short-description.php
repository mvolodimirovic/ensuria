<?php
$abs_block = isset($block) ? $block : '';
$abs_args  = isset($args) ? $args : '';

$abs_defaults = [
	'allowed_innerblocks' => [''],
	'id'                  => (isset($block) && !empty($block['anchor'])) ? $block['anchor'] : '',
	'fields'              => [],
];
 
[$abs_defaults, $abs_atts] = setup_block_defaults($abs_args, $abs_defaults, $abs_block);

$button_navigation = get_field( 'button_navigation', $block['id'] );
$abs_short_description = ! empty( $abs_defaults['fields'] ) ? $abs_defaults['fields'] : get_acf_fields( array( 'short-description_group' ), $block['id'] );

if ( ! empty( $abs_short_description['short-description_group'] ) ) :

    $group = $abs_short_description['short-description_group'] ?? [];
    $visible = $group['visible'] ?? '';
    $description = $group['content'] ?? '';

    if ( ! empty( $description ) && $visible ) :
        ?>
        <div class="short-description__description" <?php echo $button_navigation ? 'data-content="' .  esc_attr(ensuria_block_runtime_key( $block )) . '"' : ''; ?>>
            <?php echo wp_kses_post( $description ); ?>
        </div>
        <?php
    endif; 
endif;