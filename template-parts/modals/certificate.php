<?php
$src = $args["src"];
$alt = $args["alt"];
$width = $args["width"];
$height = $args["height"];
?>
<div class="modal modal--certificate modal--show" role="dialog" aria-modal="true">
  <div class="certificate__wrapper">
    <button type="button" class="modal__close" aria-label="<?php echo esc_attr__('Закрити модальне вікно', 'ensuria'); ?>">
      <?php echo wp_kses_post(get_icon('icon-close', 'presentation')); ?>
    </button>
    <img
      src="<?php echo esc_url($src); ?>"
      alt="<?php echo esc_attr($alt); ?>"
      width="<?php echo esc_attr((string) $width); ?>"
      height="<?php echo esc_attr((string) $height); ?>"
      loading="eager"
      decoding="async"
    >
  </div>
  <div class="modal__bg"></div>
</div>