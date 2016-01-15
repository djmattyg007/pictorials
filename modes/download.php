<?php

$fullFilename = loadPicFile("helpers/checkfilepath.php");

header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . basename($fullFilename) . '"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: no-cache');
header('Content-Length: ' . filesize($fullFilename));
readfile($fullFilename);
