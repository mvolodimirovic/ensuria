<?php

/**
 * Custom functions which enhance the theme by hooking into WordPress
 */

function is_test_environment() {
	$environment_type = wp_get_environment_type();

	if ( $environment_type === 'production' ) {
		$site_url = get_site_url();

		if (
			strpos( $site_url, 'simple-dev.site' ) !== false) {
			return true;
		}
		return false; 
	}
	return true;
}
function lang_switcher_header(){ 
    $languages = apply_filters('wpml_active_languages', NULL, array('skip_missing' => 0));
    if ( isset($languages) && !empty($languages)) {
        echo '<div class="header__lang">';
        foreach ($languages as $l) {
            if (!$l['active']){ ?>
              <a class="header__lang-item" href="<?php echo str_replace('%5C', '', esc_url($l['url'])) ?>"><?php echo convert_lang_code($l['language_code']) ?></a>
            <?php }
        }
        echo '</div>'; 
    }?>
<?php }

function convert_lang_code($lang_code)
{
    $replacements = array(
        "en" => "EN",
        "uk" => "UA",
    );
    return strtr($lang_code, $replacements);
}

function get_icon($icon_id,$role='none',$aria_label='') { ?>
  <span class="icon-wrapper <?php echo esc_attr($icon_id)?>">
    <svg role="<?php echo esc_attr($role)?>" focusable="false">
      <use xlink:href="<?php echo get_template_directory_uri(); ?>/assets/img/path-icon.svg#<?php echo esc_attr($icon_id); ?>"></use>
    </svg>
  </span>
<?php }

function has_non_empty_menu($location) {
  if (empty($location)) {
    return false;
  }

  $locations = get_nav_menu_locations();

  if (empty($locations[$location])) {
    return false;
  }

  $menu = wp_get_nav_menu_object($locations[$location]);

  if (!$menu) {
    return false;
  }

  $menu_items = wp_get_nav_menu_items($menu->term_id);

  return !empty($menu_items);
}

function get_social_network_name($url) {
  $host = parse_url($url, PHP_URL_HOST); 

  $host = preg_replace('/^www\./', '', $host);
  $parts = explode('.', $host);
  return $parts[0]; 
}

