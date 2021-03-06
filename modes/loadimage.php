<?php

if (Access::modeCheckAny(array("manage", "view_album")) === false) {
    sendError(404);
}

$fullFilename = loadPicFile("helpers/checkfilepath.php");

list($normalisedExtension, $mimeType) = loadPicFile("helpers/checkimagetype.php", array("filename" => $fullFilename));

$imageSizes = loadPicFile("conf/app.json")["image_sizes"];
if (empty($_POST["size"]) || !in_array($_POST["size"], array_keys($imageSizes))) {
    $imageSizeID = "medium";
} else {
    $imageSizeID = $_POST["size"];
}
$imageSize = $imageSizes[$imageSizeID];

$path = Access::getCurrentPath();

$image = PicImage::open($fullFilename);
$image->cropResize($imageSize["width"], $imageSize["height"]);
$image->fixOrientation();

$imageData = $image->cacheData($normalisedExtension, $imageSizeID === "small" ? 85 : 95);

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
