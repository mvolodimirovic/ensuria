<?php

$partners = $args['partners_group'] ?? [];
$description = $partners['description'] ??'';
$partner_button = $partners['partner_button'] ??'';
$partners_ids = $partners['partner_list'] ?? [];
$remove_padding = $args['remove_padding'] ??'';
?>
<section class="partners section">
  <div class="wrapper partners__wrapper <?php echo !empty($remove_padding) ? 'partners__wrapper-block': '' ?>">
    <?php if(!empty($description)):?>
      <div class="partners__description">
        <?php echo wp_kses_post($description)?>
        <?php if (!empty($partner_button['title']) && !empty($partner_button['url'])): ?>
          <a href="<?php echo esc_url($partner_button['url']); ?>" class="btn btn--white btn--icon">
            <?php echo esc_html($partner_button['title']); ?>
              <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
          </a>
        <?php endif; ?>
      </div>
    <?php endif; ?>
    <?php if(!empty($partners_ids[0])):?>
      <div class="partners__list">
        <?php foreach($partners_ids as $partner):

          $image_id = $partner['image'] ?? '' ;
          if(!empty($image_id)): ?>
            <div class="partners__item">
              <?php echo render_optimized_image($image_id, 'full', '', false); ?>
            </div>
          <?php endif; 
        endforeach; ?>
      </div>
    <?php endif;?>
  </div>
</section>