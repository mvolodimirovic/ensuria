<?php

/*
	Disable REST API link in HTTP headers
	Link: <https://example.com/wp-json/>; rel="https://api.w.org/"
*/
remove_action('template_redirect', 'rest_output_link_header', 11);

/*
	Disable REST API links in HTML <head>
	<link rel='https://api.w.org/' href='https://example.com/wp-json/' />
*/
remove_action('wp_head', 'rest_output_link_wp_head', 10);
remove_action('xmlrpc_rsd_apis', 'rest_output_rsd');

/*
	Disable REST API
    For logged-in users, WP REST API works normally
    For logged-out users, WP REST API is disabled
*/
add_filter('rest_authentication_errors', 'disable_wp_rest_api');

function disable_wp_rest_api($access)
{
    global $wp;

    $request = isset($wp->request) ? (string) $wp->request : '';

    $is_cf7  = str_contains($request, 'wp-json/contact-form-7/v1');
    $is_sync = str_contains($request, 'wp-json/sync-stp/v1'); // endpoint for sync-stage-to-prod plugin

    if (!is_user_logged_in() && !$is_cf7 && !$is_sync) {
        $message = apply_filters(
            'disable_wp_rest_api_error',
            __('REST API restricted to authenticated users.', 'disable-wp-rest-api')
        );

        return new WP_Error(
            'rest_login_required',
            $message,
            ['status' => rest_authorization_required_code()]
        );
    }

    return $access;
}

/*
	Disable XML-RPC
*/
add_filter('xmlrpc_enabled', '__return_false');
function remove_xmlrpc_methods($methods)
{
  return array();
}
add_filter('xmlrpc_methods', 'remove_xmlrpc_methods');

// Remove RSD remote publication link
remove_action('wp_head', 'rsd_link');
// Remove Windows для Live Writer link
remove_action('wp_head', 'wlwmanifest_link');
// Remove oEmbed discovery links.
remove_action('wp_head', 'wp_oembed_add_discovery_links');
// Remove oEmbed iframes communicate JavaScript from the front-end and back-end.
remove_action('wp_head', 'wp_oembed_add_host_js');
// Turn off oEmbed auto discovery request for unknown URLs.
add_filter('embed_oembed_discover', '__return_false');
// remove HTML meta tag
// <link rel='shortlink' href='http://example.com/?p=25' />
remove_action('wp_head', 'wp_shortlink_wp_head', 10);
