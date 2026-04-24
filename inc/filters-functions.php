<?php

function filter_check($type , $item_slug){
  
  if(empty($_GET[$type]) && $item_slug == 'all' ){
    return esc_attr('selected');
  } 
	if( isset($_GET[$type]) && !empty($_GET[$type]) ){
      $values = explode(',' , $_GET[$type]);
      if (in_array($item_slug, $values, true)) {
        return esc_attr("selected");
    } 
  }  
}

function choice_check($type){
  
  if(!empty($_GET[$type])){
    return esc_attr('enable');
  } 
  return false;
}

function filter_label($label) {
  $taxonomy = get_taxonomy($label);
  return $taxonomy->label;
}
function filter_label_icon($label, $get = null) {
    $get = is_array($get) ? $get : $_GET;

    $sprite_icon = function($id) {
        $href = esc_url( get_template_directory_uri() . '/assets/img/path-icon.svg#' . $id );
        return '<span class="icon-wrapper ' . esc_attr($id) . '">' .
                 '<svg role="presentation" focusable="false">' .
                   '<use xlink:href="' . $href . '"></use>' .
                 '</svg>' .
               '</span>';
    };

    $fallbacks = [
        'location'     => $sprite_icon('icon-location'),
        'specialized'  => $sprite_icon('icon-specialized'),
    ];
    $fallback = $fallbacks[$label] ?? $sprite_icon('icon-filter');

    if (empty($get[$label])) {
        return $fallback;
    }

    $raw   = is_array($get[$label]) ? reset($get[$label]) : $get[$label];
    $slugs = array_filter(array_map('sanitize_title', explode(',', (string) $raw)));
    if (empty($slugs)) {
        return $fallback;
    }
    $target_slug = $slugs[0];

    if ($label === 'specialized') {
        $terms = get_terms(['taxonomy' => $label, 'hide_empty' => true]);
        if (!is_wp_error($terms) && $terms) {
            foreach ($terms as $term) {
                if ($term->slug !== $target_slug) continue;

                $acf_icon = get_field('icon', "{$label}_{$term->term_id}");
                $image_id = null;

                if (is_array($acf_icon)) {
                    $image_id = $acf_icon['ID'] ?? ($acf_icon['value']['ID'] ?? null);
                } elseif (is_numeric($acf_icon)) {
                    $image_id = (int) $acf_icon;
                }

                if (!empty($image_id)) {
                    return '<span class="icon-wrapper">' .
                               render_optimized_image($image_id, 'thumbnail') .
                           '</span>';
                }

                break; 
            }
        }
        return $fallback;
    }
    return $fallback;
}

function filter_label_button($label) {
  $taxonomy = get_taxonomy($label);
  if (isset($_GET[$label])) {
    $terms = get_terms(['taxonomy' => $label, 'hide_empty' => true]);
    foreach ($terms as $term) {
        if ($_GET[$label] == $term->slug) {
            return $term->name;
        }
    }
  }
  return $taxonomy->label;
}

function single_or_multiples($multiple){
	echo $multiple !== true ?	'single' : 'multiple';
}
