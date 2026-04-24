<?php
$post_id = get_the_ID();
$specialized = get_the_terms($post_id,'specialized');
$location = get_the_terms($post_id,'location');
$experience = get_field('about_group_experience');
$years = calculate_years_of_experience($experience);
$title = ensuria_wrap_every_n_words(get_the_title(), 2);
$primary_term = ensuria_get_primary_or_first_term($post_id, 'specialized');
$review_ids = ensuria_get_reviews_relationship_ids(
    $post_id,
    'ensuria/reviews',      
    'reviews_group',       
    'reviews_list' 
);
$rating = 0;
$reviews_count = count($review_ids);
if(!empty($review_ids)):
  foreach($review_ids as $review_id):
    $rating += get_field('rating',$review_id);
  endforeach;
endif;

$rating = $reviews_count > 0 ? number_format($rating / $reviews_count, 1, '.', '') : 0; 
?>
<article class="team__member">
  <a href="<?php echo esc_url(get_the_permalink($post_id))?>" class="item-link" aria-label="<?php echo esc_attr(get_the_title())?>"></a>
  <div class="team__member__img-wrapp">
    <div class="team__member__img">
      <?php if (!empty(has_post_thumbnail())) :
          echo render_optimized_image(get_post_thumbnail_id(), 'name', '', false); 
        else :
          echo '<img width="440" height="290" src="'.get_template_directory_uri().'/assets/img/doctors.webp" alt="'.esc_attr(get_the_title()).'">';
      endif; ?>
    </div>
    <div class="team__member__info-mobile">
      <h3><?php echo wp_kses_post($title); ?></h3>
      <?php if(!empty($years)) : ?>
        <span>
          <?php echo esc_html($years); ?> <span><?php echo esc_html(text_label($years, 'year')); ?></span>
        </span>
      <?php endif; 
      if($reviews_count > 0 && (float)$rating > 0):?>
        <div class="doctor__info-person__reviews">
          <div class="doctor__info-person__reviews-rating">
            <?php echo get_icon('icon-star', 'presentation'); ?>
            <span><?php echo esc_html($rating);?></span>
          </div>
          <div class="doctor__info-person__reviews-count">
            <?php echo esc_html('('.$reviews_count .')'); ?>
          </div>
        </div>
      <?php endif; ?>
    </div>
  </div>
  <div class="team__member__inner">
    <div class="team__member__info">
      <h3><?php echo esc_html(get_the_title()); ?></h3>
      <?php 
        echo get_icon('icon-arrow-right', 'presentation'); 
      if(!empty($years )) : ?>
        <span>
          <?php echo esc_html($years); ?> <span><?php echo esc_html(text_label($years, 'year')); ?></span>
        </span>
      <?php endif;
      if($reviews_count > 0 && (float)$rating > 0):?>
        <div class="doctor__info-person__reviews">
          <div class="doctor__info-person__reviews-rating">
            <?php echo get_icon('icon-star', 'presentation'); ?>
            <span><?php echo esc_html($rating);?></span>
          </div>
          <div class="doctor__info-person__reviews-count">
            <?php echo esc_html('('.$reviews_count .')'); ?>
          </div>
        </div>
      <?php endif; 
      if(!empty($primary_term)): ?>
        <div class="team__member__specialized">
          <?php $icon_id = get_field('icon', 'specialized_'.$primary_term->term_id); ?>          
          <p>
            <?php if ( !empty($icon_id ) ) : ?>
              <span class="icon-wrapper">
                <?php echo render_optimized_image($icon_id , 'thumbnail'); ?>
              </span>
            <?php endif; ?>
            <?php echo esc_html($primary_term->name)?>
          </p>
        </div>
      <?php endif; 
      if(!empty($location)): ?>
        <div class="team__member__location">
          <?php
            foreach ($location as $term) : ?>          
              <p>
                <?php echo get_icon('icon-location', 'presentation'); ?>
                <?php echo esc_html($term->name); ?>
              </p>
            <?php
            endforeach; ?>
        </div>
      <?php endif; ?>
    </div>
  </div>
</article>