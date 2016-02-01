<?php

/** @var string $filename */

$allowedImageTypes = loadPicFile("helpers/imagetypes.php");
$type = new Hoa\Mime\Mime(new Hoa\File\Read($filename));
$originalExtension = strtolower($type->getExtension());
if (!in_array($originalExtension, $allowedImageTypes)) {
    sendError(400);
}
$mimeType = $type->getMime();
$actualMimeType = HoaMimeWrapper::picGetMimeTypeFromFilename($filename);
if ($actualMimeType !== $mimeType) {
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
return array($normalisedExtension, $originalExtension, $mimeType);