<?php 
$abs_block = isset($block) ? $block : '';
$abs_args  = isset($args) ? $args : '';

$abs_defaults = [
	'allowed_innerblocks' => [''],
	'id'                  => (isset($block) && !empty($block['anchor'])) ? $block['anchor'] : '',
	'fields'              => [],
];
 
[$abs_defaults, $abs_atts] = setup_block_defaults($abs_args, $abs_defaults, $abs_block);

$abs_appointment = !empty($abs_defaults['fields']) ? $abs_defaults['fields'] : get_acf_fields(['appointment_group'], $block['id']);
if ( !empty($abs_appointment['appointment_group'])) :
$title = $abs_appointment['appointment_group']['title'] ??'';
$subtitle = $abs_appointment['appointment_group']['subtitle'] ??'';
?>
  <section class="section appointment">
    <div class="wrapper">
      <?php if(!empty($title) || !empty($subtitle)): ?>
        <div class="appointment__header section-header"> 
          <?php if(!empty($title)):?>
            <h2 class="appointment__title"><?php echo esc_html($title); ?></h2>
          <?php endif; 
          if(!empty($subtitle)):?>
          <p class="appointment__subtitle">
            <?php echo wp_kses($subtitle, ['br'=>[]]); ?>
          </p>
          <?php endif; ?>
        </div>
      <?php endif; ?>
      <?php 
        if(have_rows('appointment_group_appointment_list')): ?>
            <div class="appointment__info">   
              <?php while (have_rows('appointment_group_appointment_list')): the_row(); 
                $choose_template = get_sub_field('choose_template');
                $title = get_sub_field('title');
                $email = get_sub_field('email');
                $link = !empty(get_sub_field('link')) ? get_sub_field('link') : 103;
                $subtext = get_sub_field('subtext');
                $html_tag_start = $choose_template == 'template_1' ? '<div class="appointment__item">':'<a href="tel:'.esc_attr($link).'" class="appointment__item" aria-label="'.esc_attr__('Номер телефону','ensuria').'">';
                $html_tag_end = $choose_template == 'template_1' ? '</div>':'</a>';

                echo $html_tag_start;
                  if(!empty($title)): ?>
                    <div class="appointment__item-title">
                      <?php echo esc_html($title); 
                      if($choose_template == 'template_2' && !empty(get_sub_field('link'))): 
                        echo get_icon('icon-phone', 'presentation'); 
                      endif; ?>
                    </div>
                  <?php endif; 
                  if(!empty($email) && $choose_template == 'template_1'): ?>
                    <button type="button" class="appointment__item-phone email-copy click-to-copy" data-email="<?php echo esc_attr($email); ?>">
                      <?php echo esc_html($email); ?>
                      <span class="visually-hidden"><?php _e('Скопійовано','ensuria'); ?></span>
                      <?php echo get_icon('icon-copy', 'presentation'); ?>
                    </button>
                  <?php endif; 
                  if(!empty($subtext)): ?>
                    <div class="appointment__item-subtext <?php echo $choose_template == 'template_1' ? '':'mt-auto'?>">
                      <?php echo esc_html($subtext); ?>
                    </div>
                  <?php endif; 
                echo $html_tag_end;
              endwhile; ?>
            </div>
          <?php endif; ?>
    </div>
  </section>
<?php
endif; 