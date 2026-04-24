<?php
  $post_id = $args['post_id'] ?? null;
?>

<div class="modal review-modal" data-modal="review">
  <div class="modal__wrapper add-ajax-request">
    <button type="button" class="modal__close" aria-label="<?php echo esc_attr__('Закрити модальне вікно','ensuria'); ?>">
      <?php echo get_icon('icon-close','presentation'); ?>
    </button>
    <?php
     get_template_part('template-parts/cards/card-review', null,['slide'=> false,'post_id'=> $post_id]); ?>
  </div>
  <div class="modal__bg"></div>
</div> 