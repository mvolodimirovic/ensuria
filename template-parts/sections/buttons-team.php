<?php
$post_id = $args['post_id'] ?? get_the_ID();
$wrapper_class = $args['wrapper_class'] ?? '';

$blocks = ensuria_get_blocks_with_button_navigation($post_id);
if (!empty($blocks)) :

?>
<div class="doctor__info-sticky <?php echo esc_attr($wrapper_class); ?>">
  <?php foreach ($blocks as $key => $block) : 
    $index = isset($block['index']) ? 'tab-'.$block['index'] : $block['block_id'];
    if(empty($block['text_nav_button'])):
      continue;
    endif;
    ?>
    <button type="button" 
            class="doctor__info-sticky__button <?php echo $block['count_nav'] ? 'doctor__info-sticky__button--count':''; echo $key == 0 ? ' active':'';?>" 
            aria-label="<?php echo esc_attr($block['text_nav_button'])?>" 
            data-content="<?php echo esc_attr($index); ?>">
      <?php echo esc_html($block['text_nav_button']); 
        if($block['count_nav'] && !empty($block['count_list']) && $block['count_list'] > 0): 
      ?>
        <span><?php echo esc_html($block['count_list']); ?></span>
      <?php endif; ?>
    </button>
  <?php endforeach; ?>
</div> 
<?php endif; 
