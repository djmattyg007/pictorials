<?php

function scriptUrl($mode = "")
{
    return SCRIPT_BASE_URL . ($mode === "" ? "" : "?mode=$mode");
}

function assetUrl($type, $file)
{
    return ASSET_BASE_URL . "$type/$file";
}

function sendError($code)
{
    http_response_code($code);
    exit($code);
}

function humanFilesize($bytes, $decimals = 2)
{
    $sz = 'BKMGTP';
    $factor = floor((strlen($bytes) - 1) / 3);
    return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . @$sz[$factor];
}
