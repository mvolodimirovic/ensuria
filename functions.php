<?php
/**
 * ensuria functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package ensuria
 */

define("THEME_WPML_SLUG", "ensuria"); 
define("THEME_SLUG", "ensuria");     

if ( ! function_exists( 'theme_setup__setup' ) ) :
	/**
	 * Sets up theme defaults and registers support for various WordPress features.
	 *
	 * Note that this function is hooked into the after_setup_theme hook, which
	 * runs before the init hook. The init hook is too late for some features, such
	 * as indicating support for post thumbnails.
	 */
	function theme_setup__setup() { 
		/*
		 * Make theme available for translation.
		 * Translations can be filed in the /languages/ directory.
		 * If you're building a theme based on ensuria, use a find and replace
		 * to change THEME_WPML_SLUG to the name of your theme in all the template files.
		 */
		load_theme_textdomain( THEME_WPML_SLUG, get_template_directory() . '/languages' );

		/*
		 * Let WordPress manage the document title.
		 * By adding theme support, we declare that this theme does not use a
		 * hard-coded <title> tag in the document head, and expect WordPress to
		 * provide it for us.
		 */
		add_theme_support( 'title-tag' );

		/*
		 * Enable support for Post Thumbnails on posts and pages.
		 *
		 * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
		 */
		add_theme_support( 'post-thumbnails' );

		// This theme uses wp_nav_menu() in one location.
		/** ==============================================
		 *  register menus ===============================
		 * ===============================================
		 */
		register_nav_menus(
			array(
				'top_menu' => esc_html__('Top menu', THEME_WPML_SLUG),
				'footer_menu' => esc_html__('Footer menu', THEME_WPML_SLUG),
				'footer_menu_bottom' => esc_html__('Footer menu bottom', THEME_WPML_SLUG),
			)
		);

		/*
		 * Switch default core markup for search form, comment form, and comments
		 * to output valid HTML5.
		 */
		add_theme_support(
			'html5',
			array(
				'search-form',
				'comment-form',
				'comment-list',
				'gallery',
				'caption',
				'style',
				'script',
			)
		);

		/** ==============================================
		 *  Add image sizes ==============================
		 * ===============================================
		 */
		add_image_size('name', 488, 488, false); 
		add_image_size('special-mini', 140, 140, true); 
		add_image_size('home-hero', 720, 565, false); 
		add_image_size('single-image', 922, 715, false); 
		add_image_size('services-hero', 642, 387, false); 
	}
endif;
add_action( 'after_setup_theme', 'theme_setup__setup' );

/**
 * Enqueue scripts and styles.
 */ 
function ensuria_enqueue_scripts() {
  // СТИЛІ
  wp_enqueue_style('swiper-style', get_template_directory_uri() . '/assets/css/swiper.min.css', [], filemtime(get_template_directory() . '/assets/css/swiper.min.css'));
  wp_enqueue_style('ensuria-style', get_template_directory_uri() . '/assets/css/style.min.css', [], filemtime(get_template_directory() . '/assets/css/style.min.css'));

  // SWIPER (defer)
  wp_register_script('swiper-scripts', get_template_directory_uri() . '/assets/js/swiper.min.js', [], filemtime(get_template_directory() . '/assets/js/swiper.min.js'), true);
  wp_script_add_data('swiper-scripts', 'defer', true);
  wp_enqueue_script('swiper-scripts');

  // SITE JS (defer)
  wp_register_script('ensuria-scripts', get_template_directory_uri() . '/assets/js/site.min.js', [], filemtime(get_template_directory() . '/assets/js/site.min.js'), true);
  wp_script_add_data('ensuria-scripts', 'defer', true);
  wp_enqueue_script('ensuria-scripts');
  
  // Binotel 
	$widget_hash = 'gsgqcy4z7mypvfjr4u6v';
	wp_register_script('binotel-inline', '', [], null, true);
	wp_enqueue_script('binotel-inline');
	$inline = "(function(d,w,s){var widgetHash='{$widget_hash}',gcw=d.createElement(s);gcw.type='text/javascript';gcw.async=true;gcw.src='https://widgets.binotel.com/getcall/widgets/'+widgetHash+'.js';var sn=d.getElementsByTagName(s)[0];sn.parentNode.insertBefore(gcw,sn);})(document,window,'script');";
	wp_add_inline_script('binotel-inline', $inline, 'before');

  wp_localize_script('ensuria-scripts', 'appAjax', [
    'env'  => is_test_environment() ? 'development' : 'production',
    'url'   => admin_url('admin-ajax.php'),
    'nonces' => [
      'ajaxFragments'   => wp_create_nonce('ajax-fragments'),
      'price' => wp_create_nonce('price'),
    ],
  ]);
}
add_action('wp_enqueue_scripts', 'ensuria_enqueue_scripts');
/**
 * Enqueue styles for Gutenberg.
 */
function admin_setup_scripts() {
	wp_enqueue_style('admin-style', get_template_directory_uri() . '/assets/css/editor.min.css', array(), filemtime(get_template_directory() . '/assets/css/editor.min.css'));
}
add_action('enqueue_block_editor_assets', 'admin_setup_scripts',20);

/**
 * Additions to the basic Wordpress customizer
 */
require get_template_directory() . '/inc/customizer.php';

/**
 * All functions for customizing and designing the admin area
 */
require get_template_directory() . '/inc/admin-customize.php';

/**
 * All pre_get_posts functions from the theme
 */
require get_template_directory() . '/inc/pre-get-post.php';

/**
 * All redirects which created from theme files
 */
require get_template_directory() . '/inc/redirections.php';

/**
 * Custom functions which enhance the theme by hooking into WordPress
 */
require get_template_directory() . '/inc/template-functions.php';

/**
 * Rest api disable
 */
// require get_template_directory() . '/inc/rest-api-disable.php';

/**
 * Ajax 
 */
require get_template_directory() . '/inc/ajax-functions.php';

/**
 * Custom Blocks 
 */
require get_template_directory() . '/inc/custom-blocks.php';

/**
 * Filter Functions
 */
require get_template_directory() . '/inc/filters-functions.php';

/**
 * Block Loader
 */
require get_template_directory() . '/inc/block-loaders.php';
/**
 * Sitemap & breadcrumbs
 */
require get_template_directory() . '/inc/price-settings-page.php'; 

/**
 * Review to SiteMap
 */
require get_template_directory() . '/inc/review-to-sitemap.php'; 