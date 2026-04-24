<?php
$form_id = get_field('modal_form','options');
$class = $args['class'] ?? '';

if (!empty($form_id)) :
    $form_id_safe = absint($form_id);

    // Read UTM from GET or cookies for AJAX rendering context.
    $utm_source   = $_GET['utm_source']   ?? ($_COOKIE['utm_source']   ?? '');
    $utm_medium   = $_GET['utm_medium']   ?? ($_COOKIE['utm_medium']   ?? '');
    $utm_campaign = $_GET['utm_campaign'] ?? ($_COOKIE['utm_campaign'] ?? '');

    // Build shortcode with UTM attributes (only if values exist)
    $shortcode = sprintf(
        '[ensuria_contact_form id="%d"%s%s%s]',
        $form_id_safe,
        $utm_source   ? ' utm_source="'   . esc_attr($utm_source)   . '"' : '',
        $utm_medium   ? ' utm_medium="'   . esc_attr($utm_medium)   . '"' : '',
        $utm_campaign ? ' utm_campaign="' . esc_attr($utm_campaign) . '"' : ''
    );
    ?>
    <div class="<?php echo esc_attr($class) ?>">
        <?php echo do_shortcode($shortcode); ?>
    </div>
<?php endif; ?>
