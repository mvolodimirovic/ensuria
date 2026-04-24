<?php
$hotline = get_field('phone_number','option');
// $clinic_header = new WP_Query([
//   'post_type' => 'clinic',
//   'post_status' => 'publish',
//   'orderby'=> 'date',
//   'order'=> 'ASC',
//   'posts_per_page'=> 3,
//   'no_found_rows'          => true,
//   'update_post_meta_cache' => false,
//   'update_post_term_cache' => false,
// ]);
$is_site_indexable = get_option('blog_public') == '1';
$banner_content = get_field('banner_content','options');
$christmas_work_hours = get_field('christmas_work_hours','options');
$about_id = ensuria_get_page_id_by_template('template-about.php');
?> 
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">

	<?php wp_head();

	if ($is_site_indexable) : ?>
		<!-- Google Tag Manager -->
		<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
		new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
		j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
		'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
		})(window,document,'script','dataLayer','GTM-K5Z2QXN');</script>


    <!-- <script>
      (function () {
        let GTM_ID = 'GTM-K5Z2QXN';
        let DL = 'dataLayer';

        window[DL] = window[DL] || [];
        window[DL].push({ 'gtm.start': Date.now(), event: 'gtm.js' });

        function loadGTM() {
          if (window.__gtmLoaded) return;
          window.__gtmLoaded = true;

          let s = document.createElement('script');
          s.async = true;
          s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(GTM_ID);
          document.head.appendChild(s);
        }

        ['pointerdown','keydown','touchstart','scroll'].forEach(function (ev) {
          window.addEventListener(ev, loadGTM, { once: true, passive: true });
        });

        window.addEventListener('load', function () {
          setTimeout(loadGTM, 500);
        });

        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadGTM, { timeout: 1200 });
        }
      })();
    </script> -->

		<!-- End Google Tag Manager (noscript) -->
	<?php endif; ?>
</head>

<body <?php body_class(); ?>>
  
<?php
  if ($is_site_indexable) : ?>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K5Z2QXN"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
<?php endif; 
wp_body_open(); ?>
<div id="site">
  <header id="header" class="header">
    <?php if(!empty($banner_content) && !empty($christmas_work_hours[0])): ?>
      <div class="header__banner">
        <div class="header__wrapper wrapper header__wrapper--banner">
          <a href="<?php echo esc_url($christmas_work_hours[0])?>" class="header__banner__content" aria-label="<?php esc_attr_e('Новорічні графіки','ensuria')?>">
            <?php echo wp_kses_post($banner_content); ?>
          </a>
        </div>
      </div>
    <?php endif; ?>
    <div class="header__top">
      <div class="wrapper header__wrapper">
        <?php 
          if(!empty($about_id)):
        //if($clinic_header->have_posts()) : 
          echo '<address class="header__addresses">';
            //while ($clinic_header->have_posts()) : 
              //$clinic_header->the_post();
              // $post_id = get_the_ID();
              $group = get_field('info_group',$about_id);
              $eponymous_stop = $group['eponymous_stop'];
              $location = $group['text_address'];
              if(!empty($location)):
              ?>
                <a href="<?php echo esc_url(get_the_permalink($about_id))?>" 
                  class="header__addresses__item btn btn--icon btn--white" 
                  aria-label="<?php echo esc_attr(get_the_title($about_id)); ?>"
                  >
                  <span>
                    <?php echo esc_html($location); ?>
                    <?php if(!empty($eponymous_stop)):?>
                      <span><?php echo esc_html($eponymous_stop)?></span>
                    <?php endif; ?>
                  </span>
                  <?php echo get_icon('icon-location-old', 'presentation'); ?>
                </a>
              
            <?php endif;
            // endwhile; wp_reset_postdata();
          echo '</address>';
        endif;
          ?>
        <div class="header__controls">
          <?php if(!empty($hotline)):?>
            <a href="tel:<?php echo esc_attr(preg_replace('/\D/','',$hotline))?>" class="header__addresses__item btn btn--icon btn--white" aria-label="<?php echo esc_attr__( 'Номер телефону', 'ensuria' ); ?>">
              <span>
                <?php echo esc_html($hotline)?>
                <span><?php _e('*дзвінок безкоштовний','ensuria')?></span>
              </span>
              <?php echo get_icon('icon-phone', 'presentation'); ?>
            </a>
          <?php endif; ?>
        </div>
      </div>
    </div>
    <div class="header__main">
      <div class="wrapper header__wrapper">
        <a href="<?php echo esc_url(home_url('/'))?>" class="header__logo" aria-label="<?php echo esc_attr__( 'Головна сторінка', 'ensuria' ); ?>">
          <?php echo get_icon('icon-logo', 'img','Logotype'); ?>
          <?php echo get_icon('icon-logo-mobile', 'img','Logotype'); ?>
        </a>
        <?php if (has_non_empty_menu('top_menu')): ?>
          <nav class="header__nav" aria-label="Desktop Navigation">
            <?php
              wp_nav_menu([
                'theme_location' => 'top_menu',
                'items_wrap' => '<ul id="%1$s" class="%2$s">%3$s</ul>',
                'container'      => false,
                'menu_class'     => 'header__menu menu',
                'menu_id'        => 'top-menu',
                'walker' => new Top_Walker_Nav_Menu(),
              ]);
            ?>
          </nav>
        <?php endif; ?>
        <button type="button" class="btn btn--dark btn--middle header__button open-modal" 
          data-modal-slug="contact" 
          aria-label="<?php echo esc_attr__( 'Записатись до лікаря', 'ensuria' ); ?>">
          <?php _e('Записатись','ensuria'); ?><span>&nbsp;<?php _e('до лікаря','ensuria')?></span>
        </button>
        <button type="button" class="header__burger" data-menu="mobile" aria-label="<?php echo esc_attr__( 'Відкрити мобільне меню', 'ensuria' ); ?>">
            <?php echo get_icon('icon-burger', 'presentation'); ?>
        </button>
      </div>
    </div>
    <?php if(is_singular('clinic')): ?>
      <div class="head-sticky">
        <?php get_template_part('template-parts/sections/buttons-team','',['post_id'=>get_queried_object_id(),'wrapper_class'=>'wrapper']); ?>
      </div> 
    <?php endif; ?>
  </header>
  <main id="main" class="main">