function render_optimized_image($image_id, $size = 'full', $class = '', $is_critical = false, $sizes = '100vw', $alt = null) {
    $attachment_id = 0;
    $mime_type = '';
    $fetchpriority = '';
    $loading = '';
    $image_alt = '';
    $admin_alt = '';
    $context_post_id = 0;
    $context_title = '';
    $attachment_title = '';
    $svg_url = '';
    $effective_size = '';
    $image_src = [];
    $img_w = 0;
    $img_h = 0;
    $meta = [];
    $computed_sizes = '';
    $sizes_str = '';
    $is_default_sizes = false;
    $limit_to_rendered = false;
    $raw_srcset = '';
    $image_srcset = '';
    $parts = [];
    $kept = [];

    if (empty($image_id)) {
        return '';
    }

    if (is_array($image_id)) {
        if (!empty($image_id['ID'])) {
            $attachment_id = (int) $image_id['ID'];
        } elseif (!empty($image_id['id'])) {
            $attachment_id = (int) $image_id['id'];
        } else {
            return '';
        }
    } else {
        if (is_numeric($image_id)) {
            $attachment_id = (int) $image_id;
        } else {
            $attachment_id = (int) attachment_url_to_postid((string) $image_id);
        }
    }

    if ($attachment_id <= 0) {
        return '';
    }

    $mime_type = (string) get_post_mime_type($attachment_id);
    $fetchpriority = $is_critical ? 'high' : 'auto';
    $loading = $is_critical ? 'eager' : 'lazy';

    if ($alt !== null) {
        $image_alt = (string) $alt;
    } else {
        $admin_alt = (string) get_post_meta($attachment_id, '_wp_attachment_image_alt', true);

        if ($admin_alt !== '') {
            $image_alt = $admin_alt;
        } else {
            if (!empty($GLOBALS['post']) && $GLOBALS['post'] instanceof WP_Post) {
                $context_post_id = (int) $GLOBALS['post']->ID;
            }

            if ($context_post_id > 0 && get_post_type($context_post_id) !== 'attachment') {
                $context_title = (string) get_the_title($context_post_id);
                $image_alt = $context_title !== '' ? $context_title : '';
            } else {
                $attachment_title = (string) get_the_title($attachment_id);
                $image_alt = $attachment_title !== '' ? $attachment_title : '';
            }
        }
    }

    if ($mime_type === 'image/svg+xml') {
        $svg_url = (string) wp_get_attachment_url($attachment_id);
        if (empty($svg_url)) {
            return '';
        }

        ob_start(); ?>
        <img
            src="<?php echo esc_url($svg_url); ?>"
            loading="<?php echo esc_attr($loading); ?>"
            fetchpriority="<?php echo esc_attr($fetchpriority); ?>"
            alt="<?php echo esc_attr($image_alt); ?>"
            class="<?php echo esc_attr($class); ?>"
        >
        <?php
        return ob_get_clean();
    }

    $effective_size = (string) $size;
    $image_src = wp_get_attachment_image_src($attachment_id, $effective_size);

    if (empty($image_src) || empty($image_src[0])) {
        if ($effective_size !== 'full') {
            $effective_size = 'full';
            $image_src = wp_get_attachment_image_src($attachment_id, $effective_size);
        }
    }

    if (empty($image_src) || empty($image_src[0])) {
        return '';
    }

    $img_w = !empty($image_src[1]) ? (int) $image_src[1] : 0;
    $img_h = !empty($image_src[2]) ? (int) $image_src[2] : 0;

    if ($img_w <= 0 || $img_h <= 0) {
        $meta = (array) wp_get_attachment_metadata($attachment_id);

        if ($img_w <= 0 && !empty($meta['width'])) {
            $img_w = (int) $meta['width'];
        }
        if ($img_h <= 0 && !empty($meta['height'])) {
            $img_h = (int) $meta['height'];
        }
    }

    $sizes_str = is_string($sizes) ? trim($sizes) : '';
    $is_default_sizes = ($sizes_str === '' || $sizes_str === '100vw');

    $computed_sizes = $sizes_str;
    $limit_to_rendered = false;

    if ($is_default_sizes && $img_w > 0) {
        $computed_sizes = $img_w . 'px';
        $limit_to_rendered = true;
    }

    if (empty($computed_sizes)) {
        $computed_sizes = '100vw';
    }

    $raw_srcset = (string) wp_get_attachment_image_srcset($attachment_id, $effective_size);

    if (!empty($raw_srcset)) {
        if ($limit_to_rendered && $img_w > 0) {
            $parts = array_filter(array_map('trim', explode(',', $raw_srcset)));
            $kept = [];

            foreach ($parts as $part) {
                if (preg_match('/\s(\d+)w$/', $part, $m)) {
                    if ((int) $m[1] <= $img_w) {
                        $kept[] = $part;
                    }
                }
            }

            $image_srcset = implode(', ', $kept);
        } else {
            $image_srcset = $raw_srcset;
        }
    }

    ob_start(); ?>
    <img
        src="<?php echo esc_url($image_src[0]); ?>"
        <?php if ($img_w > 0) : ?>
            width="<?php echo esc_attr($img_w); ?>"
        <?php endif; ?>
        <?php if ($img_h > 0) : ?>
            height="<?php echo esc_attr($img_h); ?>"
        <?php endif; ?>
        <?php if (!empty($image_srcset)) : ?>
            srcset="<?php echo esc_attr($image_srcset); ?>"
            sizes="<?php echo esc_attr($computed_sizes); ?>"
        <?php endif; ?>
        loading="<?php echo esc_attr($loading); ?>"
        fetchpriority="<?php echo esc_attr($fetchpriority); ?>"
        alt="<?php echo esc_attr($image_alt); ?>"
        class="<?php echo esc_attr($class); ?>"
    >
    <?php
    return ob_get_clean();
}


if (!function_exists('ensuria_current_url')) {
    function ensuria_current_url($with_query = true, $scheme = null) {
        if ($scheme === null) $scheme = is_ssl() ? 'https' : 'http';
        if (wp_doing_ajax()) {
            $ref = wp_get_referer();
            if (!empty($ref)) return $with_query ? $ref : strtok($ref, '?');
        }
        $uri = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '';
        if ($uri !== '') {
            $abs = home_url($uri, $scheme);
            if ($with_query) return $abs;
            $p = wp_parse_url($abs);
            $host = $p['scheme'] . '://' . $p['host'] . (isset($p['port']) ? ':' . $p['port'] : '');
            $path = isset($p['path']) ? $p['path'] : '';
            return $host . $path;
        }
        global $wp;
        $req = !empty($wp->request) ? $wp->request : '';
        $base = home_url(user_trailingslashit($req), $scheme);
        if ($with_query && !empty($_GET)) {
            $base = add_query_arg(array_map('wp_unslash', $_GET), $base);
        }
        return $base;
    }
}

add_filter('wpseo_breadcrumb_links', 'ensuria_force_blog_trail_for_posts');
function ensuria_force_blog_trail_for_posts($links){

  if ( !is_singular('post') || empty($links) ) {
    return $links;
  }

  $home_link = !empty($links[0]) ? $links[0] : null;
  $last_link = end($links);

  if ( empty($home_link) || empty($last_link) ) {
    return $links;
  }
  $posts_page_id = 0;
  $show_on_front = get_option('show_on_front');

  if ( $show_on_front === 'page' ) {
    $page_for_posts = (int) get_option('page_for_posts');
    if ( !empty($page_for_posts) ) {
      $posts_page_id = $page_for_posts;
    }
  }

  if ( empty($posts_page_id) ) {
    $maybe = get_page_by_path('blog');
    if ( !empty($maybe) ) {
      $posts_page_id = (int) $maybe->ID;
    }
  }

  if ( !empty($posts_page_id) && function_exists('pll_get_post') ) {
    $tr = pll_get_post($posts_page_id);
    if ( !empty($tr) ) $posts_page_id = (int) $tr;
  } elseif ( !empty($posts_page_id) && function_exists('wpml_object_id_filter') ) {
    $tr = apply_filters('wpml_object_id', $posts_page_id, 'page', true);
    if ( !empty($tr) ) $posts_page_id = (int) $tr;
  }

  if ( empty($posts_page_id) ) {
    return $links;
  }

  $blog_url   = get_permalink($posts_page_id);
  $blog_title = get_the_title($posts_page_id);

  $new_links   = [];
  $new_links[] = $home_link;
  $new_links[] = [
    'url'  => esc_url($blog_url),
    'text' => esc_html($blog_title),
  ];
  $new_links[] = $last_link;

  return $new_links;
}

