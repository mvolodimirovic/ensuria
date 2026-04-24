<?php 
/**
 * Template Name: Політика приватності
 */ 

get_header();

$seo_group = get_field('seo_group');?>
<section class="page-header">
  <div class="wrapper">
    <?php
      if ( function_exists('yoast_breadcrumb') ) {
        yoast_breadcrumb( '<p id="breadcrumbs" class="breadcrumbs">','</p>' );
      } 
      get_template_part('/template-parts/sections/blog-header',null,['title'=> get_the_title()]);
    ?>
  </div>
</section>        
<?php
// Gootenberg Content 
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
// SEO
if(is_array($seo_group) && array_filter($seo_group)){
  get_template_part('template-parts/sections/seo', null, [
    'seo_group'    => $seo_group, 
  ]);
}

get_footer();