<?php

$fullFilename = loadPicFile("helpers/checkfilepath.php");

use Gregwar\Image\Image;
use Gregwar\Cache\Cache;

$cache = new Cache;
$cache->setCacheDirectory(CACHE_DIR . "/images");

$image = Image::open($fullFilename);
$image->setCacheSystem($cache);
$image->cropResize(400, 400);
$image->fixOrientation();

$imageData = $image->cacheData("jpg");
header("Content-type: image/jpeg");
echo $imageData;
