  <?php 

  $title = $args['title'] ?? '';
  $short_description = $args['short_description'] ?? '';
  $image_id = $args['image_id'] ?? null;
  $btn_text = $args['btn_text'] ?? '';
  ?>
  
  <section class="service-head">
    <div class="wrapper service-head__wrapper">
      <div class="service-head__info">
        <?php
          if ( function_exists('yoast_breadcrumb') ) {
            yoast_breadcrumb( '<p id="breadcrumbs" class="breadcrumbs">','</p>' );
          }
        ?>
        <h1 class="service-head-title"><?php echo esc_html($title); ?></h1>
        <?php if (!empty($short_description)) : ?>
          <p class="service-head-description"><?php echo esc_html($short_description); ?></p>
        <?php endif; 
        if(!empty($btn_text)): ?>
          <button class="btn btn--icon btn--white open-modal service-head__btn" data-modal-slug="contact" aria-label="<?php echo esc_attr($btn_text); ?>">
            <?php echo esc_html($btn_text); ?>
            <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
          </button>
        <?php endif; ?>
      </div>  
      <?php if($image_id) : ?>
        <figure class="service-head-img">
          <?php echo render_optimized_image($image_id, 'services-hero', '', true); ?> 
        </figure>
      <?php endif; ?>
    </div>
  </section>