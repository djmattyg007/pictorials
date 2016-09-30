<?php

if (empty($_POST["filename"])) {
    sendError(400);
}
$filename = loadPicFile("helpers/filenamereject.php", array("filename" => $_POST["filename"]));
$pathConfig = Access::getCurrentPathConfig();
$fullFilename = $pathConfig["path"] . $filename;
if (!is_file($fullFilename)) {
    sendError(404);
}
if (!in_array("nsfw", $pathConfig["permissions"])) {
    $nsfwRegexPathTest = preg_match("/.*\/NSFW\/.*/", $fullFilename);
    if ($nsfwRegexPathTest === 1 || $nsfwRegexPathTest === false) {
        sendError(404);
    }
    $nsfwRegexPathTest = preg_match("/NSFW\/.*/", $fullFilename);
    if ($nsfwRegexPathTest === 1 || $nsfwRegexPathTest === false) {
        sendError(404);
    }
}

return $fullFilename;
