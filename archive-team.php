<?php
get_header();
$obj = get_post_type_object('team');
$args = [
  'taxonomies' => $obj->taxonomies,
  'multiple' => false,
  'post-type' => $obj->name,
];
$seo_group = get_field('seo_group','team-archive');
$certificate_group = get_field('certificate_group','options');

get_template_part('/template-parts/sections/page-header',null,['title'=> 'Лікарі']);

get_template_part('template-parts/sections/filters', null, $args);
if(have_posts()) :
?> 
  <section class="team">
    <div class="wrapper team__wrapper">
      <div class="team__list">
        <?php while(have_posts()) : the_post();
          get_template_part('template-parts/cards/card-member', null);
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

  // Certificates
  
if(is_array($certificate_group) && array_filter($certificate_group)){

  get_template_part('template-parts/sections/certificate', null, [
    'certificate_group'    => $certificate_group, 
    'remove_padding' => true,
  ]);
}

// SEO
if(is_array($seo_group) && array_filter($seo_group)){
  get_template_part('template-parts/sections/seo', null, [
    'seo_group'    => $seo_group, 
  ]);
}

get_footer();