<?php

/**
 * All functions for customizing and designing the admin area
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'ICL_LANGUAGE_CODE' ) ) {
	// Replace the ICL_LANGUAGE_CODE if not defined.
	define( 'ICL_LANGUAGE_CODE', 'uk' ); 
}

function login_logo() {
	?>
	<style type="text/css">
		#login h1 a,
		.login h1 a {
			background-image: url(<?php echo get_stylesheet_directory_uri(); ?>/assets/img/logo.svg);
			background-size: contain;
			background-position: center;
			width: 248px;
			height: 26px;
		}
	</style>
	<?php
}
add_action( 'login_enqueue_scripts', 'login_logo' );

function login_logo_url() {
	return home_url();
}
add_filter( 'login_headerurl', 'login_logo_url' );

function login_logo_url_title() {
	return get_bloginfo( 'name' );
}
add_filter( 'login_headertext', 'login_logo_url_title' );

/**
 * Remove comments and default posts
 */
function my_remove_admin_menus() {
	// remove_menu_page( 'edit-comments.php' );
	// remove_menu_page( 'edit.php' );
}
add_action( 'admin_menu', 'my_remove_admin_menus' );

function remove_default_post_tags() {
  unregister_taxonomy_for_object_type('post_tag', 'post');
}
add_action('init', 'remove_default_post_tags');

/**
 * Remove comments and default posts from admin bar
 */
function my_adminbar_new_content() {

	global $wp_admin_bar;

	// get node for New + menu node
	$new_content_node = $wp_admin_bar->get_node( 'new-content' );

	if ($new_content_node) {
		// change URL for node, edit for prefered link
		$new_content_node->href = admin_url( '' );

		// Update New + menu node
		$wp_admin_bar->add_node( $new_content_node );
	}

	// remove items from New Content menu
	$wp_admin_bar->remove_node( 'new-post' );
	$wp_admin_bar->remove_node( 'comments' );
}
add_action( 'wp_before_admin_bar_render', 'my_adminbar_new_content' );

/**
 * Disable WordPress Big Image Size Scaling
 */
add_filter( 'big_image_size_threshold', '__return_false' );

/**
 * Remove default image sizes
 */
function remove_default_image_sizes( $sizes ) {
	unset( $sizes['1536x1536'] );
	unset( $sizes['2048x2048'] );
	return $sizes;
}
add_filter( 'intermediate_image_sizes_advanced', 'remove_default_image_sizes' );

/**
 * Remove empty paragraphs
 */
add_filter( 'the_content', 'remove_empty_p' );
add_filter( 'the_excerpt', 'remove_empty_p' );
function remove_empty_p( $content ) {
	return str_ireplace( array( '<p>&nbsp;</p>', '<p></p>' ), '', $content );
}

/**
 * Remove empty paragraphs ACF
 */
function my_acf_load_value( $value, $post_id, $field ) {
	$content = apply_filters( 'the_content', $value );
	$content = force_balance_tags( $content );
	$content = preg_replace( '#<p>\s*+(<br\s*/*>)?\s*</p>#i', '', $content );
	$content = preg_replace( '~\s?<p>(\s| )+</p>\s?~', '', $content );

	return $content;
}
add_filter( 'acf/load_value/type=wysiwyg', 'my_acf_load_value', 10, 3 );

/**
 * Remove p tag from img in content
 */
function filter_ptags_on_images( $content ) {
	return preg_replace( '/<p>\s*(<a .*>)?\s*(<img .* \/>)\s*(<\/a>)?\s*<\/p>/iU', '\1\2\3', $content );
}
add_filter( 'the_content', 'filter_ptags_on_images' );

// img unautop
// use the get_field() or the_field() functions
function img_unautop( $pee ) {
	$pee = preg_replace( '/<p>\\s*?(<a .*?><img.*?><\\/a>|<img.*?>)?\\s*<\\/p>/s', '<figure class="wp-block-image">$1</figure>', $pee );
	return $pee;
}
add_filter( 'acf_the_content', 'img_unautop', 30 );

/**
 * Move Yoast to the Bottom
 */
