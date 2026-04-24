<?php
  $slide = $args['slide'] ?? false;
  $post_id = $args['post_id'] ?? get_the_ID();
  $title    = get_the_title( $post_id );
  $date = get_the_date('d.m.Y', $post_id);
  $content  = apply_filters('the_content', get_post_field('post_content', $post_id));
  $rating = get_field('rating', $post_id);
  $thumb_id = get_post_thumbnail_id($post_id);
  $bg_color = author_bg_color_light($title);
  $terms = wp_get_post_terms( $post_id, 'reviews-cat' );
  if(!empty($terms[0]) && !is_wp_error($terms[0])):
    $icon_id  = get_field('icon', 'reviews-cat_' . $terms[0]->term_id);
  else :
    $icon_id = '';
  endif;
?>
<div class="reviews__item <?php echo $slide ? 'swiper-slide' : ''; ?>">
  <div class="reviews__item__head">
    <?php if($rating !== 0 && !empty($rating)):?>
      <div class="reviews__item__rating">
        <div class="stars-clip" style="--rating:<?php echo esc_attr($rating)?>" aria-label="<?php echo esc_attr($rating)?> з 5" role="img"></div>
        <div class="rating-num"><?php echo esc_html($rating); ?><span><?php echo esc_html('/5'); ?></span> </div>
      </div>
    <?php endif; 
    if ( !empty($icon_id) ) : ?>
      <span class="icon-wrapper">
        <?php echo render_optimized_image($icon_id, 'thumbnail'); ?>
      </span>
    <?php endif;?>
  </div>
<?php
  if(!empty($content)) : ?>
    <div class="reviews__item__text">
      <?php echo wp_kses_post($content)?>
    </div>
    <button type="button" class="reviews__item-btn open-modal" data-modal-slug="review" data-id="<?php echo esc_attr(get_the_ID()); ?>"><?php esc_html_e('Читати більше','ensuria'); ?></button>
  <?php endif; ?>
  <div class="reviews__item__info">
    <div class="reviews__item__image" <?php echo empty($thumb_id) ? 'style="background-color:' . esc_attr($bg_color) .'"' : '';?> >
      <?php 
        if(!empty($thumb_id)):
          echo render_optimized_image($thumb_id, 'thumbnail', '', true, '50vw'); 
        else :
          echo esc_html( get_title_initials($title) ); 
        endif;
      ?>
    </div>
    <span class="reviews__item__name">
      <?php echo esc_html($title)?>
    </span>
    <time class="reviews__item__date" datetime="<?php echo esc_attr(get_the_date('Y-m-d',$post_id)); ?>">
      <?php echo esc_html($date); ?>
    </time>
  </div>  
</div>