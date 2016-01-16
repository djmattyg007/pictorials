<?php

$fullFilename = loadPicFile("helpers/checkfilepath.php");
$filetype = strtolower(pathinfo($fullFilename, PATHINFO_EXTENSION));

use Gregwar\Image\Image;
use Gregwar\Cache\Cache;

$cache = new Cache;
$cache->setCacheDirectory(CACHE_DIR . "/images");

$image = Image::open($fullFilename);
$image->setCacheSystem($cache);
$image->cropResize(400, 400);
if ($filetype === "jpg") {
    $image->fixOrientation();
}

$imageData = $image->cacheData($filetype);
header("Content-type: image/jpeg");
echo $imageData;
