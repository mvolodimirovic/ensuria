<?php
$count_false = $args["count"] ?? 0;
$place = $args["place"] ?? '';
$team = $args['team_group'] ?? [];
$title = $team['title'] ??'';
$subtitle = $team['subtitle'] ??'';
$team_ids = $team['team_list'] ?? [];
$required = 50;

$btn = get_title_by_place($place,$team_ids);
if ($count_false) :
  if (!empty($team_ids) && count($team_ids) < $required) :
    $extra_team = new WP_Query([
      'post_type'              => 'team',
      'post_status'            => 'publish',
      'posts_per_page'         => $required - count($team_ids),
      'post__not_in'           => $team_ids,
      'fields'                 => 'ids',
      'no_found_rows'          => true,
      'update_post_meta_cache' => false,
      'update_post_term_cache' => false,
    ]);

    $team_ids = array_merge($team_ids, $extra_team->posts);
  endif;
endif;

$main_team = new WP_Query([
  'post_type'              => 'team',
  'post_status'            => 'publish',
  'post__in'               => $team_ids,
  'orderby'                => 'post__in',
  'posts_per_page'         => $required,
  'no_found_rows'          => true,
  'update_post_meta_cache' => false,
  'update_post_term_cache' => false,
]);

?>
<?php if ($main_team->have_posts()): ?>
  <section class="team section">
    <div class="wrapper team__wrapper">
      <?php if(!empty($title) || !empty($subtitle)): ?>
      <div class="team__header section-header">
        <?php if(!empty($title)):?>
          <h2 class="team__title"><?php echo esc_html($title); ?></h2>
        <?php endif; 
        if(!empty($subtitle)):?>
        <p class="team__subtitle">
          <?php echo wp_kses($subtitle, ['br'=>[]]); ?>
        </p>
        <?php endif; ?>
      </div>
      <?php endif; 
      $count_post = count($main_team->posts);
      $is_slider = false;?>
      <a href="<?php echo esc_url($btn['link'])?>" class="btn btn--middle btn--blue-sky btn--all"><?php echo esc_html($btn['title'])?></a>
      <div class="slider-inner">
        <?php if($count_post > 5): 
          $is_slider = true;
          ?>
          <div class="swiper-pagination team__pagination">
            <div class="team-button-prev button-prev">
              <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
            </div>
            <div class="team-button-next button-next">
              <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
            </div>
          </div>
        <?php endif;?>
        <div class="team__slider team-swiper <?php echo !empty($subtitle) ? ' has-subtitle' : '' ; ?>">
          <div class="swiper-wrapper">
            <?php while ($main_team->have_posts()): $main_team->the_post(); ?>
              <?php get_template_part('template-parts/cards/card', 'member-slider'); ?>
            <?php endwhile; wp_reset_postdata(); ?>
          </div>
        </div>
      </div>
      <div class="team-progress <?php echo !empty($subtitle) ? 'has-subtitle' :''; ?>"></div>
    </div>
  </section>
<?php endif; ?>