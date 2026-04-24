<?php
$slide = $args["slide"];
$specailoffers = get_the_ID();
$text = get_post_type($specailoffers) == 'post' ? 'Новина' : 'Спецпропозиція'; 
?>

<article id="specialoffers-<?php echo esc_attr($specailoffers)?>" class="specialoffers__item <?php echo $slide ? 'swiper-slide':'';?>">
  <a href="<?php echo esc_url(get_the_permalink())?>" class="item-link" aria-label="<?php echo esc_attr(get_the_title()); ?>"></a>
  <div class="specialoffers__item__img">
    <?php if (!empty(has_post_thumbnail())) :
      echo render_optimized_image(get_post_thumbnail_id(), 'special-mini', '', false); 
      else :
        echo '<img width="106" height="106" src="'.get_template_directory_uri().'/assets/img/specialoffers.webp" 
              alt="'.esc_attr(get_the_title()) .'"
              loading="lazy">';
    endif; ?>
  </div>
  <div class="specialoffers__item__info">
      <span class="specialoffers__item__info-decore">
        <?php esc_html_e($text,'ensuria'); ?>
      </span>
      <h4><?php echo esc_html(get_the_title())?></h4>
  </div>
</article>