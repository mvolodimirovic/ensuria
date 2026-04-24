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
$abs_reviews = !empty($abs_defaults['fields']) ? $abs_defaults['fields'] : get_acf_fields(['reviews_group'], $block['id']);

if ( !empty($abs_reviews['reviews_group'])) : 

$reviews = $abs_reviews['reviews_group'] ?? [];
$title = $reviews['title'] ??'';
$subtitle = $reviews['subtitle'] ??'';
$reviews_ids = $reviews['reviews_list'] ?? [];
$text_button = $reviews['text_button'] ?? [];
$required = 50;
$btn = get_title_by_place('block_reviews',$reviews_ids);

$main_reviews = new WP_Query([
  'post_type'              => 'reviews',
  'post_status'            => 'publish',
  'post__in'               => $reviews_ids,
  'orderby'                => 'post__in',
  'posts_per_page'         => $required,
  'no_found_rows'          => true,
  'update_post_meta_cache' => false, 
  'update_post_term_cache' => false,
]);

if ($main_reviews->have_posts()): ?>
  <section class="reviews section stop-section" <?php echo $button_navigation ? 'data-content="'.esc_attr(ensuria_block_runtime_key( $block )).'"' : ''; ?>>
    <div class="wrapper reviews__wrapper reviews__wrapper-block">
      <?php if(!empty($title) || !empty($subtitle)): ?>
      <div class="reviews__header section-header">
        <?php if(!empty($title)):?>
        <h2 class="reviews__title <?php echo empty($subtitle) ? 'no-margin' :''; ?>"><?php echo esc_html($title); ?></h2>
        <?php endif; 
          if(!empty($subtitle)):?>
        <p class="reviews__subtitle">
          <?php echo wp_kses($subtitle, ['br'=>[]]); ?>
        </p>
        <?php endif; ?>
      </div>
      <?php endif; 
      if(!is_admin()): ?>
        <a href="<?php echo esc_url(get_post_type_archive_link('reviews'))?>" class="btn btn--middle btn--blue-sky btn--all"><?php esc_html_e('Всі відгуки','ensuria')?></a>
      <?php endif; ?>
      <div class="slider-inner">
        <?php if(!is_admin()): ?>
          <div class="swiper-pagination reviews__pagination">
            <div class="reviews-button-prev button-prev">
              <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
            </div>
            <div class="reviews-button-next button-next">
              <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
            </div>
          </div>
        <?php endif; ?>
        <div class="reviews__slider reviews-swiper <?php echo !empty($subtitle) ? ' has-subtitle' :''; ?>">
          <div class="swiper-wrapper">
            <?php while ($main_reviews->have_posts()): $main_reviews->the_post(); 
              $rating = get_field('rating');
              $content = get_the_content();
              $thumb_id = get_post_thumbnail_id();
              $bg_color = author_bg_color_light(get_the_title());
              get_template_part('template-parts/cards/card-review', null,['slide'=> true]);
            endwhile; wp_reset_postdata(); ?>
          </div>
        </div>
      </div>
      <div class="reviews-progress <?php echo !empty($subtitle) ? 'has-subtitle' :''; ?>"></div>
    </div>
  </section>
<?php endif; 
endif; 