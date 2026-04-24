<?php
if (!defined('ABSPATH')) exit;

/**
 * Register ACF-based blocks found under /build/blocks/*.
 *
 * Discovers built block manifests (block.json) and registers them with WordPress.
 *
 * @return void
 */
function register_acf_blocks() {
	$acf_blocks = glob(get_template_directory() . '/build/blocks/*');
	foreach ($acf_blocks as $block) {
		register_block_type($block);
	}
}
add_action('acf/init', 'register_acf_blocks');

/**
 * Prepare block defaults and HTML attributes for rendering.
 *
 * Merges incoming $abs_args with $abs_defaults, augments classes from $abs_block,
 * and returns a pair: [normalized_defaults, formatted_attributes_string].
 *
 * @param array      $abs_args     Arguments passed from a renderer (e.g., print_block()).
 * @param array      $abs_defaults Default block args (must include 'class' and optionally 'id', 'aria', etc.).
 * @param array|null $abs_block    Raw block context (Gutenberg $block array) or null.
 * @return array{0:array,1:string} Array with merged defaults and a space-joined attributes string.
 */
function setup_block_defaults($abs_args, $abs_defaults = [], $abs_block = null) {
	if (!empty($abs_args)) {
		$abs_defaults = get_formatted_args($abs_args, $abs_defaults);
	}
	$abs_block_classes = isset($abs_block) ? get_block_classes($abs_block) : [];
	if (!empty($abs_block_classes)) {
		$abs_defaults['class'] = array_merge($abs_defaults['class'], $abs_block_classes);
	}
	$abs_atts = get_formatted_atts(['class', 'id'], $abs_defaults);
	return [$abs_defaults, $abs_atts];
}

/**
 * Convert selected keys from an args array into an HTML attribute string.
 *
 * Supports regular attributes (class, id, etc.) and aria-* sub-attributes.
 * Multiple classes are space-joined.
 *
 * @param string[] $atts Keys to extract (e.g., ['class','id','aria']).
 * @param array    $args Source associative array of attribute values.
 * @return string  Space-separated HTML attributes (escaped).
 */
function get_formatted_atts($atts, $args) {
	$atts_formatted = [];
	foreach ($atts as $att) {
		if (array_key_exists($att, $args) && $args[$att]) {
			if ('aria' === $att && is_array($args['aria'])) {
				foreach ($args['aria'] as $key => $val) {
					if ($val) $atts_formatted[] = 'aria-' . $key . '="' . esc_attr($val) . '"';
				}
			} else {
				if ('class' === $att && is_array($args['class'])) $args['class'] = implode(' ', $args['class']);
				$atts_formatted[] = $att . '="' . esc_attr($args[$att]) . '"';
			}
		}
	}
	return implode(' ', $atts_formatted);
}

/**
 * Merge a consumer-provided args array with defaults while normalizing classes.
 *
 * Ensures 'class' exists and is an array, then merges with default class list.
 *
 * @param array $args      Consumer args.
 * @param array $defaults  Default args (should include 'class' key).
 * @return array           Normalized and merged args.
 */
function get_formatted_args($args = [], $defaults = []) {
	$args['class'] = array_key_exists('class', $args) ? $args['class'] : [];
	$args['class'] = ($args['class'] && !is_array($args['class'])) ? explode(' ', $args['class']) : $args['class'];
	$classes = is_array($args['class']) ? array_merge($defaults['class'], $args['class']) : $defaults['class'];
	$formatted_args = wp_parse_args($args, $defaults);
	$formatted_args['class'] = $classes;
	return $formatted_args;
}

/**
 * Compute a list of CSS classes from a Gutenberg block's attributes.
 *
 * @param array $block Raw Gutenberg block array containing className/backgroundColor/textColor, etc.
 * @return string[]    List of classes.
 */
function get_block_classes($block) {
	$out = [];
	if (!empty($block['className'])) $out[] = $block['className'];
	if (!empty($block['backgroundColor'])) {
		$out[] = 'has-background';
		$out[] = 'has-' . $block['backgroundColor'] . '-background-color';
	}
	if (!empty($block['textColor'])) {
		$out[] = 'has-text-color';
		$out[] = 'has-' . $block['textColor'] . '-color';
	}
	return $out;
}

/**
 * Fetch multiple ACF fields for a given post or block ID.
 *
 * @param string[]   $fields   List of field names to retrieve.
 * @param int|string $block_id Optional post or block ID context. Defaults to current post ID.
 * @return array|null          Map of field => value, or null if ACF not available.
 */
