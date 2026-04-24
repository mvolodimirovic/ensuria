<?php
// $form_id = get_field('modal_form','options');
$modal_title = get_field('title','options');
$modal_subtitle = get_field('subtitle','options');
?>
<div class="modal" role="dialog" aria-modal="true">
  <div class="modal__wrapper add-ajax-request">
    <button type="button" class="modal__close" aria-label="<?php echo esc_attr__('Закрити модальне вікно','ensuria'); ?>">
      <?php echo get_icon('icon-close','presentation'); ?>
    </button>
    <?php if(!empty($modal_title)):?>
      <h2><?php echo esc_html($modal_title) ;?></h2>
    <?php endif; ?>
    <?php if(!empty($modal_subtitle)):?>
      <p><?php echo esc_html($modal_subtitle) ;?></p>
    <?php endif; 
    get_template_part('template-parts/components/form', null, ['class' => 'modal__form']);?>
  </div>
  <div class="modal__bg"></div>
</div>