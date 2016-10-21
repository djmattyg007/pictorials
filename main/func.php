<?php

/**
 * @param string $mode
 * @return string
 */
function scriptUrl($mode = "")
{
    return SCRIPT_BASE_URL . ($mode === "" ? "" : "?mode=$mode");
}

/**
 * @param string $mode
 * @return string
 */
function templateUrl($mode = "")
{
    return SCRIPT_BASE_URL . "?version=v" . VERSION . "&templates=1" . ($mode === "" ? "" : "&mode=$mode");
}

/**
 * @param string $type
 * @param string $file
 * @return string
 */
function assetUrl($type, $file)
{
    return ASSET_BASE_URL . "$type/$file?version=v" . VERSION;
}

/**
 * @param int $code
 */
function sendError($code)
{
    http_response_code($code);
    exit($code);
}

/**
 * @param int $bytes
 * @param int $decimals
 * @return string
 */
function humanFilesize($bytes, $decimals = 2)
{
    $sz = 'BKMGTP';
    $factor = floor((strlen($bytes) - 1) / 3);
    return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . @$sz[$factor];
}

/**
 * @param string $filename
 * @param array $vars
 */
function loadPicTemplate($filename, array $vars = array())
{
    if (isset($_GET["templates"]) && $_GET["templates"] == 1) {
        $template = loadPicFile($filename, $vars, true);
        loadPicFile("classes/jstemplatebuilder.php");
        loadPicFile("helpers/jstemplates.php", array("template" => $template));
    } else {
        header("Content-type: text/html; charset=UTF-8");
        loadPicFile($filename, $vars);
    }
    exit();
}
