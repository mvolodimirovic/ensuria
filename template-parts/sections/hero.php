<?php
$group = $args['hero_group'];
$hero_text_decore    = $group['hero_text_decore'] ?? '';
$hero_image    = $group['hero_image'] ?? '';
$hero_title    = $group['hero_title'] ?? '';
$hero_subtitle = $group['hero_subtitle'] ?? '';
$hero_button_text   = $group['hero_button_text'] ?? null;
$hero_short_description   = $group['hero_short_description'] ?? null;
?>

<section class="hero">
  <div class="wrapper hero__wrapper">
    <div class="hero__left">
      <?php if (!empty($hero_text_decore)): ?>
        <span class="hero__decore"><?php echo esc_html($hero_text_decore); ?></span>
      <?php endif; ?>
      <?php if (!empty($hero_title)): ?>
        <h1 class="hero__title"><?php echo esc_html($hero_title); ?></h1>
      <?php endif; ?>
        
      <?php if (!empty($hero_subtitle)): ?>
        <div class="hero__subtitle"><?php echo wp_kses($hero_subtitle,['br'=>[]]); ?></div>
      <?php endif; ?>

      <?php if (!empty($hero_button_text)): ?>
        <button class="btn hero__button btn--icon btn--white open-modal" data-modal-slug="contact" aria-label="<?php echo esc_attr__('Відкрити модальне вікно','ensuria'); ?>">
          <?php echo esc_html($hero_button_text); ?>
            <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
        </button>
      <?php endif; ?>
      <?php if (!empty($hero_short_description)): ?>
        <p class="hero__description"><?php echo esc_html($hero_short_description); ?></p>
      <?php endif; ?>
    </div>
    <?php if (!empty($hero_image)): ?>
      <div class="hero__right">
          <?php echo render_optimized_image($hero_image, 'home-hero', 'hero__image', true); ?>
      </div>
    <?php endif; ?>
  </div>
</section>