add_filter('wpseo_breadcrumb_separator', function ($sep) {
  $svg = '<svg width="4" height="6" viewBox="0 0 4 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L3 3L1 5" stroke="black"/>
          </svg>';

  return '<span class="breadcrumbs__sep" aria-hidden="true">'.$svg.'</span>';
}, 10, 1);


add_action('init', function () {
  add_rewrite_endpoint('page', EP_PERMALINK);
});

add_action('template_redirect', function () {
  if ( is_singular('services') ) {
    remove_action('template_redirect', 'redirect_canonical');
  }
}, 0);

function ensuria_render_single_pagination($root, $current, $total, $acat = '', $q = '') {
  $is_pretty  = (bool) get_option('permalink_structure');
  $clean_root = remove_query_arg(['paged','page','q','acat'], $root);
  $clean_root = trailingslashit($clean_root);

  $args = [];
  if ($q !== '')      { $args['q'] = $q; }
  elseif ($acat !== '') { $args['acat'] = $acat; }

  $first_url = !empty($args) ? add_query_arg($args, $clean_root) : $clean_root;

  if ($is_pretty) {
    $base   = user_trailingslashit($clean_root . 'page/%#%/');
    $format = '';
    $add    = $args ?: false;
  } else {
    $base   = esc_url_raw(add_query_arg('paged', '%#%', $clean_root));
    $format = '';
    $add    = $args ?: false;
  }

  $links = paginate_links([
    'base'      => $base,
    'format'    => $format,
    'current'   => max(1, (int) $current),
    'total'     => max(1, (int) $total),
    'type'      => 'array',
    'mid_size'  => 1,
    'end_size'  => 1,
    'prev_next' => true,
    'prev_text' => '<svg role="presentation" focusable="false"><use href="/wp-content/themes/ensuria/assets/img/path-icon.svg#icon-arrow-right"></use></svg>',
    'next_text' => '<svg role="presentation" focusable="false"><use href="/wp-content/themes/ensuria/assets/img/path-icon.svg#icon-arrow-right"></use></svg>',
    'add_args'  => $add,
  ]);

  if (empty($links)) return '';
  if (is_string($links)) $links = [$links];

  foreach ($links as &$h) {
    if (preg_match('~>1<~', $h)) {
      $h = preg_replace('~(<a\b[^>]*\shref=")[^"]+(")~', '$1' . esc_url($first_url) . '$2', $h, 1);
    }
  } unset($h);

  if ((int) $current === 2) {
    foreach ($links as &$h) {
      if (preg_match('~class="[^"]*\bprev\b~', $h)) {
        $h = preg_replace('~(<a\b[^>]*\shref=")[^"]+(")~', '$1' . esc_url($first_url) . '$2', $h, 1);
      }
    } unset($h);
  }

  return '<nav class="pagination" aria-label="Пагінація">' . implode('', $links) . '</nav>';
}

if ( ! function_exists( 'ensuria_get_iframe_maps_link' ) ) {
    function ensuria_get_iframe_maps_link( $html_or_url ) {
        $value = '';
        $src = '';
        $address = '';
        $aria = '';
        $title = '';
        $coords = array();
        $base = 'https://www.google.com/maps/search/';
        $link = '';

        if ( empty( $html_or_url ) || ! is_string( $html_or_url ) ) {
            return '';
        }

        $value = $html_or_url;
        $src = ensuria_extract_iframe_src( $value );
        if ( empty( $src ) ) {
            $src = $value;
        }

        $address = ensuria_parse_gmaps_address_from_url( $src );
        if ( empty( $address ) ) {
            $address = ensuria_parse_address_from_pb( $src );
        }
        if ( empty( $address ) ) {
            $title = ensuria_extract_iframe_title( $value );
            if ( ! empty( $title ) ) {
                $address = $title;
            }
        }
        if ( empty( $address ) ) {
            $aria = ensuria_extract_iframe_aria_label( $value );
            if ( ! empty( $aria ) ) {
                $address = $aria;
            }
        }

        if ( ! empty( $address ) ) {
            $link = add_query_arg( array( 'api' => '1', 'query' => rawurlencode( $address ) ), $base );
            return $link;
        }

        $coords = ensuria_parse_latlng_from_url( $src );
        if ( ! empty( $coords['lat'] ) && ! empty( $coords['lng'] ) ) {
            $link = add_query_arg( array( 'api' => '1', 'query' => rawurlencode( $coords['lat'] . ',' . $coords['lng'] ) ), $base );
            return $link;
        }

        return $src;
    }
}

