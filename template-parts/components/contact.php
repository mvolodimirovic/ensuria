<?php
  $phone = get_field('phone_number','options') ?? '';
  $email = get_field('email','options') ?? '';
  $sub_email = $args['email'] ?? '';
  $email_enable = $args['email_enable'] ?? '';
  $title_block = $args['title_block'] ?? '';
  $email = !empty($sub_email) ? $sub_email : $email; 
?>
<div class="cta__middle">
  <?php if(!empty($title_block)): ?>
    <b class="cta__middle-title"><?php echo esc_html($title_block); ?></b>
  <?php endif; 
  if(!empty($email) && $email_enable) : ?>
    <a class="cta__email <?php echo !empty($sub_email) ? esc_attr('sub-email'):''?>" href="mailto:<?php echo esc_attr($email); ?>" aria-label="<?php echo esc_attr__('Email адреса','ensuria'); ?>"> 
      <?php echo esc_html($email); ?>
    </a>
  <?php endif;
  if(!empty($phone) && empty($sub_email)):?>
    <a class="cta__phone" href="tel:<?php echo esc_attr(preg_replace('/\D/', '', $phone)); ?>" aria-label="<?php echo esc_attr__('Номер телефону','ensuria'); ?>"> 
      <?php echo esc_html($phone); ?>
    </a>
    <small class="cta__phone-note"><?php _e('*дзвінок безкоштовний','ensuria'); ?></small>
  <?php endif; ?>
</div>