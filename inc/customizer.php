<?php
/**
 * Theme Customizer
 *
 */

/**
 * Add postMessage support for site title and description for the Theme Customizer.
 *
 * @param WP_Customize_Manager $wp_customize Theme Customizer object.
 */
function theme_setup__customize_register( $wp_customize ) {
	$wp_customize->get_setting( 'blogname' )->transport         = 'postMessage';
	$wp_customize->get_setting( 'blogdescription' )->transport  = 'postMessage';

	if ( isset( $wp_customize->selective_refresh ) ) {
		$wp_customize->selective_refresh->add_partial(
			'blogname',
			array(
				'selector'        => '.site-title a',
				'render_callback' => 'theme_setup__customize_partial_blogname',
			)
		);
		$wp_customize->selective_refresh->add_partial(
			'blogdescription',
			array(
				'selector'        => '.site-description',
				'render_callback' => 'theme_setup__customize_partial_blogdescription',
			)
		);
	}
}
add_action( 'customize_register', 'theme_setup__customize_register' );

/**
 * Render the site title for the selective refresh partial.
 *
 * @return void
 */
function theme_setup__customize_partial_blogname() {
	bloginfo( 'name' );
}

/**
 * Render the site tagline for the selective refresh partial.
 *
 * @return void
 */
function theme_setup__customize_partial_blogdescription() {
	bloginfo( 'description' );
}

add_action('wp_enqueue_scripts', function(){
    wp_dequeue_style('wp-block-library');
}, 100);