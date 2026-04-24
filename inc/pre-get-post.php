<?php

function ensuria_pre_get_posts($query) {
	if (!is_admin() && $query->is_main_query()) :
		if ($query->is_post_type_archive('team') ) :
			$query->set('post_status', 'publish');
			$query->set('posts_per_page', 16);
      $query->set('orderby', ['menu_order' => 'ASC', 'date' => 'DESC']);
			$query->is_tax = false;
      $tax_query = [];
      if(isset($_GET) && !empty($_GET)):
        if(isset($_GET['location'])):
          $tax_query[] = [
              [
              'taxonomy' => 'location',
              'field'=> 'slug',
              'terms'=> array_filter(array_map('sanitize_title', explode(',', wp_unslash($_GET['location'])))),
            ]
          ]; 
        endif;
        if(isset($_GET['specialized'])):
          $tax_query[] = [
              [
              'taxonomy' => 'specialized',
              'field'=> 'slug',
              'terms'=> array_filter(array_map('sanitize_title', explode(',', wp_unslash($_GET['specialized'])))),
            ]
          ]; 
        endif;
        if (count($tax_query) > 1) {
          $tax_query['relation'] = 'OR';
        }
        $query->set('tax_query', $tax_query);
      endif;
		endif;
    if ($query->is_post_type_archive('clinic') || $query->is_tax('category-clinick')) :
      $meta_query = [
        'relation' => 'AND',
        [
            'key' => 'info_group',
            'compare' => 'EXISTS',
        ],
        [
            'key' => 'info_group',
            'value' => 'a:0:{}',
            'compare' => '!=',
        ],
      ];

      $query->set('post_type', 'clinic');
      $query->set('post_status', 'publish');
      $query->set('posts_per_page', 10);
      $query->set('meta_query', $meta_query);
      $query->set('orderby', 'menu_order');
      $query->set('order', 'ASC');
      $query->set('no_found_rows', true);
		endif;
    if ($query->is_post_type_archive('services') ) :
			$query->set('post_status', 'publish');
			$query->set('posts_per_page', 100);
      $query->set('order', 'ASC');
      $query->set('orderby', 'menu_order');
			$query->is_tax = false;
		endif;
    if ($query->is_post_type_archive('reviews') ) :
			$query->set('post_status', 'publish');
			$query->set('posts_per_page', 30);
      $query->set('order', 'DESC');
      $query->set('orderby', 'date');
			$query->is_tax = false;
		endif;
	endif;
}
add_action('pre_get_posts', 'ensuria_pre_get_posts');