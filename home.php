<?php
get_header();
$obj = get_post_type_object('post');
$posts_page_id = (int) get_option('page_for_posts');
$seo_group = get_field('seo_group',$posts_page_id);

get_template_part('/template-parts/sections/page-header',null,['title'=> 'Блог']);

if(have_posts()) :
?>
  <section class="blog section">
    <div class="wrapper blog__wrapper"> 
      <div class="blog__list">
        <?php while(have_posts()) : the_post();
          get_template_part('template-parts/cards/card-blog', null,['slide'=> false]);
        endwhile; ?> 
      </div>
      <div class="pagination">
        <?php 
            echo paginate_links( array(
            'base' 			=> get_post_type_archive_link($obj->name) . '%_%',
            'prev_next'     => true,
            'prev_text'    	=> 	'<svg role="presentation" focusable="false">
                                  <use xlink:href="/wp-content/themes/ensuria/assets/img/path-icon.svg#icon-arrow-right"></use>
                                </svg>',
            'next_text'    	=> 	'<svg role="presentation" focusable="false">
                                  <use xlink:href="/wp-content/themes/ensuria/assets/img/path-icon.svg#icon-arrow-right"></use>
                                </svg>',
            'type'          => 'plain',
            'mid_size'		=> 1,
          ) );?>
      </div>
    </div>
  </section>
<?php
endif;
// SEO
if(is_array($seo_group) && array_filter($seo_group)){
  get_template_part('template-parts/sections/seo', null, [
    'seo_group'    => $seo_group, 
  ]);
}

get_footer();