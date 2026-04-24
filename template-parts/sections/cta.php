<?php
$cta = $args['cta_group'];
$image_id = $cta['cta_image'] ?? '';
$title = $cta['cta_title'] ??'';
$content = $cta['cta_content'] ??'';
$label = $cta['label']??'';
$email = $cta['email']??'';
?>

<section class="cta section">
  <div class="wrapper cta__wrapper">
    <div class="cta__left">
      <div class="cta__info">
        <?php if (!empty($image_id)) : ?>
          <figure class="cta__media">
            <?php echo render_optimized_image($image_id, 'large', 'cta__image', false, '50vw'); ?>
          </figure>
        <?php endif; ?>

        <?php if (!empty($title)) : ?>
          <h3 ><?php echo esc_html($title); ?></h3>
        <?php endif; ?>

        <?php if (!empty($content)) : ?>
          <p class="cta__desc"><?php echo esc_html($content); ?></p>
        <?php endif; ?>
      </div>
      <?php get_template_part('template-parts/components/form', null, ['class' => 'cta__form add-ajax-request']);?>
    </div>

    <aside class="cta__support" <?php echo !empty($label) ? 'aria-label="'.esc_attr($label).'"':'';?>>
      <?php if(!empty($label )):?>
        <div class="cta__support-head">
          <span class="cta__support-title"><?php echo esc_html($label); ?></span>
          <?php echo get_icon('icon-arrow-down', 'presentation'); ?>
        </div>
      <?php endif;

      get_template_part('template-parts/components/contact', null, ['email_enable' => true, 'email'=> $email]);

      if(have_rows('social_links','options')):?>
        <ul class="cta__socials social">
          <?php 
            while(have_rows('social_links','options')) :
              the_row(); 
              $link = get_sub_field('link');
              if(!empty($link)):
                $icon_id = get_social_network_name($link);
                ?>
                <li class="social__item">
                  <a href="<?php echo esc_url($link)?>" class="social-link" aria-label="<?php echo esc_attr($icon_id); ?>">
                    <?php echo get_icon('icon-'.$icon_id)?> 
                  </a>
                </li>
            <?php endif; 
          endwhile; ?>
        </ul>
      <?php endif; ?>
    </aside>
  </div>
</section>
