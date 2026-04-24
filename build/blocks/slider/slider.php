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

$abs_slider = !empty($abs_defaults['fields']) ? $abs_defaults['fields'] : get_acf_fields(['acf_gallery_slider'], $block['id']);
$button_navigation = get_field('button_navigation', $block['id']);

if (!empty($abs_block['data']['_is_preview'])) : ?> 
<figure>
	<img src="<?php echo esc_url(get_stylesheet_directory_uri() . '/img/slider-preview.webp'); ?>"
		alt="<?php esc_html_e('Preview of the Slider Block', 'ensuria'); ?>" width="100%">
</figure>
<?php elseif ( !empty($abs_slider['acf_gallery_slider'])) : ?>

<div class="block-slider ensuria-block ensuria-block-slider" <?php echo $button_navigation ? 'data-content="'.esc_attr(ensuria_block_runtime_key( $block )).'"' : ''; ?>>
  <div class="slider-inner">
    <?php if(!is_admin()):?>
      <div class="swiper-pagination gallery__pagination">
        <div class="slider-button-prev button-prev">
          <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
        </div>
        <div class="slider-button-next button-next">
          <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
        </div>
      </div> 
    <?php endif; ?>
    <div class="gallery">
      <div class="swiper-wrapper">
        <?php
          foreach($abs_slider['acf_gallery_slider'] as $index => $image) : 
          $is_critical = $index == 0 ? true:false;
          ?>
          <div class="gallery__item swiper-slide">
              <?php echo render_optimized_image($image, 'full', '', $is_critical); ?>
          </div>
        <?php 
      if(is_admin() && $index >= 2) {break;}
      endforeach; ?>
      </div>
    </div>
  </div>
  <div class="slider-progress"></div>
</div>
<?php 
endif; 