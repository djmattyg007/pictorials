<?php

/** @var $template string */

define("TEMPLATE_EXTRACT_REGEX", '|<script type="text\/x-html-template" id="([a-z-]+)-template">([\S\s]*?)<\/script>|im');
define("PHP_EXTRACT_REGEX", '|<\?php (.*) \?>|i');
define("TEMPLATE_PARAMS_REGEX", '|([#\$%])\{(.*?)\}|');

$result = preg_match_all(TEMPLATE_EXTRACT_REGEX, $template, $matches, PREG_SET_ORDER);
if (!$result) {
    sendError(404);
}

$phpCallback = function($matches) {
    ob_start();
    eval($matches[1]);
    return ob_get_clean();
};

$jsCallback = function($matches) {
    if ($matches[1] === "#") {
        return '"+helper.escapeHtml(obj["' . $matches[2] . '"], false)+"';
    } elseif ($matches[1] === "$") {
        return '"+helper.escapeHtml(obj["' . $matches[2] . '"], true)+"';
    } elseif ($matches[1] === "%") {
        return '"+obj["' . $matches[2] . '"]+"';
    }
};

$jsTemplates = array();
foreach ($matches as $match) {
    $rendered = preg_replace_callback(PHP_EXTRACT_REGEX, $phpCallback, $match[2]);
    /** Inspired by rssi by Mark Vasilkov (https://github.com/mvasilkov/rssi) */
    $jsTemplates[$match[1]] = preg_replace_callback(TEMPLATE_PARAMS_REGEX, $jsCallback, json_encode($rendered));
}

header("Content-type: application/javascript");
?>
window.templates = {
<?php foreach ($jsTemplates as $identifier => $funcCode): ?>
    "<?php echo $identifier; ?>": function(helper, obj) {
        return <?php echo $funcCode; ?>;
    },
<?php endforeach; ?>
};
