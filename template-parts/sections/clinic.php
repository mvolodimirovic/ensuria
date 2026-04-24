<?php
$clinic = $args['clinic_group'] ?? [];
$title = $clinic['title'] ??'';
$subtitle = $clinic['subtitle'] ??'';
$clinic_ids = $clinic['clinic_list'] ?? [];
$description = $clinic['short_description'] ??'';
$map = $clinic['map'] ?? [];
$template = 'clinic-map';
$required = 10;
$button_navigation = $args['button_navigation'] ?? false;
// $block = $args['block'] ?? null;
// $main_clinic = new WP_Query([
//   'post_type'              => 'clinic',
//   'post_status'            => 'publish',
//   'post__in'               => $clinic_ids,
//   'orderby'                => 'post__in',
//   'posts_per_page'         => $required,
//   'no_found_rows'          => true,
//   'update_post_meta_cache' => false,
//   'update_post_term_cache' => false,
// ]);

// if ($main_clinic->have_posts()): ?>
  <section class="clinic section">
    <div class="wrapper clinic__wrapper">
      <?php if(!empty($title) || !empty($subtitle)): ?>
      <div class="clinic__header section-header"> 
        <?php if(!empty($title)):?>
          <h2 class="clinic__title"><?php echo esc_html($title); ?></h2>
        <?php endif; 
        if(!empty($subtitle)):?>
        <p class="clinic__subtitle">
          <?php echo wp_kses($subtitle, ['br'=>[]]); ?>
        </p>
        <?php endif; ?>
      </div>
      <?php endif; ?>
      <div class="slider-inner">
        <div class="<?php echo $template !== 'clinic-map' ? 'clinic__slider':''; ?> clinic-swiper <?php echo !empty($subtitle) ? ' has-subtitle':'';  echo $map ? 'with-map' : ''; ?>">
          <?php if($template !== 'clinic-map'):?>
          <div class="swiper-wrapper">
          <?php endif; 
              get_template_part('template-parts/cards/card', $template); 
            if($template !== 'clinic-map'):?>
          </div>
          <?php endif; ?>
        </div> 
        <?php if($template !== 'clinic-map'):?>
          <div class="swiper-pagination clinic__pagination" <?php echo is_admin() ? 'style="display:none"' :'';?>>
            <div class="clinic-button-prev button-prev">
              <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
            </div>
            <div class="clinic-button-next button-next">
              <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
            </div>
          </div>
        <?php endif;?>
      </div>
      <?php if($template !== 'clinic-map'):?>
        <div class="clinic-progress <?php echo !empty($subtitle) ? ' has-subtitle':''; ?>"></div>
      <?php 
      endif;
      if(!empty($description)): ?>
        <div class="clinic__description <?php echo !empty($subtitle) ? ' has-subtitle':''; ?>">
          <?php echo esc_html($description); ?>
        </div>
      <?php endif; ?>
    </div>
  </section> 
<?php
// endif; 