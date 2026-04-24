<?php
$video_id = 0;
if ( isset($args['video_id']) ) {
  $video_id = absint($args['video_id']);
} elseif ( isset($_POST['video_id']) ) {
  $video_id = absint(wp_unslash($_POST['video_id']));
}
$video_html = '';
if ( $video_id ) {
  $mime = get_post_mime_type($video_id);
  if ( $mime && strpos($mime, 'video/') === 0 ) {
    $src = wp_get_attachment_url($video_id);
    if ( $src ) {
      $poster_id  = (int) get_post_meta($video_id, '_thumbnail_id', true);
      $poster_url = $poster_id ? wp_get_attachment_image_url($poster_id, 'large') : '';
      $video_html = wp_video_shortcode([
        'src'     => $src,
        'poster'  => $poster_url,
        'preload' => 'metadata',
        'class'   => 'video-player',
        'height'  => 0,
        'width'   => 0,
      ]);
    }
  }
}
?>
<div class="modal modal--video" role="dialog" aria-modal="true" aria-label="<?php echo esc_attr__('Video', 'textdomain'); ?>">
  <div class="modal__bg"></div> 
  <div class="modal__wrapper">  
    <button type="button" class="modal__close" aria-label="<?php echo esc_attr__('Закрити модальне вікно','ensuria'); ?>">
      <?php echo get_icon('icon-close','presentation'); ?>
    </button>

    <div class="modal__content">
     <?php if ($src): ?>
        <video
          class="video-player"
          autoplay
          muted
          playsinline
          controls
          preload="metadata"
          <?php if ($poster_url) echo 'poster="'.esc_url($poster_url).'"'; ?>
          style="width:100%;display:block"
        >
          <source src="<?php echo esc_url($src); ?>" type="video/mp4">
        </video>
      <?php else: ?>
        <p class="modal__error"><?php echo esc_html__('Video URL not found. Check video_id.', 'textdomain'); ?></p>
      <?php endif; ?>
    </div>
  </div>
</div>