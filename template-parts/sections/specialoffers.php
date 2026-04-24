<?php

$specialoffer_ids = $args['specialoffers_group'] ?? [];
$required    = 10;
$main_specialoffers = new WP_Query([
  'post_type'              => 'specialoffers',
  'post_status'            => 'publish',
  'post__in'               => $specialoffer_ids,
  'orderby'                => 'post__in',
  'posts_per_page'         => $required,
  'no_found_rows'          => true,
  'update_post_meta_cache' => false,
  'update_post_term_cache' => false,
]);
?>
<?php if ($main_specialoffers->have_posts()): ?>
  <section class="specialoffers section">
    <div class="wrapper specialoffers__wrapper">
      <div class="specialoffers__header section-header">
        <h2 class="specialoffers__title"><?php esc_html_e('Спецпропозиції', 'ensuria'); ?></h2>
      </div>
      <a href="<?php echo esc_url(get_post_type_archive_link('specialoffers'))?>" class="btn btn--middle btn--blue-sky btn--all"><?php esc_html_e('Всі спецпропозиції','ensuria')?></a>
      <div class="slider-inner">
        <div class="specialoffers__slider specialoffers-swiper">
          <div class="swiper-wrapper">
            <?php while ($main_specialoffers->have_posts()): $main_specialoffers->the_post(); ?>
              <?php get_template_part('template-parts/cards/card', 'specialoffers',['slide'=> true]); ?>
            <?php endwhile; wp_reset_postdata(); ?>
          </div>
        </div>
        <div class="swiper-pagination specialoffers__pagination">
          <div class="specialoffers-button-prev button-prev">
            <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
          </div>
          <div class="specialoffers-button-next button-next">
            <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
          </div>
        </div>
      </div>
      <div class="specialoffers-progress"></div>
    </div>
  </section>
<?php endif; ?>