if ( ! function_exists( 'ensuria_extract_iframe_src' ) ) {
    function ensuria_extract_iframe_src( $html ) {
        $html_safe = '';
        $matches = array();
        $src = '';

        if ( empty( $html ) || ! is_string( $html ) ) {
            return '';
        }

        $html_safe = $html;

        if ( preg_match( '/<iframe[^>]*\s(?:src|data-src)=[\'"]([^\'"]+)[\'"][^>]*>/i', $html_safe, $matches ) ) {
            if ( ! empty( $matches[1] ) ) {
                $src = $matches[1];
            }
        }

        return is_string( $src ) ? trim( $src ) : '';
    }
}

if ( ! function_exists( 'ensuria_extract_iframe_title' ) ) {
    function ensuria_extract_iframe_title( $html ) {
        $html_safe = '';
        $matches = array();
        $title = '';

        if ( empty( $html ) || ! is_string( $html ) ) {
            return '';
        }

        $html_safe = $html;

        if ( preg_match( '/<iframe[^>]*\stitle=[\'"]([^\'"]+)[\'"][^>]*>/i', $html_safe, $matches ) ) {
            if ( ! empty( $matches[1] ) ) {
                $title = $matches[1];
            }
        }

        return is_string( $title ) ? sanitize_text_field( trim( $title ) ) : '';
    }
}

if ( ! function_exists( 'ensuria_extract_iframe_aria_label' ) ) {
    function ensuria_extract_iframe_aria_label( $html ) {
        $html_safe = '';
        $matches = array();
        $label = '';

        if ( empty( $html ) || ! is_string( $html ) ) {
            return '';
        }

        $html_safe = $html;

        if ( preg_match( '/<iframe[^>]*\saria-label=[\'"]([^\'"]+)[\'"][^>]*>/i', $html_safe, $matches ) ) {
            if ( ! empty( $matches[1] ) ) {
                $label = $matches[1];
            }
        }

        return is_string( $label ) ? sanitize_text_field( trim( $label ) ) : '';
    }
}

if ( ! function_exists( 'ensuria_parse_gmaps_address_from_url' ) ) {
    function ensuria_parse_gmaps_address_from_url( $url ) {
        $url_safe = '';
        $parsed = array();
        $query = '';
        $q_params = array();
        $address = '';
        $path = '';
        $after_place = '';
        $cut_pos = false;
        $path_address = '';

        if ( empty( $url ) || ! is_string( $url ) ) {
            return '';
        }

        $url_safe = $url;
        $parsed = wp_parse_url( $url_safe );

        if ( ! empty( $parsed['query'] ) ) {
            $query = $parsed['query'];
            parse_str( $query, $q_params );
            if ( ! empty( $q_params['q'] ) && is_string( $q_params['q'] ) ) {
                $address = urldecode( str_replace( '+', ' ', $q_params['q'] ) );
            }
        }

        if ( empty( $address ) && ! empty( $parsed['path'] ) ) {
            $path = $parsed['path'];
            if ( strpos( $path, '/place/' ) !== false ) {
                $after_place = substr( $path, strpos( $path, '/place/' ) + 7 );
                $cut_pos = false;

                if ( $cut_pos === false && strpos( $after_place, '/@' ) !== false ) {
                    $cut_pos = strpos( $after_place, '/@' );
                }
                if ( $cut_pos === false && strpos( $after_place, '/data=' ) !== false ) {
                    $cut_pos = strpos( $after_place, '/data=' );
                }
                if ( $cut_pos === false && strpos( $after_place, '?' ) !== false ) {
                    $cut_pos = strpos( $after_place, '?' );
                }

                if ( $cut_pos !== false ) {
                    $path_address = substr( $after_place, 0, $cut_pos );
                } else {
                    $path_address = $after_place;
                }

                $path_address = urldecode( $path_address );
                $path_address = str_replace( array( '+', '%2C' ), array( ' ', ', ' ), $path_address );
                $path_address = trim( preg_replace( '/\s+/', ' ', $path_address ) );

                if ( ! empty( $path_address ) ) {
                    $address = $path_address;
                }
            }
        }

        return is_string( $address ) ? sanitize_text_field( $address ) : '';
    }
}

