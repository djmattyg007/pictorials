<?php

/** @var string $filename */

$allowedImageTypes = loadPicFile("helpers/imagetypes.php");
$originalExtension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
if (!in_array($originalExtension, $allowedImageTypes)) {
    sendError(400);
}

$mimeType = MrMime::extensionToMimeType($originalExtension);
$actualMimeType = MrMime::resolveMimeType($filename);
if ($actualMimeType !== $mimeType) {
    Logger::warning("error", "Invalid image found.", array("filename" => $filename, "expectedMimeType" => $mimeType, "actualMimeType" => $actualMimeType));
    sendError(500);
}
switch ($mimeType)
{
    case "image/jpeg":
        $normalisedExtension = "jpeg";
        break;
    default:
        $normalisedExtension = $originalExtension;
        break;
}
return array($normalisedExtension, $mimeType);