function get_acf_fields($fields = [], $block_id = false) {
	if (!function_exists('get_field')) return null;
	$block_id = $block_id ? $block_id : get_the_ID();
	$return_fields = [];
	foreach ($fields as $field) {
		$return_fields[$field] = get_field($field, $block_id);
	}
	return $return_fields;
}

/**
 * Create a URL/key-safe slug from arbitrary input.
 *
 * Lowercases, replaces separators with underscores, strips invalid chars, and collapses repeats.
 *
 * @param string $s Input string (e.g., block name).
 * @return string   Safe slug, never empty (falls back to 'block').
 */
function ensuria_make_key_slug($s) {
	$s = strtolower((string)$s);
	$s = str_replace(['/', '-'], '_', $s);
	$s = preg_replace('~[^a-z0-9_]+~', '_', $s);
	$s = preg_replace('~_+~', '_', $s);
	$s = trim($s, '_');
	return $s !== '' ? $s : 'block';
}

/**
 * Normalize a variety of "truthy" representations to boolean true.
 *
 * Accepts native booleans, integers, and strings that commonly mean "enabled".
 * Supported truthy values:
 * - true
 * - 1 (int)
 * - '1'
 * - 'true', 'on', 'yes' (case-insensitive, surrounding whitespace ignored)
 *
 * @param mixed $v Input value to test.
 * @return bool Returns true if $v is a recognized truthy value; false otherwise.
 */
function ensuria_truthy_flag($v): bool {
	if ($v === true || $v === 1 || $v === '1') return true;
	if (is_string($v)) {
		$lv = strtolower(trim($v));
		if ($lv === 'true' || $lv === 'on' || $lv === 'yes') return true;
	}
	return false;
}

/**
 * Find the first occurrence of a given key in a nested array structure.
 *
 * Ignores meta/private keys that start with '_' at each level.
 *
 * @param array  $data Nested associative array to traverse.
 * @param string $key  Target key to find.
 * @return mixed|null  Found value or null if not present.
 */
function ensuria_array_get_first_key_recursive(array $data, string $key) {
	if (array_key_exists($key, $data)) return $data[$key];
	foreach ($data as $k => $v) {
		if (!is_string($k) || $k === '' || $k[0] === '_') continue;
		if (is_array($v)) {
			$found = ensuria_array_get_first_key_recursive($v, $key);
			if ($found !== null) return $found;
		}
	}
	return null;
}

/**
 * Resolve ACF field type from an ACF field key (e.g., "field_XXXX").
 *
 * @param string $field_key ACF field key.
 * @return string|null      Field type (e.g., 'repeater', 'group', 'gallery') or null if undetermined.
 */
function ensuria_get_acf_field_type_by_key($field_key): ?string {
	if (!function_exists('acf_get_field')) return null;
	if (!is_string($field_key) || $field_key === '') return null;
	$f = acf_get_field($field_key);
	return is_array($f) && isset($f['type']) ? (string)$f['type'] : null;
}

/**
 * Detect base names for repeaters when ACF stores them in flat form.
 *
 * Scans keys like "myrep_0_subfield" and returns a map base => row_count.
 *
 * @param array $root Flat or mixed array (e.g., attrs.data).
 * @return array      Map of base_name => number_of_rows.
 */
function ensuria_detect_flat_repeater_bases(array $root): array {
	$map = [];
	foreach ($root as $k => $v) {
		if (!is_string($k)) continue;
		if (preg_match('/^(.+?)_(\d+)_/i', $k, $m)) {
			$base = $m[1];
			$idx  = (int)$m[2];
			$cur  = isset($map[$base]) ? (int)$map[$base] : 0;
			if ($idx + 1 > $cur) $map[$base] = $idx + 1;
		}
	}
	return $map;
}

/**
 * Traverse a Gutenberg block's ACF data array and collect item counts for
 * Repeater / Relationship / Gallery fields.
 *
 * Strategy:
 * - Skips meta/technical keys (those starting with "_").
 * - Resolves ACF field types via sibling "_<name>" keys (ACF field key) using ensuria_get_acf_field_type_by_key().
 * - Counts:
 *   • repeater: number of rows (supports both structured arrays and ACF's flat storage).
 *   • relationship: number of related posts/objects.
 *   • gallery: number of images.
 * - Recurses into nested arrays and into repeater rows ("path/0/...").
 * - Supports ACF "flat repeater" storage using a precomputed base => count map.
 *
 * Path format:
 * - Slash-delimited from $prefix to the current field (e.g., "group/repeater", "group/repeater/0/subfield").
 *
 * @param array      $data     Current subtree of attrs.data.
 * @param string     $prefix   Logical path prefix for keys in the result map.
 * @param array|null $root     Root attrs.data for flat detection. Defaults to $data.
 * @param array|null $flatMap  Optional precomputed base => count map; if null, computed from $root.
 * @return array               Map of "path" => int counts (may include nested row paths).
 */
