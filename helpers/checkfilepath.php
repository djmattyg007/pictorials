<?php

if (empty($_POST["filename"])) {
    sendError(400);
}
$filename = loadPicFile("helpers/filenamereject.php", array("filename" => $_POST["filename"]));
if (!isset($_POST["path"]) || !is_numeric($_POST["path"])) {
    sendError(400);
}
$paths = Access::getAllowedPaths();
$pathID = (int) $_POST["path"];
if (!isset($paths[$pathID])) {
    sendError(404);
}
$fullFilename = $paths[$pathID]["path"] . $filename;
if (!is_file($fullFilename)) {
    sendError(404);
}
if (!in_array("nsfw", $paths[$pathID]["permissions"])) {
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
