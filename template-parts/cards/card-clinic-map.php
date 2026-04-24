<?php
  $phone = get_field('phone_number','options');
  $post_id = ensuria_get_page_id_by_template('template-about.php');
  $group = get_field('info_group',$post_id);
  $address = $group['text_address'];
  $location_frame = $group['iframe_address'];
  $eponymous_stop = $group['eponymous_stop'];
  $worker_hours = $group['worker_hours'];
  $routings = $group['routings'];
  $allowed = [
  'iframe' => [
    'src' => true,
    'width' => true,
    'height' => true,
    'title' => true,
    'frameborder' => true,
    'allow' => true,
    'allowfullscreen' => true,
    'loading' => true,
    'referrerpolicy' => true,
    'sandbox' => true,
  ],
];
  $routes_raw   = (is_array($routings) ? $routings : []);
  $routes_valid = [];

  if (!empty($routes_raw)) {
    foreach ($routes_raw as $road) {
      $video = isset($road['video']) ? $road['video'] : '';
      $text  = isset($road['note_route']) ? $road['note_route'] : '';

      $has_text  = !empty($text);
      $has_video = search_video($video);

      if ($has_text && $has_video) {
        if (is_array($video)) {
          $video = !empty($video['url']) ? $video['url'] : (!empty($video['ID']) ? (string) (int) $video['ID'] : '');
        }
        $routes_valid[] = [
          'video' => $video,
          'text'  => $text,
        ];
      }
    }
  }
  ?>
  <article class="map__item map__item--full">
    <address class="map__item-address">
      <?php if($address):?>
        <div class="map__address">
          <span>
            <?php echo esc_html($address); ?>
          </span>
          <?php if(!empty($eponymous_stop)):?>
            <span><?php echo esc_html($eponymous_stop)?></span>
          <?php endif; ?>
        </div>
      <?php
        endif;
        if(is_array($worker_hours) && array_filter($worker_hours)):
          echo '<ul>';
          foreach($worker_hours as $worker_hour):
            $day_and_hours = $worker_hour['text'];
            if(!empty($day_and_hours)): ?>
            <li><?php echo esc_html($day_and_hours)?></li>
          <?php endif;
        endforeach;
        echo '</ul>';
      endif; ?>
      <div class="map__phone-clinic">
        <a class="map__phone" href="tel:<?php echo esc_attr(preg_replace('/(?!^)\+|[^\d+]/', '', $phone)); ?>" aria-label="<?php echo esc_attr ( sprintf ( __ ( ' Номер телефону %s ' , ' ensuria ' ), $phone ) ); ?>">
          <?php echo esc_html($phone); ?>
        </a>
        <small class="map__phone-note"><?php _e('*дзвінок безкоштовний','ensuria'); ?></small>
      </div>
      <div class="map__buttons <?php echo empty($routes_valid) ? 'down' : ''; ?>">
        <?php if(!is_page($post_id)):?>
          <a href="<?php echo esc_url(get_permalink($post_id)); ?>" class="btn btn--small btn--dark"><?php _e('Читати про клініку','ensuria'); ?></a>
        <?php endif; ?>
        <button type="button" 
                class="btn btn--small btn--blue-sky open-modal" 
                data-modal-slug="contact" 
                aria-label="<?php echo esc_attr__( 'Замовити дзвінок', 'ensuria' ); ?>">
                <?php _e('Замовити дзвінок','ensuria'); ?>
        </button>
      </div>
      <?php if(is_array($routings) && array_filter($routings) && !empty($routes_valid)): ?>
        <div class="map__route__list">
          <?php foreach($routings as $road): 
            $video_id = $road['video'];

            $text = $road['note_route'];
            if(!empty($video_id) && !empty($text)): ?>
              
              <button type="button" class="map__route open-modal" data-modal-slug="video" data-video="<?php echo esc_attr($video_id)?>" aria-label="<?php echo esc_attr__('Відкрити модальне вікно','ensuria'); ?>">
                <?php echo get_icon('icon-triangle', 'presentation',''); ?>
                <?php echo esc_html($text); ?>
              </button>
            <?php endif; 
          endforeach; ?>
        </div>
      <?php endif; ?>
    </address>
    <?php if(!empty($location_frame)):?>
      <div class="map__visual" data-title="<?php echo esc_attr(get_the_title()); ?>">
        <?php echo wp_kses($location_frame, $allowed)?>
      </div>
    <?php endif; ?>
  </article>
