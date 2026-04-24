<?php
if (!defined('ABSPATH')) exit;

function ensuria_price_slug() {
    return 'price';
}

function ensuria_price_label() {
    return __('Ціни', 'ensuria');
}

function ensuria_price_post_types() {
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

function ensuria_wpml_post_id($id, $type = 'page') {
    if (defined('ICL_SITEPRESS_VERSION')) {
        $lang = apply_filters('wpml_current_language', null);
        $tr = apply_filters('wpml_object_id', $id, $type, true, $lang);
        if (!empty($tr)) return (int) $tr;
    }
    return (int) $id;
}

function ensuria_get_price_page_id() {
    $slug = ensuria_price_slug();
    $page = get_page_by_path($slug);
    if ($page instanceof WP_Post) {
        return ensuria_wpml_post_id($page->ID, 'page');
    }
    return 0;
}

function ensuria_is_price_cpt_context() {
    $list = ensuria_price_post_types();
    if (is_post_type_archive($list)) return true;
    if (is_singular($list)) return true;
    return false;
}

function ensuria_current_price_pt() {
    $list = ensuria_price_post_types();
    if (is_post_type_archive($list)) {
        $pt = get_query_var('post_type');
        if (is_array($pt)) $pt = reset($pt);
        return $pt && in_array($pt, $list, true) ? $pt : '';
    }
    if (is_singular($list)) return get_post_type(get_queried_object_id());
    return '';
}

add_filter('wpseo_breadcrumb_links', function ($links) {
    if (!ensuria_is_price_cpt_context()) return $links;
    $home = isset($links[0]) ? $links[0] : ['url' => home_url('/'), 'text' => __('Home','ensuria')];
    $price_id = ensuria_get_price_page_id();
    $price_link = $price_id ? [
        'url' => get_permalink($price_id),
        'text' => get_the_title($price_id) ?: ensuria_price_label(),
        'allow_html' => true,
    ] : [
        'url' => home_url('/' . trim(ensuria_price_slug(), '/') . '/'),
        'text' => ensuria_price_label(),
        'allow_html' => true,
    ];
    $pt = ensuria_current_price_pt();
    $cpt_link = null;
    if ($pt) {
        $pto = get_post_type_object($pt);
        $arch = get_post_type_archive_link($pt);
        if ($pto && $arch) {
            $name = isset($pto->labels->name) ? (string) $pto->labels->name : strtoupper($pt);
            $cpt_link = ['url' => $arch, 'text' => $name, 'allow_html' => true];
        }
    }
    $new = [];
    $new[] = $home;
    $new[] = $price_link;
    if ($cpt_link) $new[] = $cpt_link;
    return $new;
}, 9, 1);

add_filter('wpseo_breadcrumb_links', function ($links) {
    $paged = max((int) get_query_var('paged'), (int) get_query_var('page'));
    if ($paged > 1) {
        $pattern = '~(?:^|\\b)(page|страница|сторінка|seite|página|pagina)\\s*' . $paged . '(?:\\b|$)~iu';
        foreach ($links as $i => $lnk) {
            $text = isset($lnk['text']) ? wp_strip_all_tags((string) $lnk['text']) : '';
            if ($text !== '' && preg_match($pattern, $text)) unset($links[$i]);
        }
        $links = array_values($links);
    }
    return $links;
}, 99, 1);
