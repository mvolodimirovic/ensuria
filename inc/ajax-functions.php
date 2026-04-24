<?php
if (!defined('ABSPATH')) exit;

add_action('wp_ajax_get_modal',        'theme_ajax_get_modal');
add_action('wp_ajax_nopriv_get_modal', 'theme_ajax_get_modal');

function theme_ajax_get_modal() {
  if ( ! check_ajax_referer('ajax-fragments', 'nonce', false) ) {
    wp_send_json_error(['message' => 'Invalid nonce'], 403);
  }

  $slug_raw = isset($_POST['slug']) ? wp_unslash($_POST['slug']) : '';
  $post_id = isset($_POST['post_id']) ? wp_unslash($_POST['post_id']) : '';
  $slug     = preg_replace('/[^a-z0-9_-]/i', '', $slug_raw);
  if ($slug === '') {
    wp_send_json_error(['message' => 'Empty slug'], 400);
  }

  $video_id = isset($_POST['video_id']) ? absint($_POST['video_id']) : 0;

  $part = 'template-parts/modals/' . $slug;
  
  ob_start();
  get_template_part($part, null, ['video_id' => $video_id, 'post_id' => $post_id]);
  $html = ob_get_clean();

  if ($html === '') {
    wp_send_json_error(['message' => 'Template not found', 'slug' => $slug], 404);
  }
  
  wp_send_json_success(['html' => $html], 200);
}

add_action('wp_ajax_get_mobile_menu',        'theme_get_mobile_menu_fragment');
add_action('wp_ajax_nopriv_get_mobile_menu', 'theme_get_mobile_menu_fragment');

function theme_get_mobile_menu_fragment() {
  if ( ! check_ajax_referer('ajax-fragments', 'nonce', false) ) {
    wp_send_json_error(['message' => 'Invalid nonce'], 403);
  }

  ob_start();
  get_template_part('template-parts/modals/mobile-menu');
  $html = ob_get_clean();

  if ($html === '') {
    theme_log('[get_mobile_menu] Template empty');
    wp_send_json_error(['message' => 'Template not found'], 404);
  }

  wp_send_json_success(['html' => $html], 200);
}

add_action('http_api_curl', function($h){
    if (defined('CURL_IPRESOLVE_V4')) { curl_setopt($h, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4); }
}, 10, 1);

add_filter('http_request_args', function($args, $url){
    if (strpos($url, 'https://nethunt.com/') === 0 || strpos($url, 'https://api.nethunt.com/') === 0) {
        $args['timeout']     = max(20, isset($args['timeout']) ? (int)$args['timeout'] : 0);
        $args['httpversion'] = '1.1';
        if (defined('ENSURIA_RELAX_SSL') && ENSURIA_RELAX_SSL) { $args['sslverify'] = false; }
    }
    return $args;
}, 10, 2);