function yoasttobottom() {
	return 'low';
}
add_filter( 'wpseo_metabox_prio', 'yoasttobottom' );

function post_relationship_query( $args, $field, $post_id ) {
	// order by newest posts first
	$args['orderby']     = 'date';
	$args['order']       = 'DESC';
	$args['post_status'] = 'publish';

	// return
	return $args;
}
// set order by date filter for every field with post query
add_filter( 'acf/fields/relationship/query', 'post_relationship_query', 10, 3 );


function update_admin_color_for_test_environment( $color_scheme ) {
	global $current_user;
	wp_get_current_user();

	if ( is_test_environment() && $current_user->ID == 1 ) {
		$color_scheme = 'coffee';
	}

	return $color_scheme;
}
add_filter( 'get_user_option_admin_color', 'update_admin_color_for_test_environment', 5 );

function disable_default_dashboard_widgets() {
	global $wp_meta_boxes;
	// wp
	unset( $wp_meta_boxes['dashboard']['normal']['core']['dashboard_site_health'] );
	unset( $wp_meta_boxes['dashboard']['normal']['core']['dashboard_activity'] );
	unset( $wp_meta_boxes['dashboard']['normal']['core']['dashboard_right_now'] );
	unset( $wp_meta_boxes['dashboard']['normal']['core']['dashboard_recent_comments'] );
	unset( $wp_meta_boxes['dashboard']['normal']['core']['dashboard_incoming_links'] );
	unset( $wp_meta_boxes['dashboard']['normal']['core']['dashboard_plugins'] );
	unset( $wp_meta_boxes['dashboard']['side']['core']['dashboard_primary'] );
	unset( $wp_meta_boxes['dashboard']['side']['core']['dashboard_secondary'] );
	unset( $wp_meta_boxes['dashboard']['side']['core']['dashboard_quick_press'] );
	unset( $wp_meta_boxes['dashboard']['side']['core']['dashboard_recent_drafts'] );
	// bbpress
	unset( $wp_meta_boxes['dashboard']['normal']['core']['bbp-dashboard-right-now'] );
	// yoast seo
	unset( $wp_meta_boxes['dashboard']['normal']['core']['wpseo-dashboard-overview'] );
	unset( $wp_meta_boxes['dashboard']['normal']['core']['wpseo-wincher-dashboard-overview'] );
	// gravity forms
	unset( $wp_meta_boxes['dashboard']['normal']['core']['rg_forms_dashboard'] );
}
add_action( 'wp_dashboard_setup', 'disable_default_dashboard_widgets', 999 );

add_filter('use_block_editor_for_post_type', 'disable_gutenberg_for_pages', 10, 2);

function disable_gutenberg_for_pages($use_block_editor, $post_type) {
    if ($post_type !== 'page') {
        return $use_block_editor;
    }

    $post_id = 0;

    if (!empty($_GET['post'])) {
        $post_id = (int) $_GET['post'];
    } elseif (!empty($_POST['post_ID'])) {
        $post_id = (int) $_POST['post_ID'];
    }

    if (!empty($post_id)) {
        $template = get_page_template_slug($post_id);
        if ($template === 'template-about.php' || $template === 'template-privacy.php' || $template === 'template-contact.php') {
            return true;
        }
    }

    return false;
}


add_action( 'admin_head', 'custom_remove_max_width_on_edittag' );
function custom_remove_max_width_on_edittag() {
    $screen = get_current_screen();

        echo '<style>
            #edittag {
                max-width: none !important;
                width: 100% !important;
            }
        </style>';
}

if (!defined('ABSPATH')) exit;

function ensuria_cpt_slugs() {
  return [
    'analizy',
    'price-therapy',
    'price-gastroenterolo',
    'price-neurology',
    'price-psychology',
    'price-vaccination',
    'price-otolaryngology',
    'price-gynecology',
    'price-dermatology',
    'price-orthopedics',
    'price-massage',
    'price-cardio',
    'price-rheumatology',
    'price-hospital',
    'price-uzd',
  ];
}