function ensuria_collect_counts_for_block_data(array $data, string $prefix = '', ?array $root = null, ?array $flatMap = null): array {
	if ($root === null) $root = $data;
	if ($flatMap === null) $flatMap = ensuria_detect_flat_repeater_bases($root);

	$out = [];

	foreach ($data as $k => $v) {
		if (!is_string($k) || $k === '' || $k[0] === '_') continue;
		$path = $prefix === '' ? $k : $prefix . '/' . $k;

		$type = null;
		$key_hint = '_' . $k;
		if (array_key_exists($key_hint, $data) && is_string($data[$key_hint])) {
			$type = ensuria_get_acf_field_type_by_key($data[$key_hint]);
		}

		if ($type === 'repeater') {
			if (is_array($v)) {
				$out[$path] = count($v);
				$idx = 0;
				foreach ($v as $row) {
					if (is_array($row)) {
						$sub = ensuria_collect_counts_for_block_data($row, $path . '/' . $idx, $root, $flatMap);
						if (!empty($sub)) $out = $out + $sub;
					}
					$idx++;
				}
			} else {
				$c = isset($flatMap[$k]) ? (int)$flatMap[$k] : 0;
				$out[$path] = $c;
			}
			continue;
		}

		if (isset($flatMap[$k]) && (!isset($out[$path]) || $out[$path] < (int)$flatMap[$k])) {
			$out[$path] = (int)$flatMap[$k];
		}

		if (in_array($type, ['relationship', 'gallery'], true)) {
			if (is_array($v)) $out[$path] = count($v);
		}

		if (is_array($v)) {
			$sub = ensuria_collect_counts_for_block_data($v, $path, $root, $flatMap);
			if (!empty($sub)) $out = $out + $sub;
		}
	}

	return $out;
}

/**
 * Generate a runtime-unique key for a block instance within a single render pass.
 *
 * Uses a static counter per sanitized block name, optionally honoring a pre-set __ensuria_id in attrs.
 *
 * @param array    $block           Gutenberg block array.
 * @param int|null $fallback_index  Optional index to use if needed (not used if __ensuria_id present).
 * @return string                   Key like "ensuria_clinics_1".
 */
function ensuria_block_runtime_key(array $block, $fallback_index = null) {
	if (!empty($block['attrs']['__ensuria_id'])) return (string)$block['attrs']['__ensuria_id'];
	$raw  = $block['blockName'] ?? ($block['name'] ?? 'block');
	$name = ensuria_make_key_slug($raw);
	static $counters = [];
	$counters[$name] = isset($counters[$name]) ? $counters[$name] + 1 : 1;
	return "{$name}_{$counters[$name]}";
}

/**
 * Walk a parsed Gutenberg block tree and collect items with "button_navigation" enabled.
 *
 * For each matched block:
 * - Produces a stable per-name unique "block_id" => "<sanitized-name>_<ordinal>".
 * - Optionally computes "count_list" if "count_nav" is truthy by summing counts of nested
 *   repeater/relationship/gallery fields found in attrs.data.
 * Traverses nested innerBlocks and resolves reusable blocks (core/block) by loading referenced content.
 *
 * @param array  $blocks        Parsed blocks from parse_blocks().
 * @param array  $nameCounters  Reference map name => counter to ensure unique block_id per name.
 * @param string $path_prefix   Internal traversal path (for recursion/debug). Pass '' at root.
 * @return array                Flat array of collected items (each with block_id, flags, and optional count_list).
 */
