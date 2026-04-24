<?php
get_header();
$obj = get_post_type_object('clinic');
$terms = get_terms('category-clinick', array(
  'hide_empty' => true,
));

$seo_group = get_field('seo_group','clinic-archive');
$certificate_group = get_field('certificate_group','options');

get_template_part('/template-parts/sections/page-header',null,['title'=> $obj->label]); 

if(have_posts()) :
?> 
  <section class="map section">
    <div class="wrapper map__wrapper">
      <?php if(!is_wp_error( $terms ) &&!empty($terms)) : ?>
        <div class="map__term">
          <a href="<?php echo esc_url(get_post_type_archive_link('clinic')); ?>" <?php echo ( is_post_type_archive ('clinic') ? ' aria-current="page" ' : '' ); ?> class="map__term-link <?php echo (is_post_type_archive('clinic') ? 'active' : ''); ?>"><?php esc_html_e('Всі клініки','ensuria'); ?></a>
          <?php foreach ($terms as $term) : ?>
            <a href="<?php echo esc_url(get_term_link($term)); ?>" <?php echo ( is_tax ( ' category-clinick ' , $term -> slug ) ? ' aria-current="page" ' : '' ); ?> class="map__term-link <?php echo (is_tax('category-clinick', $term->slug) ? 'active' : ''); ?>"><?php echo esc_html($term->name); ?></a>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
      <div class="map__list">
        <?php while(have_posts()) : the_post();
          get_template_part('template-parts/cards/card-clinic-map', null);
        endwhile; ?>
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