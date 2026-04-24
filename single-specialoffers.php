<?php
get_header();

$seo_group = get_field('seo_group');
$cta_group = get_field('cta_group','options');
$current_id = get_the_ID();
$current_terms = wp_get_post_terms( $current_id, 'specialoffers_cat', ['fields' => 'slugs'] );
$current_slug = !empty($current_terms) ? $current_terms[0] : '';
$service_id = get_field('services_post',$current_id);
$blog_list = new WP_Query([
  'post_type'              => 'specialoffers',
  'posts_per_page'         => 5,
  'post__not_in'           => [$current_id],
  'orderby'                => 'date',
  'order'                  => 'DESC',
  'no_found_rows'          => true,
  'update_post_meta_cache' => false,
  'tax_query'              => [
    [
      'taxonomy' => 'specialoffers_cat',
      'field'    => 'slug', 
      'terms'    => $current_slug,
    ]
  ],
]); 

?>


<section class="blog-content">
  <div class="wrapper blog-content__wrapper">
    <?php 
    if ( function_exists('yoast_breadcrumb') ) {
      yoast_breadcrumb( '<p id="breadcrumbs" class="breadcrumbs">','</p>' );
    } ?>
    <div class="blog-content__inner">
      <?php 
        get_template_part('/template-parts/sections/blog-header',null,['post_id'=> get_the_ID(),'type'=>'specialoffers']); 
        if(!empty(get_the_content())): ?>
        <article class="article-content">
          <?php the_content(); ?>
        </article>
      <?php endif; ?>
    </div>
    <aside class="blog-content__aside scroll-aside">
      <?php  
        if($blog_list->have_posts()):?>
        <div class="aside-content__inner">
          <div class="aside-content__list">
            <h3><?php _e('Більше спецпропозицій','ensuria')?></h3>
            <?php while($blog_list->have_posts()): $blog_list->the_post(); 
                get_template_part('template-parts/cards/card-specialoffers',null,['slide'=> false]);
              endwhile; wp_reset_postdata();
            ?>
          </div>
        </div>
      <?php endif; ?>
    </aside>
  </div>
</section>
<?php
// Service relation 
  get_template_part('template-parts/sections/cta-specialoffers', null, [
    'post_id'    => $service_id, 
  ]);

// Blog
  get_template_part('template-parts/sections/blog', null, [
    'post_type'    => 'specialoffers', 
    'title' => 'Більше спецпропозицій Ensuria Medical',
  ]);
// Call To Action
if(is_array($cta_group) && array_filter($cta_group)){
  get_template_part('template-parts/sections/cta', null, [
    'cta_group'    => $cta_group, 
  ]);
}
// SEO
if(is_array($seo_group) && array_filter($seo_group)):
  get_template_part('template-parts/sections/seo', null, [
    'seo_group'    => $seo_group, 
  ]);
endif;

get_footer();