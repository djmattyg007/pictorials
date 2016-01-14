<?php

if (empty($_POST["filename"])) {
    sendError(400);
}
if (strpos($_POST["filename"], "..") !== false) {
    sendError(400);
}
$paths = json_decode(loadPicFile("conf/paths.json"), true);
if (!isset($_POST["path"]) || !is_numeric($_POST["path"])) {
    sendError(400);
}
$pathID = (int) $_POST["path"];
if (!isset($paths[$pathID])) {
    sendError(404);
}
$fullFilename = $paths[$pathID]["path"] . $_POST["filename"];
if (!file_exists($fullFilename)) {
    sendError(404);
}

use Gregwar\Image\Image;
use Gregwar\Cache\Cache;

$cache = new Cache;
$cache->setCacheDirectory(CACHE_DIR);

$image = Image::open($fullFilename);
$image->setCacheSystem($cache);
$image->cropResize(400, 400);
$image->fixOrientation();

$imageData = $image->cacheData("jpg");
header("Content-type: image/jpeg");
echo $imageData;
