<?php

$fullFilename = loadPicFile("helpers/checkfilepath.php");

list($normalisedExtension, $actualExtension, $mimeType) = loadPicFile("helpers/checkimagetype.php", array("filename" => $fullFilename));

use Gregwar\Image\Image;
use Gregwar\Cache\Cache;

$cache = new Cache;
$cache->setCacheDirectory(CACHE_DIR . "/images");

$image = Image::open($fullFilename);
$image->setCacheSystem($cache);
$image->cropResize(400, 400);
if ($normalisedExtension === "jpeg") {
    $image->fixOrientation();
}

$imageData = $image->cacheData($normalisedExtension);
header("Content-type: $mimeType");
echo $imageData;
