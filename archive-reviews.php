<?php
get_header();
$obj = get_post_type_object('reviews');
global $wp_query;
$total_pages = $wp_query->max_num_pages;
$seo_group = get_field('seo_group','reviews-archive');

get_template_part('/template-parts/sections/page-header',null,['title'=> $obj->label,'count_posts'=>$wp_query->found_posts]); 

if(have_posts()) :
?> 
  <section class="reviews section">
    <div class="wrapper reviews__wrapper">
      <div class="reviews__list">
        <?php while(have_posts()) : the_post();
          get_template_part('template-parts/cards/card-review', null,['slide'=> false]);
        endwhile; ?>
      </div>
      <?php if($total_pages > 1) : ?>
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
      <?php endif; ?>
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