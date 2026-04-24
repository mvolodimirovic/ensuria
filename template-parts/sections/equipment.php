<?php
$slider_group = $args["slider_group"];
$title = $slider_group["title"];
$short_description = $slider_group["short_description"];
$gallery_slider = $slider_group["gallery_slider"];
?>
<section class="section gallery">
  <div class="block-slider ensuria-block ensuria-block-slider wrapper">
    <?php if(!empty($title) || !empty($short_description)): ?>
      <div class="gallery__header section-header">
        <?php if(!empty($title)):?>
        <h2 class="gallery__title <?php echo empty($short_description) ? 'no-margin' :''; ?>"><?php echo esc_html($title); ?></h2>
        <?php endif; 
          if(!empty($short_description)):?>
        <p class="gallery__subtitle">
          <?php echo wp_kses($short_description, ['br'=>[]]); ?>
        </p>
        <?php endif; ?>
      </div>
      <?php endif; 
      if(!empty($gallery_slider)):?>
        <div class="slider-inner <?php echo !empty($short_description) ? 'has-subtitle' :''; ?>">
          <div class="swiper-pagination gallery__pagination">
            <div class="gallery-button-prev button-prev">
              <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
            </div>
            <div class="gallery-button-next button-next">
              <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
            </div>
          </div> 
          <div class="gallery-swiper">
            <div class="swiper-wrapper">
              <?php
                foreach($gallery_slider as $index => $image) : 
                ?>
                <div class="gallery__item swiper-slide">
                    <?php echo render_optimized_image($image, 'services-hero', '', false); ?>
                </div>
              <?php 
            endforeach; ?>
            </div>
          </div>
        </div>
        <div class="gallery-progress <?php echo !empty($short_description) ? 'has-subtitle' :''; ?>"></div>
      <?php endif; ?>
  </div>
</section>
