<?php

/** @var string $filename */

$allowedImageTypes = loadPicFile("helpers/imagetypes.php");
$type = new Hoa\Mime\Mime(new Hoa\File\Read($filename));
$originalExtension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
//$originalExtension = strtolower($type->getExtension());
if (!in_array($originalExtension, $allowedImageTypes)) {
    sendError(400);
}
$mimeType = MimeType::extensionToMimeType($originalExtension);
//$mimeType = $type->getMime();
$actualMimeType = MimeType::resolveMimeType($filename);
//$actualMimeType = HoaMimeWrapper::picGetMimeTypeFromFilename($filename);
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
//return array($normalisedExtension, $originalExtension, $mimeType);
return array($normalisedExtension, $mimeType);
