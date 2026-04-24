<?php
if (!defined('ABSPATH')) exit;

$obj = get_queried_object();
$selected_ptype = '';
if (!empty($obj) && !empty($obj->name)) {
  $selected_ptype = $obj->name;
} else {
  $selected_ptype = get_query_var('post_type');
  if (is_array($selected_ptype)) $selected_ptype = reset($selected_ptype);
  if (empty($selected_ptype)) $selected_ptype = get_post_type();
}

$paged_qv = get_query_var('paged');
$page_qv  = get_query_var('page');
$paged = max(1, (int) ($paged_qv ? $paged_qv : ($page_qv ? $page_qv : 1)));

$q    = isset($_GET['q']) ? sanitize_text_field(wp_unslash($_GET['q'])) : '';
$acat = isset($_GET['acat']) ? sanitize_text_field(wp_unslash($_GET['acat'])) : '';
$ppp  = 20;

$tax_name = '';
$taxonomy_list = [];
$taxes = get_object_taxonomies($selected_ptype, 'objects');
if (!empty($taxes) && is_array($taxes)) {
  foreach ($taxes as $tx) {
    if (!empty($tx->hierarchical) && !empty($tx->public)) { $tax_name = $tx->name; break; }
  }
}
if ($tax_name !== '') {
  $taxonomy_list = get_terms([
    'taxonomy'   => $tax_name,
    'parent'     => 0,
    'hide_empty' => false,
    'orderby'    => 'name',
    'order'      => 'ASC',
  ]);
}
$has_tax = ($tax_name !== '' && !is_wp_error($taxonomy_list) && !empty($taxonomy_list));

$args = [
  'post_type'              => $selected_ptype,
  'post_status'            => 'publish',
  'orderby'                => 'date',
  'order'                  => 'ASC',
  'posts_per_page'         => $ppp,
  'paged'                  => $paged,
  'no_found_rows'          => false,
  'update_post_meta_cache' => false,
];
if ($q !== '') $args['s'] = $q;
if ($acat !== '' && $tax_name !== '') {
  $args['tax_query'] = [[
    'taxonomy' => $tax_name,
    'field'    => 'slug',
    'terms'    => $acat,
  ]];
}

$query = new WP_Query($args);

$ptype_obj   = get_post_type_object($selected_ptype);
$ptype_label = (!empty($ptype_obj) && !empty($ptype_obj->labels->name)) ? $ptype_obj->labels->name : ucfirst($selected_ptype);
$root        = get_post_type_archive_link($selected_ptype);
$total_pages = !empty($query) ? max(1, (int) $query->max_num_pages) : 1;

if ($total_pages > 0 && $paged > $total_pages) {
  global $wp_query;
  $wp_query->set_404();
  status_header(404);
  nocache_headers();
  include get_404_template();
  exit;
}
$seo_group = get_field('seo_group','options_' . $selected_ptype);

get_header(); 

