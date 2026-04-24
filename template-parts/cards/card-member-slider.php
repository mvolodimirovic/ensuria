<?php
$member = get_the_ID();
$specialized = get_the_terms(get_the_ID(),'specialized');
$index = 0;
$title = get_the_title();
?>

<article id="team-<?php echo esc_attr($member)?>" class="team__item swiper-slide">
  <a href="<?php echo esc_url(get_permalink($member)) ?>" class="item-link" aria-label="<?php echo esc_attr($title); ?>"></a>
  <div class="team__item__img">
    <?php if (!empty(has_post_thumbnail())) :
        echo render_optimized_image(get_post_thumbnail_id(), 'name', '', false, '100vw'); 
      else :
        echo '<img width="440" height="290" src="'.get_template_directory_uri().'/assets/img/doctors.webp" alt="'.esc_attr($title).'">';
    endif; ?>
  </div>
  <div class="team__item__info">
      <h4><?php echo esc_html($title)?></h4>
      <p>
        <?php 
        if(!empty($specialized) && !is_wp_error($specialized)) :
          $total = count($specialized);
          foreach ($specialized as $term) : 
            $index++;
            echo esc_html($term->name); 
              if ($index < $total) {
                  echo ', ';
              } 
          endforeach;
        endif; 
        ?>
      </p>
  </div>
</article>