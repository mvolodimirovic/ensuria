<?php

$item_title = $args['title'] ?? '';
$item_link = $args['item_link'] ?? '';
$icon_id = $args['icon_id'] ?? '';
$item_subtitle = $args['item_subtitle'] ?? '';
$item_description = $args['item_description'] ?? '';
$item_class = $args['item_class'] ?? '';
$not_service = $args['not_service'] ?? false;

?>

<article class="services__item <?php echo !empty($item_class) ? esc_attr($item_class) : ''; ?>">
  <?php if(!$not_service):?>
    <a href="<?php echo esc_url($item_link); ?>" class="item-link" aria-label="<?php echo esc_attr($item_title); ?>"></a>
  <?php endif; ?>
  <div class="services__item__icons">
    <?php if ( !empty($icon_id) ) : ?>
      <span class="icon-wrapper">
        <?php echo render_optimized_image($icon_id, 'thumbnail'); ?>
      </span>
    <?php endif;
    if(!$not_service):
      echo get_icon('icon-arrow-right', 'presentation'); 
    endif; ?>
  </div>
  <div class="services__item__content">
    <?php if(!$not_service): ?>
      <h4><?php echo esc_html($item_title); ?></h4>
    <?php else :?>
      <span><?php echo wp_kses($item_title,['br'=>[]]); ?></span>
    <?php endif;
    if ( !empty($item_subtitle) || !empty($item_description) ) : ?>
      <span><?php echo esc_html($item_subtitle); echo esc_html($item_description)?></span>
    <?php endif; ?>
  </div>
</article>