function ensuria_register_archive_options_pages() {
  if (!function_exists('acf_add_options_page')) return; 

  foreach (ensuria_cpt_slugs() as $slug) {
    
    $pt = get_post_type_object($slug);
    $label = (string)$pt->label;
    $menu_slug = 'options_archive-' . sanitize_title($slug);
    $exists = function_exists('acf_get_options_page') ? (bool) acf_get_options_page($menu_slug) : false;
    if ($exists) continue;

    acf_add_options_page([
      'page_title'      => 'Архів ' . $label,
      'menu_title'      => 'Архів ' . $label,
      'menu_slug'       => $menu_slug,
      'capability'      => 'manage_options',
      'redirect'        => false,
      'autoload'        => false,
      'post_id'         => $menu_slug,
    ]);
  }
}

function ensuria_adminbar_archive_menu($wp_admin_bar) {
  if (!current_user_can('manage_options')) return;
  $wp_admin_bar->add_node([
    'id' => 'ens-archive-options',
    'title' => 'Archive Options',
    'href' => admin_url('edit.php'),
  ]);
  foreach (ensuria_cpt_slugs() as $slug) {
    $menu_slug = 'options_archive-' . sanitize_title($slug);
    $pt = post_type_exists($slug) ? get_post_type_object($slug) : null;
    $label = $pt && !empty($pt->labels->name) ? (string)$pt->labels->name : strtoupper($slug);
    $wp_admin_bar->add_node([
      'id' => 'ens-archive-' . $slug,
      'parent' => 'ens-archive-options',
      'title' => 'Архів ' . $label,
      'href' => admin_url('admin.php?page=' . $menu_slug),
    ]);
  }
}

add_action('admin_init', 'ensuria_register_archive_options_pages', 1);
add_action('admin_bar_menu', 'ensuria_adminbar_archive_menu', 99);

add_action('admin_head', 'hide_archive_page_admin_price_menu');

function hide_archive_page_admin_price_menu(){
  echo '<style id="ensuria-hide-cpts-adminbar">';
  foreach (ensuria_cpt_slugs() as $slug) {
    echo '#adminmenu #toplevel_page_options_archive-' . esc_attr($slug) . '{display:none!important;}';
    echo '#adminmenu #toplevel_page_analizy-archive{display:none!important;}';
  }
  echo '</style>';
};

add_filter('wp_img_tag_add_auto_sizes', '__return_false');

if (!defined('ENSURIA_UPLOADS_FILTER_PRIORITY')) {
	define('ENSURIA_UPLOADS_FILTER_PRIORITY', 100);
}

if (!defined('ENSURIA_ALLOWED_IMAGE_EXTENSIONS')) {
	define('ENSURIA_ALLOWED_IMAGE_EXTENSIONS', ['webp', 'svg']);
}

if (!defined('ENSURIA_DEFAULT_SVG_SUPPORT_PLUGIN_FILE')) {
	define('ENSURIA_DEFAULT_SVG_SUPPORT_PLUGIN_FILE', 'svg-support/svg-support.php');
}

add_filter('upload_mimes', 'ensuria_uploads_allow_webp_and_svg_when_plugin_active', ENSURIA_UPLOADS_FILTER_PRIORITY, 1);
add_filter('wp_handle_upload_prefilter', 'ensuria_uploads_validate_webp_and_svg', ENSURIA_UPLOADS_FILTER_PRIORITY, 1);
add_filter('wp_handle_sideload_prefilter', 'ensuria_uploads_validate_webp_and_svg', ENSURIA_UPLOADS_FILTER_PRIORITY, 1);

function ensuria_get_svg_support_plugin_file() {
	$default = ENSURIA_DEFAULT_SVG_SUPPORT_PLUGIN_FILE;

	if (function_exists('apply_filters')) {
		return (string) apply_filters('ensuria_svg_support_plugin_file', $default);
	}

	return $default;
}

function ensuria_is_svg_support_active() {
	static $active = null;

	if ($active !== null) {
		return $active;
	}

	$active = false;

	if (!function_exists('is_plugin_active')) {
		$plugin_file = ABSPATH . 'wp-admin/includes/plugin.php';
		if (is_readable($plugin_file)) {
			include_once $plugin_file;
		}
	}

	$plugin = ensuria_get_svg_support_plugin_file();

	if (function_exists('is_plugin_active') && is_plugin_active($plugin)) {
		$active = true;
		return $active;
	}

	if (function_exists('is_plugin_active_for_network') && is_plugin_active_for_network($plugin)) {
		$active = true;
		return $active;
	}

	return $active;
}

