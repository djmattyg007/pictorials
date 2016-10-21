<?php

define("VERSION", "0.4.0-dev");

/**
 * @param string $includePicFilename
 * @param array $extractVars
 * @param bool $getContentsOverride
 */
function loadPicFile($includePicFilename, array $extractVars = array(), $getContentsOverride = false)
{
    $fileExtension = pathinfo($includePicFilename, PATHINFO_EXTENSION);
    if ($getContentsOverride === true || !in_array($fileExtension, ["json", "php", "phtml"])) {
        return file_get_contents(BASE_PATH . $includePicFilename);
    }
    if ($fileExtension === "json") {
        return json_decode(file_get_contents(BASE_PATH . $includePicFilename), true);
    }
    if (!empty($extractVars)) {
        extract($extractVars);
    }
    return require(BASE_PATH . $includePicFilename);
}
loadPicFile("vendor/autoload.php");
