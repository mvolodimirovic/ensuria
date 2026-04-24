<?php 
/**
 * Template Name: Про нас
 */ 

get_header();


$seo_group = get_field('seo_group');
$cta_group = get_field('cta_group','options');
$info_group = get_field('info_group');
$subtitle = $info_group['subtitle'] ?? '';
$number_phone = $info_group['number_phone'] ??'';
$certificate_group = get_field('certificate_group','options');

$post_id = get_the_ID();
?>
<section class="page-header">
  <div class="wrapper">
    <?php
      if ( function_exists('yoast_breadcrumb') ) {
        yoast_breadcrumb( '<p id="breadcrumbs" class="breadcrumbs">','</p>' );
      }
    ?>
    <h1 class="page-header-title"><?php echo esc_html(get_the_title())?></h1>
    <?php if(!empty($subtitle)):?>
      <p class="single-clinic-subtitle"><?php echo esc_html($subtitle) ?></p>
    <?php endif; ?>
    <div class="page-header__info">
      <?php if(!empty($number_phone)):?>
        <div class="page-header__appointment">
          <?php get_template_part('/template-parts/components/contact',null,['title_block'=> __('Запис у клініку','ensuria'),'email_enable' => false]); ?>
        </div>
        <?php endif;
        if(have_rows('info_group_worker_hours')): ?>
          <div class="page-header__appointment">
            <div class="page-header__appointment-title">
              <?php esc_html_e('Графік роботи','ensuria'); ?>
            </div>
            <ul class="page-header__appointment-phone hours-list">
              <?php while (have_rows('info_group_worker_hours')): the_row();
                $day_and_hours = get_sub_field('text'); 
                if(!empty($day_and_hours)): ?>
                  <li><?php echo esc_html ($day_and_hours)?></li>
                <?php endif; 
              endwhile; ?>
            </ul>
          </div>
        <?php endif; ?>
    </div>
    <div class="page-header__buttons">
      <?php get_template_part('template-parts/sections/buttons-team','',['post_id'=>$post_id,'wrapper_class'=>'buttons-wrapper']); ?>
    </div>
  </div>
</section>

<?php
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
// CTA
if(is_array($cta_group) && array_filter($cta_group)){
  get_template_part('template-parts/sections/cta', null, [
    'cta_group'    => $cta_group, 
  ]);
}
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

// end single tempalte for one clinic

// ==== This template about if clinic will have more items. 

// $seo_group = get_field('seo_group');
// $spare_title = get_field('spare_title');
// $short_description = get_field('short_description');
// $title = !empty($spare_title) ? $spare_title : get_the_title();

// $image_id = has_post_thumbnail() ? get_post_thumbnail_id() : null;

// // Hero Block
// get_template_part('template-parts/sections/services-hero', null, [
//     'short_description'    => $short_description, 
//     'title' => $title,
//     'image_id' => $image_id
//   ]);

// // Gutenberg Content
// if(!empty(get_the_content())): >
//   <article class="article-content">
//     <div class="wrapper article-content__wrapper">
//       <div class="privacy-content">
//         <?php the_content() >
//       </div>
//     </div>
//   </article>
// <?php 
// endif;

// // SEO
// if(is_array($seo_group) && array_filter($seo_group)){
//   get_template_part('template-parts/sections/seo', null, [
//     'seo_group'    => $seo_group, 
//   ]);
// }

//  ==== End template

get_footer();