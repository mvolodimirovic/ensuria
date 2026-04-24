<?php
get_header();
$seo_group = get_field('seo_group','services-archive');

$obj = get_queried_object();

get_template_part('/template-parts/sections/page-header',null,['title'=> $obj->label]);

// Services category
if(have_posts()){
  get_template_part('template-parts/sections/services', null, [
    'services_group'    => [], 
  ]);
}

// SEO 
if(is_array($seo_group) && array_filter($seo_group)){
  get_template_part('template-parts/sections/seo', null, [
    'seo_group'    => $seo_group, 
  ]);
}

get_footer();