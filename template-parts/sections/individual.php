<?php
$individual_group = $args["individual_group"];
$is_block = $args["is_block"] ?? '';
$title = $individual_group["title"];
$short_description = $individual_group["short_description"];
$individual_list = $individual_group["individual_list"];
?>
<section class="section individual white-section">
  <div class="wrapper <?php echo $is_block ? esc_attr('individual--block'):''?>">
    <?php if(!empty($title) || !empty($short_description)): ?>
      <div class="individual__header section-header">
        <?php if(!empty($title)):?>
        <h2 class="individual__title <?php echo empty($short_description) ? 'no-margin' :''; ?>"><?php echo esc_html($title); ?></h2>
        <?php endif; 
          if(!empty($short_description)):?>
        <p class="individual__subtitle">
          <?php echo wp_kses($short_description, ['br'=>[]]); ?>
        </p>
        <?php endif; ?>
      </div>
    <?php endif;
    if(!empty($individual_list)): ?>
      <div class="individual__list">
          <?php
            $count_item = count($individual_list);
            foreach($individual_list as $index => $plan) : 
            $index++;
            $item_title    = $plan['name'];
            $item_description    = $plan['description'];  
            $icon_id = $plan['icon'];
            $item_class = 'individual-item';
            if ( $index > 4 ) {
              $offset     = $index - 4;
              $block_full = $offset % 4;
              if ( $block_full > 0 && $block_full <= 2 ) {
                $item_class .= ' card--full';
              } else if($count_item === $index + 1 ){
                $item_class .= ' card--full';
              }
            }
            $args = [
              'title' => $item_title,
              'item_link' => '',
              'icon_id' => $icon_id,
              'item_subtitle' => '',
              'item_class' => $item_class,
              'item_description' => $item_description,
              'not_service' => true
            ];
            get_template_part('/template-parts/cards/card-services','',$args);
        endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</section>