if ( ! function_exists( 'ensuria_parse_address_from_pb' ) ) {
    function ensuria_parse_address_from_pb( $url ) {
        $url_safe = '';
        $m = array();
        $pb = '';
        $tokens = array();
        $values = array();
        $candidates = array();
        $decoded = '';
        $parts = array();
        $p = '';
        $best = '';

        if ( empty( $url ) || ! is_string( $url ) ) {
            return '';
        }

        $url_safe = $url;
        if ( preg_match( '/[?&]pb=([^&#]+)/', $url_safe, $m ) ) {
            $pb = urldecode( $m[1] );
        } else {
            $pb = $url_safe;
        }

        if ( preg_match_all( '/!\d+s([^!]+)/', $pb, $tokens ) ) {
            $values = $tokens[1];
        } else {
            $values = array();
        }

        foreach ( $values as $v ) {
            $decoded = urldecode( $v );
            $decoded = str_replace( array( '+', '%2C' ), array( ' ', ', ' ), $decoded );
            $decoded = trim( preg_replace( '/\s+/', ' ', $decoded ) );
            if ( empty( $decoded ) ) continue;
            if ( preg_match( '/^0x[0-9a-f]+:0x[0-9a-f]+$/i', $decoded ) ) continue;
            if ( preg_match( '/^[a-z]{2,3}(-[A-Z]{2})?$/', $decoded ) ) continue;
            if ( mb_strlen( $decoded ) < 6 ) continue;

            $parts = preg_split( '/\s*[·•]\s*/u', $decoded );
            foreach ( $parts as $p ) {
                $p = trim( $p );
                if ( empty( $p ) ) continue;
                if ( ! in_array( $p, $candidates, true ) ) $candidates[] = $p;
            }
        }

        if ( empty( $candidates ) ) {
            return '';
        }

        usort( $candidates, function( $a, $b ) {
            $sa = ensuria_addr_score( $a );
            $sb = ensuria_addr_score( $b );
            if ( $sa === $sb ) return mb_strlen( $b ) - mb_strlen( $a );
            return $sb - $sa;
        } );

        $best = $candidates[0];

        return sanitize_text_field( $best );
    }
}

if ( ! function_exists( 'ensuria_addr_score' ) ) {
    function ensuria_addr_score( $s ) {
        $s_norm = '';
        $score = 0;
        $len = 0;

        if ( empty( $s ) || ! is_string( $s ) ) {
            return 0;
        }

        $s_norm = mb_strtolower( $s );
        $len = mb_strlen( $s_norm );

        if ( preg_match( '/\d/', $s_norm ) ) $score += 2;
        if ( preg_match( '/\b(вул|вулиця|ул\.?|улица|просп|проспект|бульвар|бул\.?|площа|пл\.|пров|провулок|шосе|набережн|street|st\.|road|rd\.|avenue|ave\.|blvd|lane|ln\.)\b/u', $s_norm ) ) $score += 4;
        if ( preg_match( '/(область|район|україна|ukraine|київ|kyiv|львів|lviv|харків|kharkiv)/u', $s_norm ) ) $score += 1;
        if ( $len >= 12 && $len <= 120 ) $score += 1;

        return $score;
    }
}

if ( ! function_exists( 'ensuria_parse_latlng_from_url' ) ) {
    function ensuria_parse_latlng_from_url( $url ) {
        $url_safe = '';
        $lat = '';
        $lng = '';
        $matches = array();

        if ( empty( $url ) || ! is_string( $url ) ) {
            return array( 'lat' => '', 'lng' => '' );
        }

        $url_safe = $url;

        if ( preg_match( '/@(-?\d+\.\d+),(-?\d+\.\d+)/', $url_safe, $matches ) ) {
            if ( ! empty( $matches[1] ) && ! empty( $matches[2] ) ) {
                return array( 'lat' => $matches[1], 'lng' => $matches[2] );
            }
        }

        if ( preg_match( '/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/', $url_safe, $matches ) ) {
            if ( ! empty( $matches[1] ) && ! empty( $matches[2] ) ) {
                return array( 'lat' => $matches[1], 'lng' => $matches[2] );
            }
        }

        if ( preg_match( '/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/', $url_safe, $matches ) ) {
            if ( ! empty( $matches[1] ) && ! empty( $matches[2] ) ) {
                return array( 'lat' => $matches[2], 'lng' => $matches[1] );
            }
        }

        return array( 'lat' => '', 'lng' => '' );
    }
}

function get_title_initials($title = ''): string {
    $title = trim( wp_strip_all_tags( $title) );
    if ($title === '') return '';

    preg_match_all('/[\p{L}\p{N}]+/u', $title, $m);
    $tokens = $m[0] ?? [];

    if (count($tokens) <= 1) {
        $w = $tokens[0] ?? $title;
        if ($w === '') return '';
        if (function_exists('mb_substr') && function_exists('mb_strtoupper')) {
            return mb_strtoupper(mb_substr($w, 0, 2, 'UTF-8'), 'UTF-8');
        }
        return strtoupper(substr($w, 0, 2));
    }

    $letters = [];
    foreach ($tokens as $w) {
        if ($w === '') continue;
        if (function_exists('mb_substr')) {
            $letters[] = mb_substr($w, 0, 1, 'UTF-8');
        } else {
            $letters[] = substr($w, 0, 1);
        }
    }

    $out = implode('', $letters);
    if (function_exists('mb_strtoupper')) {
        return mb_strtoupper($out, 'UTF-8');
    }
    return strtoupper($out);
}

