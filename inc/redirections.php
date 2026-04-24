<?php
/**
 * All redirects which created from theme files
 *
 */


//Redirect from author page to home page
add_action( 'template_redirect', function () {
	if ( is_author() ) {
		wp_redirect( home_url(), 301 );
		exit;
	}
	// https://url/?
	if ( preg_match( '#(.*)\?$#i', $_SERVER['REQUEST_URI'] ) ) {
		wp_redirect( strtok( $_SERVER["REQUEST_URI"], '?' ), 301 );
		exit;
	}
  $uri = $_SERVER['REQUEST_URI'];
  $lower = strtolower($uri);

  if ($uri !== $lower && strpos($uri, '/wp-admin') === false) {
      wp_redirect($lower, 301);
      exit;
  }
} );