function ensuria_collect_gb_items_seq(array $blocks, array &$nameCounters, string $path_prefix = ''): array {
	$out = [];
	$i = 0;

	foreach ($blocks as $b) {
		$path = $path_prefix === '' ? (string)$i : $path_prefix . '/' . (string)$i;

		$rawName = $b['blockName'] ?? 'block';
		$name    = ensuria_make_key_slug($rawName);
		$nameCounters[$name] = isset($nameCounters[$name]) ? $nameCounters[$name] + 1 : 1;
		$id = "{$name}_{$nameCounters[$name]}";

		$data = [];
		if (!empty($b['attrs']) && is_array($b['attrs']) && !empty($b['attrs']['data']) && is_array($b['attrs']['data'])) {
			$data = $b['attrs']['data'];
		}

		$button    = !empty($data) ? (array_key_exists('button_navigation', $data) ? $data['button_navigation'] : ensuria_array_get_first_key_recursive($data, 'button_navigation')) : null;
		$text      = !empty($data) ? (array_key_exists('text_nav_button', $data) ? $data['text_nav_button'] : ensuria_array_get_first_key_recursive($data, 'text_nav_button')) : null;
		$countFlag = !empty($data) ? (array_key_exists('count_nav', $data) ? $data['count_nav'] : ensuria_array_get_first_key_recursive($data, 'count_nav')) : null;

		if ($button !== null && ensuria_truthy_flag($button)) {
			$item = [
				'block_id'          => $id,
				'button_navigation' => $button,
				'text_nav_button'   => $text,
				'count_nav'         => $countFlag,
			];

			if ($countFlag !== null && ensuria_truthy_flag($countFlag)) {
				$details = !empty($data) ? ensuria_collect_counts_for_block_data($data, '', $data) : [];
				$total = 0;
				if (!empty($details)) {
					foreach ($details as $v) { if (is_numeric($v)) $total += (int)$v; }
				}
				$item['count_list'] = $total;
			}

			$out[] = $item;
		}

		$inner = [];
		if (!empty($b['innerBlocks']) && is_array($b['innerBlocks'])) {
			$inner = $b['innerBlocks'];
		} elseif (!empty($b['blockName']) && $b['blockName'] === 'core/block') {
			$attrs = isset($b['attrs']) && is_array($b['attrs']) ? $b['attrs'] : [];
			$ref = isset($attrs['ref']) ? (int)$attrs['ref'] : 0;
			if ($ref > 0) {
				$p = get_post($ref);
				if ($p && !is_wp_error($p)) {
					$inner = parse_blocks((string)$p->post_content);
					if (!is_array($inner)) $inner = [];
				}
			}
		}

		if (!empty($inner)) {
			$nested = ensuria_collect_gb_items_seq($inner, $nameCounters, $path);
			if (!empty($nested)) {
				foreach ($nested as $n) $out[] = $n;
			}
		}

		$i++;
	}
	return $out;
}

/**
 * Sort a list of ACF field objects by ACF's admin "menu_order".
 *
 * @param array $fields Array of ACF field objects.
 * @return array        Sorted field objects.
 */
function ensuria__acf_sort_by_menu_order(array $fields): array {
	$list = array_values($fields);
	usort($list, function($a, $b) {
		$ao = isset($a['menu_order']) ? (int)$a['menu_order'] : 9999;
		$bo = isset($b['menu_order']) ? (int)$b['menu_order'] : 9999;
		if ($ao === $bo) return 0;
		return ($ao < $bo) ? -1 : 1;
	});
	return $list;
}

/**
 * Sort ACF field groups by their admin "menu_order".
 *
 * @param array $groups List of ACF field group arrays.
 * @return array        Sorted field groups.
 */
function ensuria__acf_sort_groups_by_menu_order(array $groups): array {
	$list = array_values($groups);
	usort($list, function($a, $b) {
		$ao = isset($a['menu_order']) ? (int)$a['menu_order'] : 9999;
		$bo = isset($b['menu_order']) ? (int)$b['menu_order'] : 9999;
		if ($ao === $bo) return 0;
		return ($ao < $bo) ? -1 : 1;
	});
	return $list;
}

/**
 * Resolve the effective sub_fields of a Clone field.
 *
 * If sub_fields are already expanded, returns them; otherwise resolves from "clone" sources
 * and returns a menu_order-sorted list.
 *
 * @param array $field Clone field object.
 * @return array       List of sub field objects (possibly empty).
 */
function ensuria__acf_clone_sub_fields(array $field): array {
	if (!empty($field['sub_fields']) && is_array($field['sub_fields'])) {
		return ensuria__acf_sort_by_menu_order($field['sub_fields']);
	}
	$subs = [];
	if (function_exists('acf_get_field') && !empty($field['clone']) && is_array($field['clone'])) {
		foreach ($field['clone'] as $sel) {
			$obj = acf_get_field($sel);
			if ($obj && is_array($obj)) $subs[] = $obj;
		}
	}
	return !empty($subs) ? ensuria__acf_sort_by_menu_order($subs) : [];
}

