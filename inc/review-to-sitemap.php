<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function ens_reviews_archive_sitemap_register() {
	global $wpseo_sitemaps;

	if ( ! isset( $wpseo_sitemaps ) || empty( $wpseo_sitemaps ) ) {
		return;
	}

	$wpseo_sitemaps->register_sitemap( 'reviews', 'ens_reviews_archive_sitemap_generate' );
}

add_action( 'init', 'ens_reviews_archive_sitemap_register', 99 );

function ens_reviews_archive_sitemap_index( $sitemap_index ) {
	$sitemap_url = home_url( 'reviews-sitemap.xml' );
	$lastmod     = ens_reviews_archive_lastmod();

	$sitemap_index .= "\n<sitemap>\n<loc>" . ens_reviews_archive_esc_xml( $sitemap_url ) . "</loc>\n<lastmod>" . ens_reviews_archive_esc_xml( $lastmod ) . "</lastmod>\n</sitemap>\n";

	return $sitemap_index;
}

add_filter( 'wpseo_sitemap_index', 'ens_reviews_archive_sitemap_index' );

function ens_reviews_archive_sitemap_generate() {
	global $wpseo_sitemaps;

	if ( ! isset( $wpseo_sitemaps ) || empty( $wpseo_sitemaps ) ) {
		return;
	}

	$loc = ens_reviews_archive_url();
	$mod = ens_reviews_archive_lastmod();

	$url_entry = $wpseo_sitemaps->renderer->sitemap_url(
		[
			'loc' => $loc,
			'mod' => $mod,
		]
	);

	$sitemap  = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
	$sitemap .= 'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" ';
	$sitemap .= 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
	$sitemap .= "\n" . $url_entry . "\n";
	$sitemap .= '</urlset>';

	$wpseo_sitemaps->set_sitemap( $sitemap );
}

function ens_reviews_archive_url() {
	$post_type = 'reviews';

	if ( post_type_exists( $post_type ) ) {
		$link = get_post_type_archive_link( $post_type );
		if ( ! empty( $link ) ) {
			return $link;
		}
	}

	return home_url( '/reviews/' );
}

function ens_reviews_archive_lastmod() {
	$post_type = 'reviews';

	if ( post_type_exists( $post_type ) ) {
		$q = new WP_Query(
			[
				'post_type'              => $post_type,
				'post_status'            => 'publish',
				'posts_per_page'         => 1,
				'orderby'                => 'modified',
				'order'                  => 'DESC',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
				'fields'                 => 'ids',
			]
		);

		if ( ! empty( $q->posts[0] ) ) {
			$t = get_post_modified_time( 'c', true, $q->posts[0] );
			if ( ! empty( $t ) ) {
				return $t;
			}
		}
	}

	return date('c');
}

function ens_reviews_archive_esc_xml( $value ) {
	$value = (string) $value;

	if ( function_exists( 'esc_xml' ) ) {
		return esc_xml( $value );
	}

	return htmlspecialchars( $value, ENT_XML1 | ENT_COMPAT, 'UTF-8' );
}
