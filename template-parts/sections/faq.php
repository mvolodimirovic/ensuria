<?php
$faq_group = $args["faq_group"];
$faq_list = !empty($faq_group['faq_list']) ? $faq_group['faq_list'] : [];
$title = !empty($faq_group['faq_title']) ? $faq_group['faq_title'] : [];
if (!empty($faq_list)) : ?>
  <section class="faq section">
    <div class="wrapper">
      <?php if(!empty($title)):?>
        <h2 class="faq__title"><?php echo esc_html($title); ?></h2>
      <?php endif; ?>
      <div class="faq__list">
        <?php foreach ($faq_list as $index => $item) :
          $question = !empty($item['question']) ? $item['question'] : '';
          $answer   = !empty($item['answer']) ? $item['answer'] : '';
        ?>
          <div class="faq__details">
            <div class="faq__summary <?php echo $index == 0 ? 'open':''?>">
              <?php echo esc_html($question); ?>
              <?php echo get_icon('arrow-filter', 'presentation'); ?>
            </div>
            <div class="faq__text">
              <div class="faq__text-inner">
                <?php echo wp_kses_post($answer); ?>
              </div>
            </div>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
<?php endif; ?>