/**
 * Walk ACF field objects and extract navigation-related flags into $found.
 *
 * Searches across nested structures and collects the first encountered values for:
 * - button_navigation
 * - text_nav_button
 * - count_nav
 *
 * @param array       $field_objs Array of ACF field objects (name, type, sub_fields, etc.).
 * @param array|mixed $values     Parallel values tree mapped by field "name".
 * @param string      $prefix     Debug path (e.g., "group/repeater/0"); does not affect result keys.
 * @param array       $found      Accumulator passed by reference; filled with discovered flags.
 * @return void
 */
function ensuria__acf_find_values(array $field_objs, $values, string $prefix, array &$found): void {
	foreach ($field_objs as $field) {
		$name = isset($field['name']) ? (string)$field['name'] : '';
		if ($name === '') continue;

		$val_exists = is_array($values) && array_key_exists($name, $values);
		$val = $val_exists ? $values[$name] : (isset($field['value']) ? $field['value'] : null);

		if (!array_key_exists('button_navigation', $found) && $name === 'button_navigation') $found['button_navigation'] = $val;
		if (!array_key_exists('text_nav_button', $found) && $name === 'text_nav_button') $found['text_nav_button'] = $val;
		if (!array_key_exists('count_nav', $found) && $name === 'count_nav') $found['count_nav'] = $val;

		$type = isset($field['type']) ? (string)$field['type'] : '';

		if ($type === 'group') {
			$subs = isset($field['sub_fields']) && is_array($field['sub_fields']) ? ensuria__acf_sort_by_menu_order($field['sub_fields']) : [];
			$subv = is_array($val) ? $val : [];
			if (!empty($subs)) ensuria__acf_find_values($subs, $subv, $prefix === '' ? $name : $prefix . '/' . $name, $found);

		} elseif ($type === 'repeater') {
			$subs = isset($field['sub_fields']) && is_array($field['sub_fields']) ? ensuria__acf_sort_by_menu_order($field['sub_fields']) : [];
			$rows = is_array($val) ? $val : [];
			$idx = 0;
			foreach ($rows as $row) {
				$rowv = is_array($row) ? $row : [];
				if (!empty($subs)) ensuria__acf_find_values($subs, $rowv, ($prefix === '' ? $name : $prefix . '/' . $name) . '/' . $idx, $found);
				$idx++;
			}

		} elseif ($type === 'flexible_content') {
			$layouts = isset($field['layouts']) && is_array($field['layouts']) ? $field['layouts'] : [];
			$rows = is_array($val) ? $val : [];
			$idx = 0;
			foreach ($rows as $row) {
				$layout_name = is_array($row) && isset($row['acf_fc_layout']) ? (string)$row['acf_fc_layout'] : '';
				$layout = null;
				if ($layout_name !== '') {
					foreach ($layouts as $l) {
						if (isset($l['name']) && (string)$l['name'] === $layout_name) { $layout = $l; break; }
					}
				}
				$subs = ($layout && isset($layout['sub_fields']) && is_array($layout['sub_fields'])) ? ensuria__acf_sort_by_menu_order($layout['sub_fields']) : [];
				$rowv = is_array($row) ? $row : [];
				if (!empty($subs)) ensuria__acf_find_values($subs, $rowv, ($prefix === '' ? $name : $prefix . '/' . $name) . '/' . $idx . ($layout_name !== '' ? ':' . $layout_name : ''), $found);
				$idx++;
			}

		} elseif ($type === 'clone') {
			$subs = ensuria__acf_clone_sub_fields($field);
			$subv = is_array($val) ? $val : [];
			if (!empty($subs)) ensuria__acf_find_values($subs, $subv, $prefix === '' ? $name : $prefix . '/' . $name, $found);

		} else {
			if (!empty($field['sub_fields']) && is_array($field['sub_fields'])) {
				$subs = ensuria__acf_sort_by_menu_order($field['sub_fields']);
				$subv = is_array($val) ? $val : [];
				ensuria__acf_find_values($subs, $subv, $prefix === '' ? $name : $prefix . '/' . $name, $found);
			}
		}
	}
}

/**
 * Collect counts for repeater/relationship/gallery fields across ACF field objects.
 *
 * Recursively traverses groups, repeater rows, flexible content layouts, and clones.
 * Populates $counts with "path" => int entries.
 *
 * @param array       $field_objs List of ACF field objects.
 * @param array|mixed $values     Parallel values tree mapped by field "name".
 * @param string      $prefix     Logical path prefix (e.g., "group", "group/repeater/0").
 * @param array       $counts     Accumulator passed by reference; filled with counts.
 * @return void
 */
