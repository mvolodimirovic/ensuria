<?php
$consultation = $args['consultation_group'];
$title = $consultation['title'];
$excerpt = $consultation['excerpt'];
$button_text = $consultation['button_text'];
$image_background = $consultation['image_background'];
?>
  <div class="consultation section">
    <div class="wrapper consultation__wrapper">
      <?php if(!empty($image_background)):?>
        <div class="consultation__bg">
          <?php echo render_optimized_image($image_background, 'full', '', false); ?>
        </div>
      <?php endif; ?>
      <div class="consultation__info">
        <?php if(!empty($title)):?>
          <h3><?php echo esc_html($title) ?></h3>
        <?php endif; ?>
        <?php if(!empty($excerpt)):?>
          <p><?php echo esc_html($excerpt) ?></p>
        <?php endif; ?>
        <?php if (!empty($button_text)): ?>
          <button class="consultation__button btn btn--dark btn--middle open-modal" data-modal-slug="contact" aria-label="<?php echo esc_attr__('Відкрити модальне вікно','ensuria'); ?>">
            <?php echo esc_html($button_text); ?>
          </button>
      <?php endif; ?>
      </div>
    </div>
  </div>