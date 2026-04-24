<?php
$disclaimer = $args['disclaimer_group'];
$title = $disclaimer['disclaimer_text'] ??'';
$content = $disclaimer['disclaimer_items'] ??'';
?>
<?php if(is_array($content) && array_filter($content)):?>
  <section class="disclaimer">
    <div class="wrapper disclaimer__wrapper">
      <?php if(!empty($title)):?>
        <h5><?php echo esc_html($title); ?></h5>
      <?php endif; ?>
      <div class="disclaimer__list">
        <?php foreach($content as $item):
          $title = $item['title'] ??'';
          $number_document = $item['number_document'] ??'';
          $date_from = $item['date_from'] ??'';
          $dt = DateTime::createFromFormat('!' . 'd-m-Y', trim($date_from));
          $nbsp = "\xC2\xA0";
          ?>
          <div class="disclaimer__item">
            <?php if(!empty($title)):?>
              <h6><?php echo esc_html($title);?></h6>
            <?php endif; ?>
            <?php if(!empty($number_document)):?>
              <span><?php echo esc_html($number_document)?></span>
            <?php endif; ?>
            <?php if(!empty($date_from)):?>
              <time datetime="<?php echo esc_attr($dt->format('Y-m-d'))?>"><?php _e('Від','ensuria'); echo $nbsp . esc_html( $dt->format('d.m.Y') ) . $nbsp; _e('року','ensuria')?> </time>
            <?php endif; ?>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
<?php endif; ?>