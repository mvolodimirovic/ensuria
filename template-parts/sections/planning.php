<?php
$planning_group = $args["planning_group"];
$title = $planning_group["title"];
$short_description = $planning_group["short_description"];
$planning_list = $planning_group["planning_list"];
?>
<section class="section planning">
  <div class="wrapper">
    <?php if(!empty($title) || !empty($short_description)): ?>
      <div class="planning__header section-header">
        <?php if(!empty($title)):?>
        <h2 class="planning__title <?php echo empty($short_description) ? 'no-margin' :''; ?>"><?php echo esc_html($title); ?></h2>
        <?php endif; 
          if(!empty($short_description)):?>
        <p class="planning__subtitle">
          <?php echo wp_kses($short_description, ['br'=>[]]); ?>
        </p>
        <?php endif; ?>
      </div>
    <?php endif; 
    if(!empty($planning_list)): ?>
      <div class="planning__list">
        <?php
        foreach($planning_list as $index => $plan) : 
          $image_id = $plan['image'];
          $name = $plan['name'];
          $short_description = $plan['short_description'];
          ?>
            <div class="planning__item">
              <?php if(!empty($image_id)): ?>
                <figure class="planning__item-image">
                  <?php echo render_optimized_image($image_id, 'name', '', false, '100vw');?>
                </figure>
              <?php endif;
              if(!empty($name)):?>
                <h5><?php echo esc_html($name)?></h5>
              <?php endif; 
              if(!empty($short_description)): ?>
                <p><?php echo esc_html($short_description); ?></p>
              <?php endif; ?>
            </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</section>
