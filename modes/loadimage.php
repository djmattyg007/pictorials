<?php

$fullFilename = loadPicFile("helpers/checkfilepath.php");

list($normalisedExtension, $mimeType) = loadPicFile("helpers/checkimagetype.php", array("filename" => $fullFilename));

$imageSizes = loadPicFile("conf/app.json")["image_sizes"];
if (empty($_POST["size"]) || !in_array($_POST["size"], array_keys($imageSizes))) {
    $imageSize = $imageSizes["medium"];
} else {
    $imageSize = $imageSizes[$_POST["size"]];
}

$path = Access::getCurrentPath();

$image = PicImage::open($fullFilename);
$image->cropResize($imageSize["width"], $imageSize["height"]);
$image->fixOrientation();

$imageData = $image->cacheData($normalisedExtension);

header("Content-type: $mimeType");

loadPicFile("classes/exif.php");
$exif = Exif::read($fullFilename);
if ($path->hasPermission("metadata") && $exif) {
    header("X-Pictorials-Pic-Metadata: " . json_encode(array_filter(array(
        "date_taken" => $exif->getCreationDate() ? $exif->getCreationDate()->format("Y-m-d") : null,
        "exposure" => $exif->getExposure(),
        "iso" => $exif->getIso(),
        "focal_length" => $exif->getFocalLength(),
    ))));
}
if ($path->hasPermission("gps") && $exif) {
    if ($gpsCoords = $exif->getGPS()) {
        list($gpsLat, $gpsLon) = explode(",", $gpsCoords);
        header("X-Pictorials-Pic-GPS: " . json_encode(array(
            "lat" => (float) $gpsLat,
            "lon" => (float) $gpsLon,
        )));
    }
}

echo $imageData;