function ensuria__acf_collect_counts_from_objects(array $field_objs, $values, string $prefix, array &$counts): void {
	foreach ($field_objs as $field) {
		$name = isset($field['name']) ? (string)$field['name'] : '';
		if ($name === '') continue;

		$type = isset($field['type']) ? (string)$field['type'] : '';
		$val_exists = is_array($values) && array_key_exists($name, $values);
		$val = $val_exists ? $values[$name] : (isset($field['value']) ? $field['value'] : null);
		$path = $prefix === '' ? $name : $prefix . '/' . $name;

		if (in_array($type, ['repeater', 'relationship', 'gallery'], true) && is_array($val)) {
			$counts[$path] = count($val);
		}

		if ($type === 'group') {
			$subs = isset($field['sub_fields']) && is_array($field['sub_fields']) ? ensuria__acf_sort_by_menu_order($field['sub_fields']) : [];
			$subv = is_array($val) ? $val : [];
			if (!empty($subs)) ensuria__acf_collect_counts_from_objects($subs, $subv, $path, $counts);

		} elseif ($type === 'repeater') {
			$subs = isset($field['sub_fields']) && is_array($field['sub_fields']) ? ensuria__acf_sort_by_menu_order($field['sub_fields']) : [];
			$rows = is_array($val) ? $val : [];
			$idx = 0;
			foreach ($rows as $row) {
				$rowv = is_array($row) ? $row : [];
				if (!empty($subs)) ensuria__acf_collect_counts_from_objects($subs, $rowv, $path . '/' . $idx, $counts);
				$idx++;
			}

		} elseif ($type === 'flexible_content') {
			$layouts = isset($field['layouts']) && is_array($field['layouts']) ? $field['layouts'] : [];
			$rows = is_array($val) ? $val : [];
			$idx = 0;
			foreach ($rows as $row) {
				$layout_name = is_array($row) && isset($row['acf_fc_layout']) ? (string)$row['acf_fc_layout'] : '';
				$layout = null;
				if ($layout_name !== '') {
					foreach ($layouts as $l) {
						if (isset($l['name']) && (string)$l['name'] === $layout_name) { $layout = $l; break; }
					}
				}
				$subs = ($layout && isset($layout['sub_fields']) && is_array($layout['sub_fields'])) ? ensuria__acf_sort_by_menu_order($layout['sub_fields']) : [];
				$rowv = is_array($row) ? $row : [];
				if (!empty($subs)) ensuria__acf_collect_counts_from_objects($subs, $rowv, $path . '/' . $idx . ($layout_name !== '' ? ':' . $layout_name : ''), $counts);
				$idx++;
			}

		} elseif ($type === 'clone') {
			$subs = ensuria__acf_clone_sub_fields($field);
			$subv = is_array($val) ? $val : [];
			if (!empty($subs)) ensuria__acf_collect_counts_from_objects($subs, $subv, $path, $counts);

		} else {
			if (!empty($field['sub_fields']) && is_array($field['sub_fields'])) {
				$subs = ensuria__acf_sort_by_menu_order($field['sub_fields']);
				$subv = is_array($val) ? $val : [];
				ensuria__acf_collect_counts_from_objects($subs, $subv, $path, $counts);
			}
		}
	}
}

/**
 * Scan ACF groups (when a post has no Gutenberg blocks) and collect navigation items.
 *
 * Returns items in admin order. Each item has:
 * - index (sequential admin index),
 * - button_navigation,
 * - text_nav_button,
 * - count_nav,
 * - optional count_list (sum across repeaters/relationship/gallery when count_nav is truthy).
 *
 * @param int $post_id Post ID to inspect.
 * @return array       Array of collected items.
 */
