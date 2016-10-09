<?php

/** @var $template string */

define("TEMPLATE_EXTRACT_REGEX", '|<script type="text\/x-html-template" id="([a-z-]+)-template">([\S\s]*?)<\/script>|im');
define("PHP_EXTRACT_REGEX", '|<\?php (.*) \?>|i');

$result = preg_match_all(TEMPLATE_EXTRACT_REGEX, $template, $matches, PREG_SET_ORDER);
if (!$result) {
    sendError(404);
}

$phpCallback = function($matches) {
    ob_start();
    eval($matches[1]);
    return ob_get_clean();
};

$jsTemplates = array();
foreach ($matches as $match) {
    $rendered = preg_replace_callback(PHP_EXTRACT_REGEX, $phpCallback, $match[2]);
    $jsTemplates[$match[1]] = JsTemplateBuilder::build(substr(json_encode($rendered), 1, -1));
}

header("Content-type: application/javascript");
?>
window.templates = {
<?php foreach ($jsTemplates as $identifier => $funcCode): ?>
    "<?php echo $identifier; ?>": function(helper, obj) {
        var result = "";
<?php echo $funcCode; ?>
        return result;
    },
<?php endforeach; ?>
};
