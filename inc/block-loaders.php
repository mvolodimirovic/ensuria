<?php
if (!defined('ABSPATH')) exit;

if (!function_exists('ensuria_get_price_list_first')) {
    function ensuria_get_price_list_first($post_id = 0) {
        static $cache = [];
        $pid = 0;
        $content = '';
        $blocks = [];
        $result = '';
        $group = [];
        $val = '';
        $candidate = ['price_list','price_group_price_list','data_price_list','data_price_group_price_list'];

        if (!empty($post_id)) {
            $pid = (int) $post_id;
        }
        if (empty($pid)) {
            $pid = get_the_ID();
        }
        if (empty($pid)) {
            return '';
        }

        if (isset($cache[$pid])) {
            return $cache[$pid];
        }

        $content = get_post_field('post_content', $pid);
        if (!empty($content) && function_exists('parse_blocks')) {
            $blocks = parse_blocks($content);
        }

        if (!empty($blocks) && is_array($blocks)) {
            $result = ensuria__find_price_list_in_blocks($blocks, $candidate);
        }

        if ($result === '' && function_exists('get_field')) {
            $group = get_field('price_group', $pid);
            if (!empty($group) && is_array($group) && !empty($group['price_list'])) {
                $result = (string) $group['price_list'];
            } else {
                $val = get_field('price_list', $pid);
                if (!empty($val)) {
                    $result = (string) $val;
                }
            }
        }

        $cache[$pid] = $result;
        return $result;
    }
}

if (!function_exists('ensuria__find_price_list_in_blocks')) {
    function ensuria__find_price_list_in_blocks($blocks, $candidate_keys = []) {
        $found = '';
        $name = '';
        $attrs = [];
        $data = [];
        $inner = [];

        if (empty($blocks) || !is_array($blocks)) {
            return '';
        }

        foreach ($blocks as $block) {
            $name = !empty($block['blockName']) ? $block['blockName'] : '';
            if ($name === 'ensuria/price') {
                $attrs = !empty($block['attrs']) ? $block['attrs'] : [];
                $data = !empty($attrs['data']) ? $attrs['data'] : [];
                if (!empty($data)) {
                    foreach ($candidate_keys as $key) {
                        if (!empty($data[$key])) {
                            $found = (string) $data[$key];
                            break 2;
                        }
                    }
                    if (empty($found) && !empty($data['price_group']) && is_array($data['price_group']) && !empty($data['price_group']['price_list'])) {
                        $found = (string) $data['price_group']['price_list'];
                        break;
                    }
                }
            }
            if (empty($found) && !empty($block['innerBlocks'])) {
                $inner = ensuria__find_price_list_in_blocks($block['innerBlocks'], $candidate_keys);
                if ($inner !== '') {
                    $found = $inner;
                    break;
                }
            }
        }

        return $found;
    }
}
