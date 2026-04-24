<?php
$hotline = get_field('phone_number','option');
$clinic_header = new WP_Query([
  'post_type' => 'clinic',
  'post_status' => 'publish',
  'orderby'=> 'date',
  'order'=> 'ASC',
  'posts_per_page'=> 3,
  'no_found_rows'          => true,
  'update_post_meta_cache' => false,
  'update_post_term_cache' => false,
]);
?>
<div class="header__mobile header-mobile">
  <div class="header-mobile__wrapper wrapper">
    <div class="header-mobile__top">
      <a href="<?php echo esc_url(home_url('/'))?>" class="header__logo" aria-label="<?php echo esc_attr__('Головна сторінка','ensuria')?>">
        <?php echo get_icon('icon-logo-mobile', 'img','Logotype'); ?>
      </a>
      <button type="button" class="btn btn--dark header__button btn--middle open-modal" data-modal-slug="contact" aria-label="<?php echo esc_attr__('Записатись до лікаря','ensuria'); ?>">
        <?php _e('Записатись','ensuria'); ?><span>&nbsp;<?php _e('до лікаря','ensuria')?></span>
      </button>
      <button type="button" class="button-close-menu" aria-label="<?php echo esc_attr__('Закрити мобільне меню','ensuria'); ?>">
        <?php echo get_icon('icon-burger-close','presentation'); ?>
      </button>
    </div>
    <div class="header-mobile__middle">
      <nav class="header-mobile__menu">
        <?php
          wp_nav_menu([
            'theme_location' => 'top_menu',
            'items_wrap' => '<ul id="%1$s" class="%2$s">%3$s</ul>',
            'container'      => false,
            'menu_class'     => 'header-mobile__menu menu',
            'menu_id'        => 'top-menu',
            'walker' => new Top_Walker_Nav_Menu(),
          ]);
        ?>
      </nav>
    </div>
    <address class="header-mobile__bottom">
      <?php 
        if(!empty($hotline)):?>
          <a href="tel:<?php echo esc_attr(preg_replace('/\D/','',$hotline))?>" class="header__addresses__item hight-size" aria-label="<?php echo esc_attr__('Номер телефону','ensuria'); ?>">
            <span>
              <?php echo esc_html($hotline)?>
              <span><?php _e('*дзвінок безкоштовний','ensuria')?></span>
            </span>
          </a>
        <?php endif; 
        if($clinic_header->have_posts()) : 
            while ($clinic_header->have_posts()) : 
              $clinic_header->the_post();
              $post_id = get_the_ID();
              $group = get_field('info_group',$post_id);
              $eponymous_stop = $group['eponymous_stop'];
              $location_text = $group['text_address'];
              $location_iframe = ensuria_get_iframe_maps_link( $group['iframe_address'] );
              if(!empty($location_text) && !empty($location_iframe)):
                $link = $location_iframe;
              ?>
                <div class="header__addresses__item" data-map-link="<?php echo esc_attr($link)?>" aria-label="<?php echo esc_attr(get_the_title()); ?>">
                  <span>
                    <?php echo esc_html($location_text); ?>
                    <?php if(!empty($eponymous_stop)):?>
                      <span><?php echo esc_html($eponymous_stop)?></span>
                    <?php endif; ?>
                  </span>
                    </div>
              
            <?php endif;
            endwhile; wp_reset_postdata();
        endif;
          ?>
    </address>
  </div>
  <div class="header-mobile__bg"></div>
</div>