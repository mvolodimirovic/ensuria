<?php
/**
 * The template for displaying 404 pages (not found)
 *
 * @link https://codex.wordpress.org/Creating_an_Error_404_Page
 *
 */

get_header();?>

<section class="error-page">
  <div class="wrapper error-page__wrapper">
    <h1><?php _e('404. Сторінка зникла.','ensuria')?></h1>
    <h4><?php echo wp_kses_post('Можливо, вона пішла на консультацію до нашого лікаря &#128578;<br>А вам радимо натиснути кнопку нижче і повернутися на знайомий маршрут.'); ?></h4>
    <a href="<?php echo esc_url(home_url('/'))?>" class="btn btn--large btn--dark " aria-label="<?php echo esc_attr__('Головна сторінка','ensuria'); ?>"><?php _e('На головну','ensuria')?></a>
  </div>
</section> 

<?php get_footer();