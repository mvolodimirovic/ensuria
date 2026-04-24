<?php
$post_id = !empty($args['post_id']) ? $args['post_id'] : '';
$subtitle = get_field('subtitle', $post_id );
$privacy = is_page_template( 'template-privacy.php' );
$type = !empty($args['type']) ? $args['type'] : 'blog';
  ?>
  <div class="blog-header__info">
    <h1 class="blog-header-title"><?php echo esc_html(get_the_title($post_id))?></h1>
    <?php if(!empty($subtitle)): ?>
      <p><?php echo esc_html($subtitle)?></p>
    <?php endif;
    if(!$privacy):?>
      <time datetime="<?php echo esc_attr(get_the_date('Y-m-d'))?>"><?php echo esc_html(get_the_date('d F Y'))?></time>
    <?php endif;
    if($type === 'specialoffers'): 
      $group = get_field('button_group',$post_id);
      $text_button = $group['text_button'] ?? '';
      if (!empty($text_button)): ?>
        <button class="btn btn--icon btn--blue-sky open-modal" data-modal-slug="contact" aria-label="<?php echo esc_attr__('Відкрити модальне вікно','ensuria'); ?>">
          <?php echo esc_html($text_button); ?>
          <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
        </button>
    <?php endif;
    endif;
    if(has_post_thumbnail()): ?>
      <figure class="blog-header-image">
          <?php echo render_optimized_image(get_post_thumbnail_id(), 'single-image', '', true); ?>
      </figure>
    <?php endif; ?>
  </div>