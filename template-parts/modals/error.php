<?php
$phone = get_field('phone_number','options') ?? '';
$error_title = get_field('error_title','options');
$error_subtitle = get_field('error_subtitle','options');
?>
<div class="respond-wrapper">
  <button type="button" class="modal__close" aria-label="<?php echo esc_attr__('Закрити модальне вікно','ensuria'); ?>"> 
    <?php echo get_icon('icon-close','presentation'); ?>
  </button>
  <?php echo get_icon('error'); ?>
  <?php if(!empty($error_title)):?>
    <h2><?php echo esc_html($error_title);?></h2>
  <?php endif; ?>
  <p>
    <?php 
    if(!empty($error_subtitle)):
      echo esc_html($error_subtitle);
    endif;
    ?>
    <a href="tel:<?php echo esc_attr(preg_replace('/\D/', '', $phone)); ?>" aria-label="<?php echo esc_attr__('Номер телефону','ensuria'); ?>">
      <?php echo esc_html($phone)?>
    </a>
  </p>
  <?php if(!is_front_page()):?>
    <a href="<?php echo esc_url(home_url('/'))?>" class="btn btn--dark btn--middle error-home" aria-label="<?php echo esc_attr__('Головна сторінка','ensuria'); ?>">
      <?php _e('На головну','ensuria'); ?>
    </a>
  <?php endif;?>
</div> 