function srgb_to_linear(float $c): float {
    $c /= 255;
    return ($c <= 0.03928) ? ($c / 12.92) : pow(($c + 0.055) / 1.055, 2.4);
}
function rel_luminance_rgb(int $r, int $g, int $b): float {
    $R = srgb_to_linear($r); $G = srgb_to_linear($g); $B = srgb_to_linear($b);
    return 0.2126 * $R + 0.7152 * $G + 0.0722 * $B;
}
function contrast_ratio_rgb(array $a, array $b): float {
    $la = rel_luminance_rgb($a[0], $a[1], $a[2]);
    $lb = rel_luminance_rgb($b[0], $b[1], $b[2]);
    $L1 = max($la, $lb); $L2 = min($la, $lb);
    return ($L1 + 0.05) / ($L2 + 0.05);
}
function mix_with_white(array $rgb, float $alpha): array {
    $a = max(0.0, min(1.0, $alpha));
    return [
        (int) round($rgb[0] * (1 - $a) + 255 * $a),
        (int) round($rgb[1] * (1 - $a) + 255 * $a),
        (int) round($rgb[2] * (1 - $a) + 255 * $a),
    ];
}

function author_bg_color_light(string $author_name, float $minContrast = 4.5): string {
    $norm = function_exists('mb_strtolower') ? mb_strtolower($author_name, 'UTF-8') : strtolower($author_name);
    $hash = md5($norm);
    $r = hexdec(substr($hash, 0, 2));
    $g = hexdec(substr($hash, 2, 2));
    $b = hexdec(substr($hash, 4, 2));

    $bg = [$r, $g, $b];
    $text = [17, 17, 17];

    $alpha = 0.35;
    $bg = mix_with_white($bg, $alpha);

    $targetContrast = max($minContrast, 7.0);
    $minLuminance = 0.80;

    $ratio = contrast_ratio_rgb($bg, $text);
    $lum   = rel_luminance_rgb($bg[0], $bg[1], $bg[2]);

    $guard = 200;
    while (($ratio < $targetContrast || $lum < $minLuminance) && $alpha < 0.98 && $guard-- > 0) {
        $alpha += 0.03;
        $bg = mix_with_white($bg, $alpha);
        $ratio = contrast_ratio_rgb($bg, $text);
        $lum   = rel_luminance_rgb($bg[0], $bg[1], $bg[2]);
    }

    return sprintf('rgb(%d, %d, %d)', $bg[0], $bg[1], $bg[2]);
}
function mode_value(array $values) {
    if (empty($values)) return null;
    $counts = array_count_values($values);
    arsort($counts, SORT_NUMERIC);
    foreach ($counts as $val => $cnt) {
        return $val;
    }
    return null;
}
function get_title_by_place($place,$team_ids = null) {
  if($place == 'front_page'):
    return [
      'title' => __('Всі лікарі', 'ensuria'),
      'link' => get_post_type_archive_link('team'),
    ];
  endif;
  if($place == 'block_team' && !empty($team_ids) && is_array($team_ids)):
    $cat_slug = [];
    foreach($team_ids as $id):
        $cat_item = get_the_terms($id,'specialized');
        if(empty($cat_item) || is_wp_error($cat_item)) continue;
        foreach($cat_item as $cat):
          if (!empty($cat->slug)) :
            $cat_slug[] = $cat->slug;
          endif;
      endforeach;
    endforeach;
    
    $slug = mode_value($cat_slug);
    return [
      'title' => sprintf(__('Усі лікарі "%s"', 'ensuria'), get_the_title()),
      'link' => get_post_type_archive_link('team'),
    ];
  endif;
    if($place == 'single_team' && !empty($team_ids) && is_array($team_ids)):
    $cat_slug = [];
    foreach($team_ids as $id):
        $cat_item = get_the_terms($id,'specialized');
        if(empty($cat_item) || is_wp_error($cat_item)) continue;
        foreach($cat_item as $cat):
          if (!empty($cat->slug)) :
            $cat_slug[] = $cat->slug;
          endif;
      endforeach;
    endforeach;
    
    $slug = mode_value($cat_slug);
    $titles = [
      'gastroenterolog' => 'гастроентерологи',
      'ginekolog' => 'гінекологи',
      'dermatolog-dermatovenerolog' => 'дерматовенерологи',
      'kardiolog' => 'кардіологи',
      'laborant' => 'лаборанти',
      'nevrolog' => 'неврологи',
      'likar-vizualnoyi-diagnostyky-uzd' => 'лікарі візуальної діагностики (УЗД)',
      'simejnyj-likar' => 'сімейні лікарі',
      'masazhyst' => 'масажисти',
      'ortoped-travmatolog' => 'ортопеди-травматологи',
      'otolaryngolog-lor' => 'отоларингологи (ЛОР)',
      'pediatr' => 'педіатри',
      'psyhiatr' => 'психіатри',
      'revmatolog' => 'ревматологи',
      'terapevt' => 'терапевти',
    ];

    return [
      'title' => __('Всі ', 'ensuria') . ($titles[$slug] ?? __('лікарі','ensuria')),
      'link' => get_post_type_archive_link('team'),
    ];
  endif;
}

