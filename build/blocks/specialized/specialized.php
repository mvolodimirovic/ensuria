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

$abs_slider = !empty($abs_defaults['fields']) ? $abs_defaults['fields'] : get_acf_fields(['team_group'], $block['id']);
$button_navigation = get_field('button_navigation', $block['id']);
if (!empty($abs_block['data']['_is_preview'])) : ?> 
  <figure>
    <img src="<?php echo esc_url(get_stylesheet_directory_uri() . '/img/specialized-preview.webp'); ?>"
      alt="<?php esc_html_e('Preview of the Specialized Block', 'ensuria'); ?>" width="100%">
  </figure>
<?php elseif ( !empty($abs_slider['team_group'])) : 

$team = $abs_slider['team_group'] ?? [];
$title = $team['title'] ??'';
$subtitle = $team['subtitle'] ??'';
$team_ids = $team['team_list'] ?? [];
$text_button = $team['text_button'] ?? [];
$required = 50;
$btn = get_title_by_place('block_team',$team_ids);

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

if ($main_team->have_posts()): ?>
    <section class="team section" <?php echo $button_navigation ? 'data-content="'.esc_attr(ensuria_block_runtime_key( $block )).'"' : ''; ?>>
    <div class="wrapper team__wrapper team__wrapper-block">
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
      $is_slider = false;
      $text_button = $text_button ? $text_button : $btn['title'];
      ?>
      <a href="<?php echo esc_url($btn['link'])?>" class="btn btn--middle btn--blue-sky btn--all"><?php echo esc_html($text_button)?></a>
      <div class="slider-inner">
        <?php
        if($count_post > 4): 
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
        <div class="team__slider team-swiper <?php echo !empty($subtitle) ? ' has-subtitle' : ''; ?>">
          <div class="swiper-wrapper">
            <?php while ($main_team->have_posts()): $main_team->the_post(); ?>
              <?php get_template_part('template-parts/cards/card', 'member-slider',['slide'=> $is_slider]); ?>
            <?php endwhile; wp_reset_postdata(); ?>
          </div>
        </div>
      </div>
      <div class="team-progress <?php echo !empty($subtitle) ? 'has-subtitle' : ''; ?>"></div>
    </div>
  </section>
<?php endif; 
endif; 