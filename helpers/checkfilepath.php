<?php

if (empty($_POST["filename"])) {
    sendError(400);
}
$filename = loadPicFile("helpers/filenamereject.php", array("filename" => $_POST["filename"]));
$path = Access::getCurrentPath();
$fullFilename = $path->path . $filename;
if (!is_file($fullFilename)) {
    sendError(404);
}

if ($path->hasPermission("nsfw") === false) {
    $nsfwRegexPathTest = preg_match("/.*\/NSFW\/.*/", $fullFilename);
    if ($nsfwRegexPathTest !== 0) {
        sendError(404);
    }
    $nsfwRegexPathTest = preg_match("/NSFW\/.*/", $fullFilename);
    if ($nsfwRegexPathTest !== 0) {
        sendError(404);
    }
}

return $fullFilename;
