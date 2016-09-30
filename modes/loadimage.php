<?php

$fullFilename = loadPicFile("helpers/checkfilepath.php");

list($normalisedExtension, $mimeType) = loadPicFile("helpers/checkimagetype.php", array("filename" => $fullFilename));

$imageSizes = loadPicFile("conf/app.json")["image_sizes"];
if (empty($_POST["size"]) || !in_array($_POST["size"], array_keys($imageSizes))) {
    $imageSize = $imageSizes["medium"];
} else {
    $imageSize = $imageSizes[$_POST["size"]];
}

$image = PicImage::open($fullFilename);
$image->cropResize($imageSize["width"], $imageSize["height"]);
$image->fixOrientation();

$imageData = $image->cacheData($normalisedExtension);

header("Content-type: $mimeType");


echo $imageData;
