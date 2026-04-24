<?php 
$abs_block = isset($block) ? $block : '';
$abs_args  = isset($args) ? $args : '';

$abs_defaults = [
	'allowed_innerblocks' => [''],
	'id'                  => (isset($block) && !empty($block['anchor'])) ? $block['anchor'] : '',
	'fields'              => [],
];
 
[$abs_defaults, $abs_atts] = setup_block_defaults($abs_args, $abs_defaults, $abs_block);

$abs_slider = !empty($abs_defaults['fields']) ? $abs_defaults['fields'] : get_acf_fields(['law_group'], $block['id']);
if ( !empty($abs_slider['law_group'])) : 

$law = $abs_slider['law_group'] ?? [];
$title = $law['title'] ??'';

if (!empty($law['law_list'])): ?>
  <section class="law section">
    <div class="law__wrapper">
      <?php if(!empty($title)):?>
        <h2 class="law__title"><?php echo esc_html($title); ?></h2>
      <?php endif; ?>
      <ul class="law__list">
        <?php
        foreach ($law['law_list'] as $item) :
          $name = isset($item['name']) ? esc_html($item['name']) :'';
          $info = isset($item['info']) ? esc_html($item['info']) :'';
        ?>
          <li class="law__list__item">
            <span><?php echo $name ?></span>
            <span><?php echo $info ?></span>
          </li>
        <?php endforeach ?>
      </ul>
    </div>
  </section>
<?php endif; 
endif; 