<?php
/**
 * Template Name: Front Page
 */
$hero_group = get_field('hero_group');
$specialoffers_group = get_field('specialoffers_group');
$services_group = get_field('services_group');
$team_group = get_field('team_group');
$partners_group = get_field('partners_group');
$reviews_group = get_field('reviews_group');
$consultation_group = get_field('consultation_group');
$blog_group = get_field('blog_group');
$cta_group = get_field('cta_group','options');
$seo_group = get_field('seo_group');

get_header(); 
// Hero
if(is_array($hero_group) && array_filter($hero_group)){
  get_template_part('template-parts/sections/hero', null, [
    'hero_group'    => $hero_group,
  ]);
}

// Specialoffers
if(is_array($specialoffers_group) && array_filter($specialoffers_group)){
  get_template_part('template-parts/sections/specialoffers', null, [
    'specialoffers_group'    => $specialoffers_group, 
  ]);
}

// Services
if(is_array($services_group) && array_filter($services_group)){
  get_template_part('template-parts/sections/services', null, [
    'services_group'    => $services_group, 
  ]);
}

// Team
if(is_array($team_group) && array_filter($team_group)){
  get_template_part('template-parts/sections/team', null, [
    'team_group'    => $team_group, 
    'place'=>'front_page',
  ]);
}

// Partners
if(is_array($partners_group) && array_filter($partners_group)){
  get_template_part('template-parts/sections/partners', null, [
    'partners_group'    => $partners_group, 
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

// Consultation
if(is_array($consultation_group) && array_filter($consultation_group)){
  get_template_part('template-parts/sections/consultation', null, [
    'consultation_group'    => $consultation_group, 
  ]);
}

// Blog
if(is_array($blog_group) && array_filter($blog_group)){
  get_template_part('template-parts/sections/blog', null, [
    'blog_group'    => $blog_group, 
  ]);
}

// Call To Action
if(is_array($cta_group) && array_filter($cta_group)){
  get_template_part('template-parts/sections/cta', null, [
    'cta_group'    => $cta_group, 
  ]);
}

// SEO
if(is_array($seo_group) && array_filter($seo_group)){
  get_template_part('template-parts/sections/seo', null, [
    'seo_group'    => $seo_group, 
  ]);
}

get_footer();