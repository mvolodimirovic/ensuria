<?php
$success_title = get_field('success_title','options');
$success_subtitle = get_field('success_subtitle','options');
?>

<div class="respond-wrapper">
  <button type="button" class="modal__close" aria-label="<?php echo esc_attr__('Закрити модальне вікно','ensuria'); ?>">
    <?php echo get_icon('icon-close','presentation'); ?>
  </button>
  <?php echo get_icon('success')?>
  <?php if(!empty($success_title)): ?>
    <h2><?php echo esc_html($success_title);?></h2>
  <?php endif; ?>
  <p>
    <?php if(!empty($success_subtitle)): echo esc_html($success_subtitle); endif; ?>
  </p>
  <a href="<?php echo esc_url(home_url('/'))?>" class="btn btn--dark btn--middle success-home" aria-label="<?php echo esc_attr__('Головна сторінка','ensuria'); ?>">
    <?php _e('На головну','ensuria'); ?>
  </a>
</div>