function filters () {
    $response           = array( 'posts' => '', 'pagination' => '', 'choiceIcons' => array() );
    $post_type          = isset($_POST['post-type']) ? sanitize_key( wp_unslash($_POST['post-type']) ) : 'team';
    $raw_params         = isset($_POST['url-param']) ? (string) wp_unslash($_POST['url-param']) : '';
    $raw_choice_labels  = isset($_POST['choice-labels']) ? (string) wp_unslash($_POST['choice-labels']) : '';

    $params_arr = array();
    $qs = ltrim($raw_params, '?');
    if ($qs !== '') parse_str($qs, $params_arr);

    $args = array(
        'post_type'      => $post_type,
        'posts_per_page' => 16,
        'post_status'    => 'publish',
        'orderby'        => 'menu_order',
        'order'          => 'ASC',
    );

    $tax_query = array();
    if (!empty($params_arr)) {
        foreach ($params_arr as $key => $value) {
            if (!get_taxonomy($key)) continue;
            $items = is_array($value) ? $value : explode(',', (string) $value);
            $items = array_filter(array_map('sanitize_title', $items));
            if ($items) {
                $tax_query[] = array(
                    'taxonomy' => $key,
                    'field'    => 'slug',
                    'terms'    => $items,
                );
            }
        }
    }
    if ($tax_query) $args['tax_query'] = $tax_query;

    $labels = array_filter(array_map('trim', explode(',', $raw_choice_labels)));
    if (empty($labels) && $params_arr) $labels = array_keys($params_arr); 
    if ($labels) {
        foreach ($labels as $label) {
            $response['choiceIcons'][$label] = filter_label_icon($label, $params_arr);
        }
    }

    $query = new WP_Query($args);

    ob_start();
    if ($query->have_posts()) {
        while ($query->have_posts()) { $query->the_post();
            get_template_part('template-parts/cards/card-member', null);
        }
    } else {
        echo '<div class="section__not-found">', esc_html__( 'Лікарів не знайдено, спробуйте змінити параметри фільтру', 'ensuria' ), '</div>';
    }
    $response['posts'] = ob_get_clean();

    ob_start();
    $max_pages = (int) $query->max_num_pages;
    if ($max_pages > 1) {
        $base   = trailingslashit( get_post_type_archive_link( $post_type ) ) . '%_%';
        $format = '?%#%';
        $qs_for_links = http_build_query($params_arr);
        if ($qs_for_links) $format .= '&' . $qs_for_links;

        echo paginate_links(array(
            'base'      => $base,
            'format'    => $format,
            'prev_next' => true,
            'prev_text' => '<svg role="presentation" focusable="false"><use xlink:href="' . esc_url( get_template_directory_uri() . '/assets/img/path-icon.svg#icon-arrow-right' ) . '"></use></svg>',
            'next_text' => '<svg role="presentation" focusable="false"><use xlink:href="' . esc_url( get_template_directory_uri() . '/assets/img/path-icon.svg#icon-arrow-right' ) . '"></use></svg>',
            'mid_size'  => 1,
            'total'     => $max_pages,
            'current'   => max( 1, (int) get_query_var('paged') ),
        ));
    }
    $response['pagination'] = ob_get_clean();

    wp_reset_postdata();

    wp_send_json($response);
}
add_action('wp_ajax_filters', 'filters');
add_action('wp_ajax_nopriv_filters', 'filters');

function ensuria_render_more_button($has_more) {
  if (!$has_more) return '';
  $label = esc_html__('Завантажити ще', 'ensuria');
  return '<button type="button" class="price__button btn btn--middle btn--blue-sky load-more" data-more aria-label="' . esc_attr__('Завантажити ще','ensuria') . '">' . $label . '</button>';
}
add_action('wp_ajax_get_price', 'ensuria_ajax_get_price');
add_action('wp_ajax_nopriv_get_price', 'ensuria_ajax_get_price');


