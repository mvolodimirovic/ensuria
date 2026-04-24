<?php 
$abs_block = isset($block) ? $block : '';
$abs_args  = isset($args) ? $args : '';

$abs_defaults = [
	'allowed_innerblocks' => [''],
	'id'                  => (isset($block) && !empty($block['anchor'])) ? $block['anchor'] : '',
	'fields'              => [],
];
 
[$abs_defaults, $abs_atts] = setup_block_defaults($abs_args, $abs_defaults, $abs_block);

$abs_calling = !empty($abs_defaults['fields']) ? $abs_defaults['fields'] : get_acf_fields(['calling_group'], $block['id']);
if ( !empty($abs_calling['calling_group'])) :
$title = $abs_calling['calling_group']['title'] ??'';
$title_block = $abs_calling['calling_group']['title_block'] ??'';
$description = $abs_calling['calling_group']['description'] ??'';
?>
  <section class="section calling">
    <div class="wrapper">
      <?php if(!empty($title)): ?>
        <div class="calling__header"> 
          <p class="calling__title"><?php echo esc_html($title); ?></p>
        </div>
      <?php endif; 
        if(have_rows('calling_group_calling_list')): ?>
          <div class="calling__info"> 
            <?php
            if(!empty($title_block)): ?>
              <div class="calling__item-title">
                <?php echo esc_html($title_block); ?>
              </div>
            <?php endif; 
            while (have_rows('calling_group_calling_list')): the_row(); 
              $day = get_sub_field('day');
              $workhour = get_sub_field('workhour');
              ?>
              <div class="calling__item">
                <?php
                if(!empty($day)):?>
                  <span class="day"><?php echo esc_html($day)?></span>
                <?php endif;
                if(!empty($workhour)):?>
                  <span class="workerhours"><?php echo esc_html($workhour)?></span>
                <?php endif; ?>
              </div>
            <?php endwhile; ?>
          </div>
        <?php endif; 
        if(!empty($description)): ?>
          <div class="calling__subtext">
            <?php echo esc_html($description); ?>
          </div>
        <?php endif; ?>
    </div>
  </section>
<?php
endif; 