function text_label($count, string $type): string {
    $n = (int) round((float) $count);
    $formsMap = [
        'review' => ['відгук', 'відгуки', 'відгуків'],
        'year'   => ['рік досвіду', 'роки досвіду', 'років досвіду'],
    ];
    $forms = $formsMap[$type] ?? null;
    if (!$forms) return (string) $n;

    $abs = abs($n);
    $mod10 = $abs % 10;
    $mod100 = $abs % 100;
    $form = ($mod10 === 1 && $mod100 !== 11)
        ? $forms[0]
        : (($mod10 >= 2 && $mod10 <= 4 && ($mod100 < 12 || $mod100 > 14))
            ? $forms[1]
            : $forms[2]);

    return $form;
}


function search_video($raw) {
  $v = $raw;

  if (is_array($v)) {
    if (!empty($v['url'])) $v = $v['url'];
    elseif (!empty($v['ID'])) $v = (string) (int) $v['ID'];
  }

  if (empty($v)) return false;

  if (is_numeric($v)) {
    $att = get_post((int) $v);
    if (empty($att) || $att->post_type !== 'attachment') return false;

    $mime = get_post_mime_type($att);
    if (is_string($mime) && strpos($mime, 'video/') === 0) return true;

    $file = get_attached_file((int) $v);
    if (!empty($file) && file_exists($file)) {
      $ft = wp_check_filetype($file);
      if (!empty($ft['type']) && strpos($ft['type'], 'video/') === 0) return true;
    }
    return false;
  }

  if (is_string($v) && filter_var($v, FILTER_VALIDATE_URL)) {
    if (preg_match('~(youtu\.be|youtube\.com|vimeo\.com)~i', $v)) return true;

    $embed = @wp_oembed_get($v);
    return !empty($embed);
  }

  return false;
}

/**
 * Calculates full years of experience between the start date ($experience) and today.
 *
 * Expected input format: 'd.m.Y' (e.g., '31.12.2020').
 * Uses strict parsing with the '!' prefix and a fixed timezone 'Europe/Kyiv'.
 * Returns 0 if the date is in the future. Returns null for empty/invalid input.
 *
 * @param mixed $experience Input value convertible to a 'd.m.Y' string.
 * @return int|null Full years of experience, or null if input is empty/invalid.
 */
function calculate_years_of_experience($experience){
  // Normalize input to a trimmed string
  $experience_input = isset($experience) ? trim((string) $experience) : '';
  // Placeholder for a valid parsed start date
  $start = null;
  // Result placeholder; stays null unless we compute a valid difference
  $years = null;

  // Proceed only if input is not empty
  if(!empty($experience_input)) :
      // Fix timezone to keep "today" and comparisons consistent
      $tz = new DateTimeZone('Europe/Kyiv');
      // Today's date without time in the chosen timezone
      $today = new DateTime('today', $tz);
      // Strictly parse 'd.m.Y' (the '!' zeroes out time)
      $candidate = DateTime::createFromFormat('!d.m.Y', $experience_input, $tz);
      // Check for parsing errors/warnings
      $errors = DateTime::getLastErrors();
      $valid = ($candidate instanceof DateTime) && empty($errors['warning_count']) && empty($errors['error_count']);
      // Accept only a fully valid date
      if ($valid) :
          $start = $candidate;
      endif;
  endif;

  // If we have a valid start date, compute full years; guard against future dates
  if($start instanceof DateTime) :
      $years = ($start > $today) ? 0 : (int) $start->diff($today)->y;
  endif;

  // Return computed years or null if input was empty/invalid
  return $years;
}

/**
 * Wraps every N words in a span element with a specified class.
 *
 * This utility function takes a string, splits it into words, and wraps every group of N words
 * in a <span> element with the given CSS class. Useful for styling titles or headings with grouped words.
 *
 * @param string $text The input text to process.
 * @param int $n Number of words per group to wrap in a span. Must be >= 1. Default is 2.
 * @param string $pair_class CSS class to apply to each span. Default is 'title__pair'.
 * @return string The processed HTML string with words wrapped in span elements.
 *
 * @example
 * // Returns: '<span class="title__pair">Hello world</span> <span class="title__pair">from PHP</span>'
 * echo ensuria_wrap_every_n_words('Hello world from PHP', 2, 'title__pair');
 */
function ensuria_wrap_every_n_words(string $text, int $n = 2, string $pair_class = 'title__pair'): string
{
    $text = trim(wp_strip_all_tags($text));

    if ($text === '' || $n < 1) {
        return '';
    }

    $words = preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY);

    if (empty($words)) {
        return '';
    }

    $chunks = [];
    $count = count($words);

    for ($i = 0; $i < $count; $i += $n) {
        $slice = array_slice($words, $i, $n);
        $chunk = implode(' ', array_map('esc_html', $slice));
        $chunks[] = '<span class="' . esc_attr($pair_class) . '">' . $chunk . '</span>';
    }

    return implode(' ', $chunks);
}

