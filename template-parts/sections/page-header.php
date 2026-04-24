<?php
$title = !empty($args['title']) ? $args['title'] : '';
$count_posts = !empty($args['count_posts']) ? $args['count_posts'] : '';?>
<section class="page-header">
  <div class="wrapper">
    <?php
      if ( function_exists('yoast_breadcrumb') ) {
        yoast_breadcrumb( '<p id="breadcrumbs" class="breadcrumbs">','</p>' );
      }
    ?>
    <h1 class="page-header-title"><?php _e($title,'ensuria')?></h1>
    <?php if(!empty($count_posts)) :?>
      <span class="post-count"><?php echo esc_html($count_posts)?></span>
    <?php endif;?>
  </div>
</section>