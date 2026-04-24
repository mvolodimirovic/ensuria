<?php

$certificate = $args['certificate_group'] ?? [];
$title = $certificate['title'] ??'';
$subtitle = $certificate['subtitle'] ??'';
$certificate_ids = $certificate['certificate_list'] ?? [];
$btn = get_title_by_place('block_certificate',$certificate_ids);
$remove_padding = $args['remove_padding'] ?? '';

if (!empty($certificate_ids)): ?>
    <section class="certificate section">
      <div class="wrapper certificate__wrapper <?php echo $remove_padding ? esc_attr('certificate__wrapper-block') :'' ?>">
        <?php if(!empty($title) || !empty($subtitle)): ?>
        <div class="certificate__header section-header">
          <?php if(!empty($title)):?>
            <h2 class="certificate__title"><?php echo esc_html($title); ?></h2>
          <?php endif; 
          if(!empty($subtitle)):?>
          <p class="certificate__subtitle">
            <?php echo wp_kses($subtitle, ['br'=>[]]); ?>
          </p>
          <?php endif; ?>
        </div>
        <?php endif; 
        $is_slider = false;
        ?>
        <div class="slider-inner">
          <div class="swiper-pagination certificate__pagination">
            <div class="certificate-button-prev button-prev">
              <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
            </div>
            <div class="certificate-button-next button-next">
              <?php echo get_icon('icon-arrow-right', 'presentation'); ?>
            </div>
          </div>
          <div class="certificate__slider certificate-swiper <?php echo !empty($subtitle) ? ' has-subtitle' : ''; ?>">
            <div class="swiper-wrapper">
              <?php foreach ($certificate_ids as $key => $item):
                if(empty(has_post_thumbnail($item))) continue;
                $image_id = get_post_thumbnail_id($item);
                ?>
                <article id="certificate-<?php echo esc_attr($item)?>" class="certificate__item swiper-slide ">
                  <div class="certificate__item__img" 
                    data-certificate-id="<?php echo esc_attr($image_id)?>" 
                    role="button" 
                    tabindex="<?php echo esc_attr($key)?>" 
                    aria-label="<?php esc_attr_e('Відкрити сертифікат','ensuria')?>">
                    <?php if (!empty(has_post_thumbnail($item))) :
                        echo render_optimized_image($image_id, 'name', '', false, '100vw'); 
                    endif; ?>
                  </div>
                </article>
              <?php endforeach; ?>
            </div>
          </div>
        </div>
        <div class="certificate-progress <?php echo !empty($subtitle) ? 'has-subtitle' : ''; ?>"></div>
      </div>
    </section>
<?php endif; 