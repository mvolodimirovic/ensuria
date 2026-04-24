<?php
get_header();

$seo_group = get_field('seo_group');
$current_id = get_the_ID();
$thumb_id = get_post_thumbnail_id();
$specialized = get_the_terms($current_id,'specialized');

$about_group = get_field('about_group');

$experience = $about_group['experience'] ?? '';
$short_description = $about_group['short_description'] ?? '';

$rating = 0;
$certificate_group = get_field('certificate_group','options');

$review_ids = ensuria_get_reviews_relationship_ids(
    $current_id,
    'ensuria/reviews',      
    'reviews_group',       
    'reviews_list' 
);
$title = ensuria_wrap_every_n_words(get_the_title(), 1);
// $title contains HTML markup (span tags) returned from ensuria_wrap_every_n_words().
// Always escape with wp_kses_post() when outputting. Do not treat as plain text.
$reviews_count = count($review_ids);
$review_label = text_label($reviews_count, 'review');

$years = calculate_years_of_experience($experience);
if(!empty($review_ids)):
  foreach($review_ids as $review_id):
    $rating += get_field('rating',$review_id);
  endforeach;
endif;

$rating = $reviews_count > 0 ? number_format($rating / $reviews_count, 1, '.', '') : 0; 
$primary_term = ensuria_get_primary_or_first_term($current_id, 'specialized');
?>  
<section class="top">
  <div class="wrapper">
        <?php 
    if ( function_exists('yoast_breadcrumb') ) {
      yoast_breadcrumb( '<p id="breadcrumbs" class="breadcrumbs">','</p>' );
    } ?>
  </div>
</section>
<section class="doctor">
  <div class="wrapper doctor__wrapper">
      <?php 
      if(!empty($thumb_id)):?>
        <div class="doctor__info-person__image-wrap">
          <figure class="doctor__info-person__image">
            <?php echo render_optimized_image(get_post_thumbnail_id(), 'name', '', true, '100vw'); ?>
          </figure>
        </div>
      <?php endif; ?>
        <div class="doctor__info-person__details">
          <h1><?php echo wp_kses_post($title); ?></h1>
          <?php 
          if(!empty($primary_term)):?>
          <div class="doctor__info-person__primary-term team__member__specialized">
            <?php  $icon_id = get_field('icon', 'specialized_'.$primary_term->term_id); ?>          
              <p>
                <?php if ( !empty($icon_id) ) : ?>
                  <span class="icon-wrapper">
                    <?php echo render_optimized_image($icon_id , 'thumbnail'); ?>
                  </span>
                <?php endif; ?>
                <?php echo esc_html($primary_term->name)?>
              </p>
          </div>
          <?php endif;
          if($reviews_count > 0 && (float)$rating > 0):?>
            <div class="doctor__info-person__reviews">
              <div class="doctor__info-person__reviews-rating">
                <?php echo get_icon('icon-star', 'presentation'); ?>
                <span><?php echo esc_html($rating);?></span>
              </div>
              <div class="doctor__info-person__reviews-count">
                <?php echo esc_html('('.$reviews_count . ' ' . $review_label.')'); ?>
              </div>
            </div>
          <?php endif; 
          if(!empty($years)) : ?>
            <div class="doctor__info-person__experience">
              <?php echo esc_html($years) ?> <span><?php echo esc_html(text_label($years, 'year'));?></span>
            </div>
          <?php endif; 
          if(!empty($specialized)):?>
            <div class="doctor__info-person__specialized team__member__specialized">
              <?php 
                foreach ($specialized as $term) : ?>          
                  <span>
                    <?php echo esc_html($term->name)?>
                  </span>
                <?php
                endforeach;
                ?>
            </div>
          <?php endif; 
          if(!empty($short_description)): ?>
            <div class="doctor__info-description">
              <?php echo wp_kses_post($short_description); ?>
            </div>
          <?php endif; ?>
          <button type="button" class="btn btn--blue-sky btn--middle open-modal" 
            data-modal-slug="contact" 
            aria-label="<?php echo esc_attr__( 'Записатись до лікаря', 'ensuria' ); ?>">
            <?php _e('Записатись до лікаря','ensuria')?>
          </button>
        </div>
  </div>
</section>
<?php if(!empty(get_the_content())): ?>
  <section class="doctor__info-services article-content section">
    <div class="wrapper article-content__wrapper">
      <div class="privacy-content">
        <?php the_content(); ?>
      </div>
    </div>
  </section>
<?php endif; ?>
<?php

// SEO
if(is_array($seo_group) && array_filter($seo_group)):
  get_template_part('template-parts/sections/seo', null, [
    'seo_group'    => $seo_group, 
  ]);
endif;
get_footer();
 