<?php
  $hotline = get_field('phone_number','options');
  // $clinic_footer = new WP_Query([
  //   'post_type' => 'clinic',
  //   'post_status' => 'publish',
  //   'orderby'=> 'date',
  //   'order'=> 'ASC',
  //   'posts_per_page'=> 3,
  //   'no_found_rows'          => true,
  //   'update_post_meta_cache' => false,
  //   'update_post_term_cache' => false,
  // ]);
  $post_id = ensuria_get_page_id_by_template('template-about.php');
  $disclaimer_group = get_field('disclaimer_group','options');
  $pages = get_pages([
      'meta_key'   => '_wp_page_template',
      'meta_value' => 'tamplate-contact.php',
  ]);
  // Disclaimer 
  if(is_array($disclaimer_group) && array_filter($disclaimer_group)):
    get_template_part('template-parts/sections/disclaimer', null, [
      'disclaimer_group'    => $disclaimer_group, 
    ]);
  endif; 
?>   
  </main>
    <footer class="footer">
      <div class="wrapper footer__wrapper">
        <div class="footer__left">
          <a href="<?php echo esc_url(home_url('/'))?>" class="footer__logo" aria-label="<?php echo esc_attr__( 'Головна сторінка', 'ensuria' ); ?>">
            <?php echo get_icon('icon-footer-logo', 'img','Footer Logotype'); ?>
          </a>
          <?php
          if(!empty($hotline) || have_rows('social_links','options')) : 
              get_template_part('template-parts/components/contact', null, ['email_enable' => false]);
              if(have_rows('social_links','options')):?>
                <ul class="footer__socials social">
                  <?php 
                    while(have_rows('social_links','options')) :
                      the_row(); 
                      $link = get_sub_field('link');
                      if(!empty($link)):
                        $icon_id = get_social_network_name($link);
                        ?>
                        <li class="social__item">
                          <a href="<?php echo esc_url($link)?>" class="social-link"  target="_blank" rel="noopener" aria-label="<?php echo esc_attr($icon_id); ?>">
                            <?php echo get_icon('icon-'.$icon_id)?> 
                          </a>
                        </li>
                    <?php endif; 
                  endwhile; ?>
                </ul>
              <?php endif; ?>
          <?php endif; ?>
          <div class="footer__copyright copyright-left">
            <?php echo '&copy; '. esc_html(date('Y')). ' Ensuria Technologies OU'; ?>
          </div>
        </div>
        <div class="footer__right">
          <?php if (has_non_empty_menu('footer_menu')): ?>
            <div class="footer__column">
              <h5>
                <?php _e('Ensuria Medical','ensuria'); ?>
              </h5>
              <nav class="footer__nav" aria-label="Footer Navigation">
                <?php
                  wp_nav_menu([
                    'theme_location' => 'footer_menu',
                    'items_wrap' => '<ul id="%1$s" class="%2$s">%3$s</ul>',
                    'container'      => false,
                    'menu_class'     => 'footer__menu',
                    'menu_id'        => 'footer-menu',
                  ]);
                ?>
              </nav>
            </div>
          <?php endif; 

          // if($clinic_footer->have_posts()) :?>
            <div class="footer__column">
              <h5>
                <?php _e('Наші клініки','ensuria'); ?>
              </h5>
              <address class="footer__addresses">
                <?php            
                  // while ($clinic_footer->have_posts()) : 
                  // $clinic_footer->the_post();
                  // $post_id = get_the_ID();
                  $group = get_field('info_group',$post_id);
                  $eponymous_stop = $group['eponymous_stop'];
                  $location = $group['text_address'];
                  $iframe_address = $group['iframe_address'];
                  $link = ensuria_google_maps_link_from_iframe($iframe_address);
                if(!empty($location)):
                    ?>
                      <div class="footer__address">
                        <button type="button" class="email-copy click-to-copy" data-email="<?php echo esc_attr($location); ?>">
                          <?php echo esc_html($location); ?>
                          <span class="visually-hidden"><?php _e('Скопійовано','ensuria'); ?></span>
                        </button>
                        <?php if(!empty($eponymous_stop)):?>
                          <span><?php echo esc_html($eponymous_stop)?></span>
                        <?php endif; 
                        if(!empty($link)): ?>
                          <a href="<?php echo esc_url($link)?>" class="footer__address-link" target="_blank" rel="noreferrer nofollow noopener"><?php _e('Прокласти маршрут','ensuria')?></a>
                        <?php endif; ?>
                      </div>
                  <?php endif;
               //endwhile; wp_reset_postdata(); ?>
              </address>
            </div>  
          <?php // endif; ?>
          <div class="footer__bottom">
            <?php if (has_non_empty_menu('footer_menu_bottom')): ?>
              <nav class="footer__bottom-nav footer__nav" aria-label="Footer Bottom Navigation">
                <?php
                  wp_nav_menu([
                    'theme_location' => 'footer_menu_bottom',
                    'items_wrap' => '<ul id="%1$s" class="%2$s">%3$s</ul>',
                    'container'      => false,
                    'menu_class'     => 'footer__menu',
                    'menu_id'        => 'footer-bottom-menu',
                  ]);
                ?>
              </nav>
            <?php endif; ?>
            <div class="footer__copyright copyright-bottom">
              <?php echo '&copy; '. esc_html(date('Y')). ' Ensuria Technologies OU'; ?>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </div>
    <?php wp_footer(); ?>
  </body>
</html>