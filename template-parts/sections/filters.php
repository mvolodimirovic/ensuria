<?php
$taxonomies = $args['taxonomies'];
$multiple = $args['multiple'];
$post_type = $args['post-type'];
?>

<section id="filters" class="filters" 
  data-post-type="<?php echo esc_attr($post_type)?>" 
  data-url="<?php echo esc_attr(get_post_type_archive_link($post_type)) ?>"
  data-ajaxurl="<?php echo esc_url( admin_url('admin-ajax.php') ); ?>">

    <div class="wrapper filters__wrapper <?php echo !empty($_GET) ? 'open' : '';?>">
        <?php
        if(!empty($taxonomies)):
          foreach($taxonomies as $item):
            $taxonomy = get_taxonomy($item);
            $taxonomy_name = $taxonomy->name;
            $terms = get_terms(['taxonomy' => $item, 'hide_empty' => true, 'orderby' => 'term_order'] );
            
          if($terms) : ?>
            <div class="filters-group <?php echo esc_attr($item)?>">
                <button type="button" class="filters-choice <?php echo choice_check($item); ?>" aria-label="<?php echo esc_attr__('Вибрати фільтр','ensuria'); ?>">
                    <div class="filter-choice-icon" data-label="<?php echo esc_attr($item)?>">
                      <?php echo filter_label_icon($item); ?>
                    </div>
                    <span class="filters-choice-title">
                      <?php _e(filter_label_button($item), 'ensuria') ?>
                    </span>
                    <?php echo get_icon('arrow-filter', 'presentation'); ?>
                </button>
                <div class="filters__list" data-name="<?php echo $item; ?>" data-multiple="<?php single_or_multiples($multiple) ?>">
                  <div class="filters__list-inner">
                    <ul data-name="<?php echo $item; ?>" id="<?php echo $item; ?>" class="filters__list-wrap">
                        <li class="filters__list__item select-all <?php echo filter_check($item , 'all'); ?> <?php single_or_multiples($multiple) ?>" data-value="<?php echo esc_attr('select-all') ?>">
                            <span>
                              <?php 
                                echo get_icon('icon-'.$item, 'presentation'); 
                                _e(filter_label($item), 'ensuria'); ?>
                            </span>
                        </li> 
                    <?php                                    
                        foreach($terms as $term) :
                          if($term->parent === 0) : ?>
                              <li class="filters__list__item <?php single_or_multiples($multiple) ?> <?php echo filter_check($item , $term->slug); ?>" data-value="<?php echo esc_attr($term->slug) ?>">
                                <span>
                                  <?php if($item == 'specialized'):
                                    $icon_id = get_field('icon', 'specialized_'.$term->term_id); 
                                    if ( !empty($icon_id ) ) :  ?>
                                        <span class="icon-wrapper">
                                          <?php echo '<img width="14" height="14" src="'. esc_url(wp_get_attachment_image_url($icon_id , [14,14],false)).'" class="attachment-14x14 size-14x14" alt="'.esc_attr($term->name).'" decoding="async">'; ?>
                                        </span>
                                      <?php endif;
                                    else :
                                      echo get_icon('icon-'.$item, 'presentation'); 
                                    endif; 
                                    echo esc_html($term->name); ?>
                                </span>
                              </li>
                          <?php endif;
                        endforeach; ?>
                    </ul>
                  </div>
                </div>
            </div>
          <?php endif;
          endforeach;
        endif; ?>
    </div>
</section>