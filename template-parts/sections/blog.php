<?php

$blog = $args['blog_group'] ?? [];
$scpecialoffer_title = $args['title'] ??'';
$post_type = $args['post_type'] ??'post';
$title = $blog['title'] ?? 'Більше новин Ensuria Medical';
$subtitle = $blog['subtitle'] ??'';
$blog_ids = $blog['blog_list'] ?? [];
$required = 10;
$title = !empty($scpecialoffer_title) ? $scpecialoffer_title : $title;

$main_blog = new WP_Query([
  'post_type'              => $post_type,
  'post_status'            => 'publish',
  'post__in'               => $blog_ids,
  'orderby'                => 'post__in',
  'posts_per_page'         => $required,
  'no_found_rows'          => true,
  'update_post_meta_cache' => false,
  'update_post_term_cache' => false,
]);
?>
<?php if ($main_blog->have_posts()): ?>
  <section class="blog section">
    <div class="wrapper blog__wrapper">
      <?php if(!empty($title) || !empty($subtitle)): ?>
      <div class="blog__header section-header">
        <?php if(!empty($title)):?>
          <h2 class="blog__title"><?php _e($title); ?></h2>
        <?php endif; 
        if(!empty($subtitle)):?>
        <p class="blog__subtitle">
          <?php echo wp_kses($subtitle, ['br'=>[]]); ?>
        </p>
        <?php endif; ?>
      </div>
      <?php endif; 
      if(!is_home()):?>
        <a href="<?php echo esc_url(get_post_type_archive_link('post')); ?>" class="btn btn--middle btn--blue-sky btn--all"><?php esc_html_e('Всі новини','ensuria'); ?></a>
      <?php endif; ?>
      <div class="slider-inner">
        <div class="swiper-pagination blog__pagination">
          <div class="blog-button-prev button-prev">
            <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
          </div>
          <div class="blog-button-next button-next">
            <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
          </div>
        </div>
        <div class="blog__slider blog-swiper <?php echo !empty($subtitle) ? 'has-subtitle' : ''; ?>">
          <div class="swiper-wrapper">
            <?php while ($main_blog->have_posts()): $main_blog->the_post(); ?>
              <?php get_template_part('template-parts/cards/card', 'blog',['slide'=> true]); ?>
            <?php endwhile; wp_reset_postdata(); ?>
          </div>
        </div>
      </div>
      <div class="blog-progress <?php echo !empty($subtitle) ? 'has-subtitle' : ''; ?>"></div>
    </div>
  </section>
<?php endif; ?>