function ensuria_ajax_get_price() {
	$post_id  = isset($_POST['post_id'])  ? absint($_POST['post_id'])  : 0;
	$page     = isset($_POST['paged'])    ? max(1, intval($_POST['paged'])) : (isset($_POST['page']) ? max(1, intval($_POST['page'])) : 1);
	$acat     = isset($_POST['acat'])     ? sanitize_text_field(wp_unslash($_POST['acat'])) : '';
	$q        = isset($_POST['q'])        ? sanitize_text_field(wp_unslash($_POST['q'])) : '';
	$ptype    = isset($_POST['ptype'])    ? sanitize_key(wp_unslash($_POST['ptype'])) : '';
	$taxonomy = isset($_POST['taxonomy']) ? sanitize_key(wp_unslash($_POST['taxonomy'])) : '';

	if ($ptype === '' || !post_type_exists($ptype)) {
		wp_send_json_success([
			'rows'            => '',
			'pagination'      => '',
			'has_more'        => false,
			'more'            => '',
			'current'         => 1,
			'total'           => 1,
			'url'             => $post_id ? get_permalink($post_id) : home_url('/'),
			'all_loaded_html' => '',
		]);
	}

	$ppp = 20;

	if ($taxonomy === '') {
		$tax_objs = get_object_taxonomies($ptype, 'objects');
		if (!empty($tax_objs) && is_array($tax_objs)) {
			foreach ($tax_objs as $tx) {
				if (!empty($tx->hierarchical) && !empty($tx->public)) {
					$taxonomy = $tx->name;
					break;
				}
			}
		}
	}

	$offset = ($page - 1) * $ppp;

	$args = [
		'post_type'              => $ptype,
		'post_status'            => 'publish',
		'orderby'                => 'date',
		'order'                  => 'ASC',
		'posts_per_page'         => $ppp,
		'paged'                  => 1,
		'offset'                 => $offset,
		'no_found_rows'          => false,
		'update_post_meta_cache' => false,
		'suppress_filters'       => false,
	];

	if ($q !== '') {
		$args['s'] = $q;
	}

	if ($taxonomy && taxonomy_exists($taxonomy) && $acat !== '') {
		$args['tax_query'] = [[
			'taxonomy' => $taxonomy,
			'field'    => 'slug',
			'terms'    => $acat,
		]];
	}

	$query = new WP_Query($args);

	ob_start();
	if ($query->have_posts()) {
		while ($query->have_posts()) {
			$query->the_post();
			$price_name = get_the_title();
			$price_cash = function_exists('get_field') ? get_field('price', get_the_ID()) : get_post_meta(get_the_ID(), 'price', true);
			?>
			<div class="price__text-wrapp">
				<?php if ($price_name !== '') : ?>
					<div class="price__text__name"><?php echo esc_html($price_name); ?></div>
				<?php endif; ?>
				<div class="price__text__cash">
					<?php echo esc_html($price_cash) . ' ' . esc_html__('грн', 'ensuria'); ?>
				</div>
			</div>
			<?php
		}
		wp_reset_postdata();
	}
	$rows_html = ob_get_clean();

	$found = isset($query->found_posts) ? intval($query->found_posts) : 0;
	$total_pages = $ppp > 0 ? max(1, (int) ceil($found / $ppp)) : 1;
	$has_more    = ($page < $total_pages);

	$base_url = $post_id ? get_permalink($post_id) : home_url('/');
	$page_url = trailingslashit(preg_replace('~(/page/\d+/?)+$~', '/', $base_url));
	if ($page > 1) {
		$page_url = trailingslashit($page_url . 'page/' . $page);
	}

	if ($q !== '') {
		$page_url = add_query_arg(['q' => $q], $page_url);
	} elseif ($acat !== '') {
		$page_url = add_query_arg(['acat' => $acat], $page_url);
	}

	$pagination_html = '';
	if ($total_pages > 1 && function_exists('ensuria_render_single_pagination')) {
		$pagination_html = ensuria_render_single_pagination($base_url, $page, $total_pages, $q === '' ? $acat : '', $q);
	}

	wp_send_json_success([
		'rows'            => $rows_html,
		'pagination'      => $pagination_html,
		'has_more'        => $has_more,
		'more'            => '',
		'current'         => $page,
		'total'           => $total_pages,
		'url'             => $page_url,
		'all_loaded_html' => $has_more ? '' : ensuria_price_all_loaded_html(),
	]);
}

add_action('wp_ajax_ensuria_get_certificate_modal', 'ensuria_get_certificate_modal');
add_action('wp_ajax_nopriv_ensuria_get_certificate_modal', 'ensuria_get_certificate_modal');

function ensuria_get_certificate_modal() {
  $nonce = isset($_POST['nonce']) ? sanitize_text_field(wp_unslash($_POST['nonce'])) : '';
  $attachment_id = isset($_POST['attachment_id']) ? absint($_POST['attachment_id']) : 0;

  $src = '';
  $alt = '';
  $width = 569;
  $height = 841;

  $img = [];
  $alt_raw = '';
  $html = '';

  if (empty($nonce) || !wp_verify_nonce($nonce, 'ajax-fragments')) {
    wp_send_json_error(['message' => esc_html__('Invalid nonce.', 'ensuria')], 403);
  }

  if (empty($attachment_id)) {
    wp_send_json_error(['message' => esc_html__('Image not found.', 'ensuria')], 404);
  }

  if (get_post_type($attachment_id) !== 'attachment' || !wp_attachment_is_image($attachment_id)) {
    wp_send_json_error(['message' => esc_html__('Image not found.', 'ensuria')], 404);
  }

  $img = wp_get_attachment_image_src($attachment_id, 'full');
  if (!empty($img[0])) {
    $src = $img[0];
  }

  if (!empty($img[1])) {
    $width = absint($img[1]);
  }

  if (!empty($img[2])) {
    $height = absint($img[2]);
  }

  $alt_raw = get_post_meta($attachment_id, '_wp_attachment_image_alt', true);
  if (is_string($alt_raw) && $alt_raw !== '') {
    $alt = $alt_raw;
  }

  if (empty($src)) {
    wp_send_json_error(['message' => esc_html__('Image not found.', 'ensuria')], 404);
  }

  ob_start();
  $args = [
    'src'=> $src,
    'alt' => $alt,
    'width' => $width,
    'height' => $height,
  ];
    get_template_part('/template-parts/modals/certificate','',$args);
  $html = ob_get_clean();

  wp_send_json_success(['html' => $html], 200);
}