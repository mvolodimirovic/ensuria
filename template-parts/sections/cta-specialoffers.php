<?php
$post_id = $args["post_id"][0] ?? '';

if(!empty($post_id)) :
  $short_description = get_field('short_description', $post_id );
?>
  <section class="cta-specialoffers section">
    <div class="wrapper cta-specialoffers__wrapper">
      <div class="cta-specialoffers__info">
        <h2 class="cta-specialoffers-title"><?php echo esc_html(get_the_title($post_id)); ?></h2>
        <?php if (!empty($short_description)) : ?>
          <p class="cta-specialoffers-description"><?php echo esc_html($short_description); ?></p>
        <?php endif; ?>
        <div class="cta-specialoffers__buttons">
          <a href="<?php echo esc_url(get_permalink($post_id)); ?>" class="btn btn--small btn--dark" aria-label="<?php echo esc_attr__('Дізнайтесь більше','ensuria'); ?>">
            <?php _e('Дізнайтесь більше','ensuria'); ?>
          </a>
          <button class="btn btn--small btn--white open-modal" data-modal-slug="contact" aria-label="<?php echo esc_attr__('Відкрити модальне вікно','ensuria'); ?>">
            <?php _e('Записатись на прийом','ensuria'); ?>
          </button>
        </div>
      </div>
      <figure class="cta-specialoffers-img">
        <?php echo render_optimized_image(get_post_thumbnail_id($post_id), 'services-hero', '', true); ?> 
      </figure>
    </div>
  </section>
<?php endif; ?>