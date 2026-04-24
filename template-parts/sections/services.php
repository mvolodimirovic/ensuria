<?php
$service_group = $args['services_group'] ?? [];
$title         = $service_group['title'] ?? '';
$subtitle      = $service_group['subtitle'] ?? '';

$is_services_archive = is_post_type_archive('services');

if ( $is_services_archive ) {
  global $wp_query;
  $loop = $wp_query;
} else {
  $args_services = [
    'post_type'              => 'services',
    'posts_per_page'         => 100,
    'orderby'                => 'menu_order',
    'order'                  => 'ASC',
    'post_status'            => 'publish',
    'no_found_rows'          => true,
    'update_post_meta_cache' => false,
    'update_post_term_cache' => false,
  ];
  $loop = new WP_Query($args_services);
}

if ( $loop->have_posts() ) : ?>
  <section class="services section <?php echo $is_services_archive ? 'white-section' : ''; ?>">
    <div class="wrapper services__wrapper">
      <?php if ( !empty($title) || !empty($subtitle) ) : ?>
        <div class="services__header section-header">
          <?php if ( !empty($title) ) : ?>
            <h2 class="services__title"><?php echo esc_html($title); ?></h2>
          <?php endif; ?>

          <?php if ( !empty($subtitle) ) : ?>
            <p class="services__subtitle">
              <?php echo wp_kses($subtitle, ['br' => []]); ?>
            </p>
          <?php endif; ?>
        </div>
      <?php endif; ?>

      <div class="services__list <?php echo !empty($subtitle) ? 'has-subtitle' : ''; ?>">
        <?php
        $index = 0;
        $count_item = count($loop->posts);
        while ( $loop->have_posts() ) :
          $loop->the_post();

          $index++;
          $service_id    = get_the_ID();
          $item_spare_title = get_field('spare_title', $service_id);
          $item_title    = !empty($item_spare_title) ? $item_spare_title : get_the_title($service_id);
          $item_link     = get_the_permalink($service_id);
          $item_subtitle = get_field('subtitle', $service_id);
          $icon_id    = get_field('icon', $service_id);
          $item_class = '';
          if ( $index > 4 ) {
            $offset     = $index - 4;
            $block_full = $offset % 4;
            if ( $block_full > 0 && $block_full <= 2 ) {
              $item_class = 'card--full';
            } else if($count_item === $index){
              $item_class .= ' card--full';
            }
          }
          $args = [
            'title' => $item_title,
            'item_link' => $item_link,
            'icon_id' => $icon_id,
            'item_subtitle' => $item_subtitle,
            'item_class' => $item_class
          ];
          get_template_part('/template-parts/cards/card-services','',$args);
          endwhile; ?>
      </div>
    </div>
  </section>
<?php
endif;
if ( !$is_services_archive ) {
  wp_reset_postdata();
}