function ensuria_get_acf_groups_with_button_navigation($post_id): array {
	$out = [];
	$values = function_exists('get_fields') ? get_fields($post_id) : [];

	if (function_exists('acf_get_field_groups') && function_exists('acf_get_fields')) {
		$groups = acf_get_field_groups(['post_id' => $post_id]);
		if (is_array($groups) && !empty($groups)) {
			$groups = ensuria__acf_sort_groups_by_menu_order($groups);
			$idx = 0;
			foreach ($groups as $grp) {
				$fields = acf_get_fields($grp);
				if (!is_array($fields) || empty($fields)) { $idx++; continue; }
				$fields = ensuria__acf_sort_by_menu_order($fields);

				foreach ($fields as $rootField) {
					$rootName = isset($rootField['name']) ? (string)$rootField['name'] : '';
					if ($rootName === '') { $idx++; continue; }

					$rootValues = [];
					if (is_array($values) && array_key_exists($rootName, $values)) {
						$rootValues = $values[$rootName];
					} elseif (isset($rootField['value'])) {
						$rootValues = $rootField['value'];
					}

					$found = [];
					ensuria__acf_find_values([$rootField], [$rootName => $rootValues], '', $found);

					$btn = array_key_exists('button_navigation', $found) ? $found['button_navigation'] : null;
					if ($btn !== null && ensuria_truthy_flag($btn)) {
						$text = array_key_exists('text_nav_button', $found) ? $found['text_nav_button'] : null;
						$countFlag = array_key_exists('count_nav', $found) ? $found['count_nav'] : null;

						$item = [
							'index'             => $idx,
							'button_navigation' => $btn,
							'text_nav_button'   => $text,
							'count_nav'         => $countFlag,
						];

						if ($countFlag !== null && ensuria_truthy_flag($countFlag)) {
							$details = [];
							ensuria__acf_collect_counts_from_objects([$rootField], [$rootName => $rootValues], '', $details);
							$total = 0;
							if (!empty($details)) {
								foreach ($details as $v) { if (is_numeric($v)) $total += (int)$v; }
							}
							$item['count_list'] = $total;
						}

						$out[] = $item;
					}

					$idx++;
				}
			}
			return $out;
		}
	}

	if (function_exists('get_field_objects')) {
		$field_objs = get_field_objects($post_id);
		if (is_array($field_objs) && !empty($field_objs)) {
			$field_objs = ensuria__acf_sort_by_menu_order($field_objs);
			$idx = 0;
			foreach ($field_objs as $rootName => $rootField) {
				if (!is_array($rootField)) { $idx++; continue; }

				$rootValues = [];
				if (is_array($values) && array_key_exists($rootName, $values)) {
					$rootValues = $values[$rootName];
				} elseif (isset($rootField['value'])) {
					$rootValues = $rootField['value'];
				}

				$found = [];
				ensuria__acf_find_values([$rootField], [$rootName => $rootValues], '', $found);

				$btn = array_key_exists('button_navigation', $found) ? $found['button_navigation'] : null;
				if ($btn !== null && ensuria_truthy_flag($btn)) {
					$text = array_key_exists('text_nav_button', $found) ? $found['text_nav_button'] : null;
					$countFlag = array_key_exists('count_nav', $found) ? $found['count_nav'] : null;

					$item = [
						'index'             => $idx,
						'button_navigation' => $btn,
						'text_nav_button'   => $text,
						'count_nav'         => $countFlag,
					];

					if ($countFlag !== null && ensuria_truthy_flag($countFlag)) {
						$details = [];
						ensuria__acf_collect_counts_from_objects([$rootField], [$rootName => $rootValues], '', $details);
						$total = 0;
						if (!empty($details)) {
							foreach ($details as $v) { if (is_numeric($v)) $total += (int)$v; }
						}
						$item['count_list'] = $total;
					}

					$out[] = $item;
				}

				$idx++;
			}
		}
	}

	return $out;
}

/**
 * Unified getter: collect navigation-enabled items from Gutenberg or ACF-only sources.
 *
 * If the post has blocks:
 * - Parses block tree and returns items where "button_navigation" is truthy.
 * - Each Gutenberg item includes a unique "block_id".
 *
 * Otherwise:
 * - Scans top-level ACF groups/fields and returns items in admin order with a numeric "index".
 *
 * @param int|\WP_Post $post_id Post ID or WP_Post instance.
 * @return array                List of collected items. Empty array if none.
 */
function ensuria_get_blocks_with_button_navigation($post_id): array {
	$post = get_post($post_id);
	if (empty($post) || is_wp_error($post)) return [];

	if (has_blocks($post)) {
		$blocks = parse_blocks((string)$post->post_content);
		if (!empty($blocks)) {
			$counters = [];
			return ensuria_collect_gb_items_seq($blocks, $counters, '');
		}
		return [];
	}

	return ensuria_get_acf_groups_with_button_navigation($post_id);
}

/**
 * Build a deterministic "section key" for non-Gutenberg (ACF-only) sections.
 *
 * Format: "<sanitized_root_name>_<index>"
 *
 * @param string $root_name Root ACF group/field name.
 * @param int    $index     Sequential admin index.
 * @return string           Section key suitable for data-content or anchors.
 */
