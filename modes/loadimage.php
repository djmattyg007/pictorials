<?php

$fullFilename = loadPicFile("helpers/checkfilepath.php");

list($normalisedExtension, $actualExtension, $mimeType) = loadPicFile("helpers/checkimagetype.php", array("filename" => $fullFilename));

$imageSizes = json_decode(loadPicFile("conf/app.json"), true)["image_sizes"];
if (empty($_POST["size"]) || !in_array($_POST["size"], array_keys($imageSizes))) {
    $imageSize = $imageSizes["medium"];
} else {
    $imageSize = $imageSizes[$_POST["size"]];
}

use Gregwar\Image\Image;
use Gregwar\Cache\Cache;

$cache = new Cache;
$cache->setCacheDirectory(CACHE_DIR . "/images");

$image = Image::open($fullFilename);
$image->setCacheSystem($cache);
$image->cropResize($imageSize["width"], $imageSize["height"]);
if ($normalisedExtension === "jpeg") {
    $image->fixOrientation();
}

$imageData = $image->cacheData($normalisedExtension);
header("Content-type: $mimeType");
echo $imageData;
