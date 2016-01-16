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
 * @param string $type
 * @param string $file
 * @return string
 */
function assetUrl($type, $file)
{
    return ASSET_BASE_URL . "$type/$file";
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
