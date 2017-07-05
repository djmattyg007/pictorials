<?php

if (Access::modeCheckAny(array("manage", "view_album")) === false) {
    sendError(404);
}

$fullFilename = loadPicFile("helpers/checkfilepath.php");
loadPicFile("helpers/checkimagetype.php", array("filename" => $fullFilename));

header("Content-Description: File Transfer");
header("Content-Type: application/octet-stream");
header("Content-Length: " . filesize($fullFilename));
header('Content-Disposition: attachment; filename="' . basename($fullFilename) . '"');
header("Expires: 0");
header("Cache-Control: must-revalidate");
header("Pragma: no-cache");
readfile($fullFilename);

Logger::info("main", "Image downloaded", array("filename" => $fullFilename));