/**
 * Extracts a Google Maps link from an iframe HTML string.
 *
 * This function parses the provided iframe HTML, attempts to extract the Google Maps source URL,
 * and returns a direct link to the map location. If the source cannot be determined, an empty string is returned.
 *
 * @param string $iframe_html The iframe HTML containing the Google Maps embed.
 * @return string The extracted Google Maps link, or an empty string if not found.
 */

function ensuria_google_maps_link_from_iframe($iframe_html)
{
    $iframe_html = (string) $iframe_html;

    $src = '';
    $url = '';
    $parts = [];
    $query = [];
    $lat = '';
    $lng = '';

    if (preg_match('/\ssrc=("|\')([^"\']+)\1/i', $iframe_html, $m)) {
        $src = html_entity_decode((string) $m[2], ENT_QUOTES);
    } else {
        $src = trim($iframe_html);
    }

    if ($src === '') {
        return '';
    }

    $parts = wp_parse_url($src);

    if (!empty($parts['query'])) {
        parse_str($parts['query'], $query);
    }

    if (!empty($query['q'])) {
        $url = 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode((string) $query['q']);
        return $url;
    }

    if (!empty($query['pb']) && preg_match('/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/', (string) $query['pb'], $mm)) {
        $lng = (string) $mm[1];
        $lat = (string) $mm[2];
        $url = 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode($lat . ',' . $lng);
        return $url;
    }

    if (preg_match('/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/', $src, $mm2)) {
        $lng = (string) $mm2[1];
        $lat = (string) $mm2[2];
        $url = 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode($lat . ',' . $lng);
        return $url;
    }

    return '';
}
 
function ensuria_price_all_loaded_html() {
	ob_start();
	?>
	<div id="price-all-loaded" class="price__all-loaded" role="status" aria-live="polite">
		<span class="price__all-loaded-icon" aria-hidden="true">
			<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24.0003 38.7492H14.1234C13.0259 38.7492 10.8311 38.0937 10.8311 35.4715V11.7083C10.8311 10.8888 11.3249 9.25 13.3003 9.25H34.7004C35.5235 9.25 37.1696 9.74165 37.1696 11.7083V25.6384" stroke="#242529" stroke-width="3"/>
        <path d="M24.0006 9.2508L33.8776 9.2508C34.975 9.2508 37.1699 9.90634 37.1699 12.5285L37.1699 36.2917C37.1699 37.1112 36.6761 38.75 34.7007 38.75L13.3006 38.75C12.4775 38.75 10.8314 38.2583 10.8314 36.2917L10.8314 22.3616" stroke="#242529" stroke-width="3"/>
        <line x1="16.0986" y1="18.2656" x2="30.8482" y2="18.2656" stroke="#242529" stroke-width="3"/>
        <line x1="16.0986" y1="24.0312" x2="23.4734" y2="24.0312" stroke="#242529" stroke-width="3"/>
      </svg>
		</span>
		<span class="price__all-loaded-text"><?php echo esc_html__( 'Всі послуги завантажені', 'ensuria' ); ?></span>
	</div>
	<?php
	return ob_get_clean();
}

/**
 * Returns the primary term (Yoast) if available; otherwise returns the first assigned term.
 *
 * @param int    $post_id  Post ID.
 * @param string $taxonomy Taxonomy name. Default 'category'.
 * @return WP_Term|null    Term object or null if none found.
 */
function ensuria_get_primary_or_first_term(int $post_id, string $taxonomy = 'category'): ?WP_Term
{
    if ($post_id <= 0 || $taxonomy === '') {
        return null;
    }

    $primary_id = (int) get_post_meta($post_id, '_yoast_wpseo_primary_' . $taxonomy, true);

    if ($primary_id > 0) {
        $primary_term = get_term($primary_id, $taxonomy);

        if (!is_wp_error($primary_term) && $primary_term instanceof WP_Term) {
            return $primary_term;
        }
    }

    $terms = get_the_terms($post_id, $taxonomy);

    if (empty($terms) || is_wp_error($terms) || !is_array($terms)) {
        return null;
    }

    foreach ($terms as $term) {
        if ($term instanceof WP_Term) {
            return $term;
        }
    }

    return null;
}
function ensuria_get_page_id_by_template(string $template): int
{
    $template = ltrim($template, '/');

    $query_args = [
        'post_type'              => 'page',
        'post_status'            => 'publish',
        'posts_per_page'         => 1,
        'fields'                 => 'ids',
        'orderby'                => 'ID',
        'order'                  => 'ASC',
        'meta_query'             => [
            [
                'key'     => '_wp_page_template',
                'value'   => $template,
                'compare' => '=',
            ],
        ],
        'no_found_rows'          => true,
        'update_post_meta_cache' => false,
        'update_post_term_cache' => false,
    ];

    $q = new WP_Query($query_args);

    if (!empty($q->posts[0])) {
        return (int) $q->posts[0];
    }

    return 0;
}
