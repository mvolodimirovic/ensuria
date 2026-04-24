<?php 
/**
 * Template Name: Контакти
 */ 

get_header();

$seo_group = get_field('seo_group');
$clinic_group = get_field('clinic_group');
get_template_part('/template-parts/sections/page-header',null,['title'=> get_the_title()]);

// Gootenberg Content 
if(!empty(get_the_content())): ?>

  <article class="article-content contact-content">
    <div class="wrapper article-content__wrapper">
      <div class="privacy-content">
        <?php the_content() ?>
      </div>
    </div>
  </article>

<?php 
endif;
// SEO
if(is_array($seo_group) && array_filter($seo_group)){
  get_template_part('template-parts/sections/seo', null, [
    'seo_group'    => $seo_group, 
  ]);
}

get_footer();