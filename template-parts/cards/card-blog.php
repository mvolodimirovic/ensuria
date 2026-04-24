<?php
$slide = $args["slide"];
$item = get_the_ID();
$post_type = get_post_type( $item );
?>

<article id="blog-<?php echo esc_attr($item)?>" class="blog__item <?php echo $slide ? 'swiper-slide':'';?>">
  <a href="<?php echo esc_url(get_the_permalink())?>" class="item-link" aria-label="<?php echo esc_attr(get_the_title()); ?>"></a>
  <div class="blog__item__img">
    <?php if (!empty(has_post_thumbnail())) :
      echo render_optimized_image(get_post_thumbnail_id(), 'name', '', false, '100vw'); 
    else :
      $img = $post_type == 'post'? 'news.webp':'specialoffers.webp';
        echo '<img width="440" height="290" src="'.get_template_directory_uri().'/assets/img/'.$img.'">';
    endif; ?>
  </div>
  <div class="blog__item__info">
      <h4><?php echo esc_html(get_the_title())?></h4>
      <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
      <time datetime="<?php echo esc_attr(get_the_date('Y-m-d'))?>"><?php echo esc_html(get_the_date('d.m.Y'))?></time>
  </div>
</article>