<?php
get_header();
$spare_title = get_field('spare_title');
$short_description = get_field('short_description');
$faq_group = get_field('faq_group');
$seo_group = get_field('seo_group');
$cta_group = get_field('cta_group','options');
$title = !empty($spare_title) ? $spare_title : get_the_title();

$image_id = has_post_thumbnail() ? get_post_thumbnail_id() : null;

// Hero Block
get_template_part('template-parts/sections/services-hero', null, [
    'short_description'    => $short_description, 
    'title' => $title,
    'image_id' => $image_id
  ]);

// Gutenberg Content
if(!empty(get_the_content())): ?>

  <article class="article-content">
    <div class="wrapper article-content__wrapper">
      <div class="privacy-content">
        <?php the_content() ?>
      </div>
    </div>
  </article>

<?php 
endif;
// FAQ
if(is_array($faq_group) && array_filter($faq_group)){
  get_template_part('template-parts/sections/faq', null, [
    'faq_group'    => $faq_group, 
  ]);
}

// SEO
if(is_array($seo_group) && array_filter($seo_group)){
  get_template_part('template-parts/sections/seo', null, [
    'seo_group'    => $seo_group, 
  ]);
}

get_footer();