get_template_part('/template-parts/sections/page-header',null,['title'=> $obj->label]);
?>
<section class="price section archive-price"
  data-analizy-root
  data-root="<?php echo esc_url($root); ?>"
  data-ppp="<?php echo esc_attr($ppp); ?>"
  data-ptype="<?php echo esc_attr($selected_ptype); ?>"
  data-taxonomy="<?php echo esc_attr($tax_name); ?>"
  data-has-tax="<?php echo $has_tax ? '1' : '0'; ?>"
  data-ptype-label="<?php echo esc_attr($ptype_label); ?>">
  <div class="wrapper price__wrapper-block">
    <aside class="price__aside">
      <form action="<?php echo esc_url($root); ?>" method="get" id="price__form" class="aside__form" data-analizy-search>
        <?php echo get_icon('icon-search', 'presentation'); ?>
        <input type="search"
               name="q"
               id="aside__form-search"
               class="aside__form-input<?php echo !$has_tax ? ' is-full' : ''; ?>"
               placeholder="<?php echo esc_attr__('Почніть вводити для пошуку','ensuria'); ?>"
               aria-label="<?php echo esc_attr__('Пошук','ensuria'); ?>"
               value="<?php echo esc_attr($q); ?>">
        <?php if ($acat !== ''): ?>
          <input type="hidden" name="acat" value="<?php echo esc_attr($acat); ?>">
        <?php endif; ?>
      </form>

      <div class="aside__filter" data-analizy-filters>
        <button type="button" class="aside__filter-mobile btn" aria-expanded="false">
          <?php
            $btn_title = $has_tax ? $ptype_label : $ptype_label;
            echo esc_html__('Показати всі ', 'ensuria') . esc_html($btn_title);
          ?>
        </button>

        <div class="aside__filter-flex">
          <div class="aside__filter__wrapper">
            <?php $all_label = $has_tax ? __('Усі','ensuria') : $ptype_label; ?>
            <button type="button"
                    class="aside__filter-btn <?php echo $has_tax ? ' aside__filter--ajax' : ''; ?> <?php echo $acat === '' ? 'is-active' : ''; ?>"
                    data-term-slug=""
                    aria-label="<?php echo esc_attr($all_label); ?>"
                    aria-pressed="<?php echo $acat === '' ? 'true' : 'false'; ?>">
              <?php echo esc_html($all_label); ?>
            </button>
          </div>

          <?php if ($has_tax): ?>
            <?php foreach ($taxonomy_list as $parent_term):
              $parent_id = (int) $parent_term->term_id;
              $children = get_terms([
                'taxonomy'   => $tax_name,
                'parent'     => $parent_id,
                'hide_empty' => false,
                'orderby'    => 'name',
                'order'      => 'ASC',
              ]);
              $has_children = !is_wp_error($children) && !empty($children);
              $parent_active = ($acat === $parent_term->slug);
            ?>
              <div class="aside__filter__wrapper<?php echo $has_children ? ' has-children' : ''; ?>">
                <?php if ($has_children): ?>
                  <button type="button"
                          class="aside__filter-btn<?php echo $parent_active ? ' is-active' : ''; ?>"
                          aria-label="<?php echo esc_attr($parent_term->name); ?>"
                          aria-expanded="false">
                    <?php echo esc_html($parent_term->name); echo get_icon('arrow-filter', 'presentation'); ?>
                  </button>
                  <div class="aside__filter__inner">
                    <?php foreach ($children as $term): $is_active = ($acat === $term->slug); ?>
                      <button type="button"
                              class="aside__filter__item aside__filter--ajax<?php echo $is_active ? ' is-active' : ''; ?>"
                              data-term-slug="<?php echo esc_attr($term->slug); ?>"
                              aria-label="<?php echo esc_attr($term->name); ?>"
                              aria-pressed="<?php echo $is_active ? 'true' : 'false'; ?>">
                        <?php echo esc_html($term->name); ?>
                      </button>
                    <?php endforeach; ?>
                  </div>
                <?php else: ?>
                  <button type="button"
                          class="aside__filter-btn aside__filter--ajax<?php echo $parent_active ? ' is-active' : ''; ?>"
                          data-term-slug="<?php echo esc_attr($parent_term->slug); ?>"
                          aria-label="<?php echo esc_attr($parent_term->name); ?>"
                          aria-pressed="<?php echo $parent_active ? 'true' : 'false'; ?>">
                    <?php echo esc_html($parent_term->name); ?>
                  </button>
                <?php endif; ?>
              </div>
            <?php endforeach; ?>
          <?php endif; ?>
        </div>
      </div>
    </aside>

    <div class="price__list">
      <div class="loader-wrapper"><div class="loader"></div></div>

      <h3 class="price__title" data-title="<?php echo esc_attr($ptype_label); ?>"><?php echo esc_html($ptype_label); ?></h3>

      <div class="price__text-inner">
        <div class="price__text-wrapp">
          <div class="price__text__name name"><?php echo esc_html__('Назва','ensuria'); ?></div>
          <div class="price__text__cash cash"><?php echo esc_html__('Ціна','ensuria'); ?></div>
        </div>
        <div data-rows>
          <?php if (!empty($query) && $query->have_posts()) : ?>
            <?php while ($query->have_posts()) : $query->the_post();
              $price_id   = get_the_ID();
              $price_name = get_the_title($price_id);
              $price_cash = get_field('price', $price_id);
            ?>
              <div class="price__text-wrapp">
                <?php if (!empty($price_name)) : ?>
                  <div class="price__text__name"><?php echo esc_html($price_name); ?></div>
                <?php endif; ?>
                <div class="price__text__cash">
                  <?php echo esc_html($price_cash) . ' ' . esc_html__('грн','ensuria'); ?>
                </div>
              </div>
            <?php endwhile; wp_reset_postdata(); ?>
          <?php endif; ?>
        </div>
      </div>

      <?php if (!empty($total_pages) && $total_pages > 1 && $paged < $total_pages) : ?>
        <button type="button" class="btn price__button btn--aqua load-more" data-more aria-label="<?php echo esc_attr__('Завантажити ще','ensuria'); ?>"><?php echo esc_html__('Завантажити ще','ensuria'); ?></button>
      <?php endif; ?>

      <?php if (!empty($total_pages) && $total_pages > 1) : ?>
        <div class="analizy__pagination" data-analizy-pagination>
          <?php echo ensuria_render_single_pagination($root, $paged, $total_pages, $acat, $q); ?>
        </div>
      <?php endif; ?>
    </div>
  </div>
</section>
<?php 
// SEO
if(is_array($seo_group) && array_filter($seo_group)){
  get_template_part('template-parts/sections/seo', null, [
    'seo_group'    => $seo_group, 
  ]);
}
 
get_footer();
