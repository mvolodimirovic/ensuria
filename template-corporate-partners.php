<?php 
/**
 * Template Name: Корпоративні партнери
 */ 

get_header();

$hero_group = get_field('hero_group');
$communications_group = get_field('communications_group');
$reviews_group = get_field('reviews_group');
$slider_group = get_field('slider_group');
$individual_group = get_field('individual_group');
$planning_group = get_field('planning_group');
$image_id = has_post_thumbnail() ? get_post_thumbnail_id() : null;
$cta_group = get_field('cta_group');
$seo_group = get_field('seo_group');

// Hero Block
get_template_part('template-parts/sections/services-hero', null, [
  'short_description'    => $hero_group['short_description'] ?? '', 
  'title' => get_the_title(),
  'image_id' => $image_id,
  'btn_text' => $hero_group['btn_text'] ?? '',
]); 

if(is_array($communications_group) && array_filter($communications_group)): 
$label = $communications_group['label'] ??'';
$email = $communications_group['email'] ??'';
$small_text = $communications_group['small_text'] ??'';
?>
<section class="section communication">
  <div class="wrapper communication__wrapper">
    <?php if(!empty($label)):?>
      <span class="communication__label"><?php echo esc_html($label)?></span>
    <?php endif; 
    if(!empty($email)): ?>
      <a href="mailto:<?php echo esc_attr($email)?>" class="communication__email"><?php echo esc_html($email)?></a>
    <?php endif;
    if(!empty($small_text)): ?>
      <small><?php echo esc_html($small_text)?></small>
    <?php endif; ?>
  </div>
</section>
<?php
endif;

// Individual
if(is_array($individual_group) && array_filter($individual_group)){
  get_template_part('template-parts/sections/individual', null, [
    'individual_group'    => $individual_group, 
  ]);
}
// Planning
if(is_array($planning_group) && array_filter($planning_group)){
  get_template_part('template-parts/sections/planning', null, [
    'planning_group'    => $planning_group, 
  ]);
}
// Team and equipment
if(is_array($slider_group) && array_filter($slider_group)){
  get_template_part('template-parts/sections/equipment', null, [
    'slider_group'    => $slider_group, 
  ]);
}

// Reviews
if(is_array($reviews_group) && array_filter($reviews_group)){

  get_template_part('template-parts/sections/reviews', null, [
    'reviews_group'    => $reviews_group, 
    'slide'    => true, 
    'count' => true,
  ]);
}
// Call To Action
if(is_array($cta_group) && array_filter($cta_group)){
  get_template_part('template-parts/sections/cta', null, [
    'cta_group'    => $cta_group, 
    'is_cp' => true,
  ]);
}

// SEO
if(is_array($seo_group) && array_filter($seo_group)):
  get_template_part('template-parts/sections/seo', null, [
    'seo_group'    => $seo_group, 
  ]);
endif;

get_footer();