function ensuria_uploads_allow_webp_and_svg_when_plugin_active($mimes) {
	if (empty($mimes) || !is_array($mimes)) {
		return $mimes;
	}

	/**
	 * SVG is allowed only when the "SVG Support" plugin is active.
	 * SVG sanitization and role/capability control must be handled by the plugin.
	 * This code intentionally does not sanitize or validate SVG content.
	 */

	foreach ($mimes as $ext => $mime) {
		$mime_lc = strtolower((string) $mime);
		if (strpos($mime_lc, 'image/') === 0) {
			unset($mimes[$ext]);
		}
	}

	$mimes['webp'] = 'image/webp';

	if (ensuria_is_svg_support_active()) {
		$mimes['svg'] = 'image/svg+xml';
	}

	return $mimes;
}

function ensuria_uploads_validate_webp_and_svg($file) {
	$name = !empty($file['name']) ? (string) $file['name'] : '';
	$tmp  = !empty($file['tmp_name']) ? (string) $file['tmp_name'] : '';
	$type = !empty($file['type']) ? strtolower((string) $file['type']) : '';

	if ($name === '' || $tmp === '') {
		return $file;
	}

	$path_ext = strtolower((string) pathinfo($name, PATHINFO_EXTENSION));

	$checked_ext  = '';
	$checked_mime = '';

	if (function_exists('wp_check_filetype_and_ext')) {
		$checked = wp_check_filetype_and_ext($tmp, $name);

		if (!empty($checked['ext'])) {
			$checked_ext = strtolower((string) $checked['ext']);
		}

		if (!empty($checked['type'])) {
			$checked_mime = strtolower((string) $checked['type']);
		}
	}

	$raster_mime = '';
	if (function_exists('wp_get_image_mime')) {
		$detected = wp_get_image_mime($tmp);
		if (!empty($detected) && is_string($detected)) {
			$raster_mime = strtolower($detected);
		}
	}

	$allowedImageExtensions = ENSURIA_ALLOWED_IMAGE_EXTENSIONS;

	$is_image_like = false;

	if ($raster_mime !== '' && strpos($raster_mime, 'image/') === 0) {
		$is_image_like = true;
	} elseif ($checked_mime !== '' && strpos($checked_mime, 'image/') === 0) {
		$is_image_like = true;
	} elseif ($type !== '' && strpos($type, 'image/') === 0) {
		$is_image_like = true;
	} elseif ($path_ext !== '' && in_array($path_ext, $allowedImageExtensions, true)) {
		$is_image_like = true;
	}

	if (!$is_image_like) {
		return $file;
	}

	if ($checked_ext === '' && $checked_mime === '' && $raster_mime === '') {
		$file['error'] = __('Upload blocked: unable to verify the real file type.', 'ensuria');
		return $file;
	}

	$ext = $checked_ext !== '' ? $checked_ext : $path_ext;

	if ($ext === 'svg') {
		if (!ensuria_is_svg_support_active()) {
			$file['error'] = __('SVG uploads are allowed only when the SVG Support plugin is active.', 'ensuria');
			return $file;
		}

		if ($checked_mime !== 'image/svg+xml') {
			$file['error'] = __('Invalid SVG file type.', 'ensuria');
			return $file;
		}

		return $file;
	}

	if ($ext !== 'webp') {
		$file['error'] = __('Only WEBP or SVG images are allowed.', 'ensuria');
		return $file;
	}

	if ($raster_mime !== 'image/webp') {
		$file['error'] = __('Only valid WEBP images are allowed.', 'ensuria');
		return $file;
	}

	return $file;
}

// add_action('admin_init', function () {
// 	if (wp_doing_ajax()) return;

// 	if (!is_user_logged_in()) return;

// 	if (current_user_can('manage_options')) return;

// 	wp_safe_redirect(home_url('/'));
// 	exit;
// });