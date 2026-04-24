<?php
$seo = $args['seo_group'];
$title = $seo['seo_title'] ??'';
$content = $seo['seo_content'] ??'';
?>
<?php if(!empty($content)): ?>
  <section class="seo section">
    <div class="wrapper seo__wrapper">
      <?php if(!empty($title)):?>
        <h5><?php echo esc_html($title); ?></h5>
      <?php endif; ?>
      <div class="seo__content more__content">
        <?php echo wp_kses($content,['p'=>[]]) ?>
      </div>
      <button type="button" class="show-more" aria-label="<?php echo esc_attr__('Показати більше','ensuria'); ?>"><?php _e('Показати більше','ensuria')?></button>
      <button type="button" class="show-less" aria-label="<?php echo esc_attr__('Показати менше','ensuria'); ?>"><?php _e('Показати менше','ensuria')?></button>
    </div>
  </section>
<?php endif; ?>