function ensuria_section_key($root_name, $index) {
	return ensuria_make_key_slug($root_name) . '_' . (int)$index;
}

/**
 * Build a navigation key for either Gutenberg blocks or ACF-only sections.
 *
 * For Gutenberg, prefers a runtime key based on block name and ordinal.
 * For ACF-only, uses ensuria_section_key(root_name, index).
 *
 * @param array|null  $block     Gutenberg block array, if available.
 * @param string|null $root_name Root ACF group/field name for ACF-only pages.
 * @param int|null    $index     Admin index for ACF-only pages.
 * @return string                Navigation key or empty string if insufficient input.
 */
function ensuria_nav_key($block = null, $root_name = null, $index = null) {
	if (is_array($block)) return ensuria_block_runtime_key($block, $index);
	if ($root_name !== null && $index !== null) return ensuria_section_key($root_name, $index);
	return '';
}

/**
 * Recursively finds the first Gutenberg block by its blockName.
 *
 * @param array  $blocks     Parsed blocks array from parse_blocks().
 * @param string $block_name Target blockName (e.g. 'acf/reviews').
 * @return array|null        The found block array or null if not found.
 */
function ensuria_find_first_block_by_name(array $blocks, string $block_name): ?array
{
    foreach ($blocks as $block) {
        if (!empty($block['blockName']) && $block['blockName'] === $block_name) {
            return $block;
        }

        if (!empty($block['innerBlocks']) && is_array($block['innerBlocks'])) {
            $found = ensuria_find_first_block_by_name($block['innerBlocks'], $block_name);
            if (!empty($found)) {
                return $found;
            }
        }
    }

    return null;
}

/**
 * Normalizes ACF relationship values into a flat array of post IDs.
 *
 * Supports:
 * - array of IDs
 * - comma-separated string of IDs
 * - array of WP_Post objects
 * - array of arrays containing ['ID' => ...]
 *
 * @param mixed $value Relationship field raw value.
 * @return int[]       Unique list of post IDs.
 */
function ensuria_normalize_relationship_to_ids($value): array
{
    if (empty($value)) {
        return [];
    }

    if (is_string($value)) {
        $value = array_filter(array_map('trim', explode(',', $value)));
    }

    if (!is_array($value)) {
        return [];
    }

    $ids = [];

    foreach ($value as $item) {
        if (is_numeric($item)) {
            $ids[] = (int) $item;
            continue;
        }

        if ($item instanceof WP_Post && !empty($item->ID)) {
            $ids[] = (int) $item->ID;
            continue;
        }

        if (is_array($item) && !empty($item['ID'])) {
            $ids[] = (int) $item['ID'];
            continue;
        }

        if (is_object($item) && !empty($item->ID)) {
            $ids[] = (int) $item->ID;
            continue;
        }
    }

    $ids = array_values(array_unique(array_filter($ids)));

    return $ids;
}

/**
 * Extracts relationship post IDs from an ACF Group field inside a specific Gutenberg block.
 *
 * Notes:
 * - For ACF blocks, field values are usually stored in $block['attrs']['data'].
 * - Group subfields are commonly flattened as "groupName_subFieldName".
 *
 * @param int    $post_id            Post ID that contains the block in post_content.
 * @param string $reviews_block_name Target Gutenberg blockName (e.g. 'acf/reviews').
 * @param string $group_name         ACF Group field name (field "name").
 * @param string $relationship_name  ACF Relationship field name inside the group (field "name").
 * @return int[]                     Relationship post IDs.
 */
function ensuria_get_reviews_relationship_ids(int $post_id, string $reviews_block_name, string $group_name, string $relationship_name): array
{
    $content = (string) get_post_field('post_content', $post_id);

    if ($content === '') {
        return [];
    }

    $blocks = parse_blocks($content);
    if (empty($blocks) || !is_array($blocks)) {
        return [];
    }

    $reviews_block = ensuria_find_first_block_by_name($blocks, $reviews_block_name);
    if (empty($reviews_block)) {
        return [];
    }

    $data = $reviews_block['attrs']['data'] ?? [];
    if (empty($data) || !is_array($data)) {
        return [];
    }

    $flat_key = $group_name . '_' . $relationship_name;

    $value =
        $data[$flat_key] ??
        $data[$relationship_name] ??
        null;

    if ($value === null && !empty($data[$group_name]) && is_array($data[$group_name])) {
        $value = $data[$group_name][$relationship_name] ?? null;
    }

    return ensuria_normalize_relationship_to_ids($value);
}
