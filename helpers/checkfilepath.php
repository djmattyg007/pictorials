<?php

if (empty($_POST["filename"])) {
    sendError(400);
}
if (strpos($_POST["filename"], "..") !== false) {
    sendError(400);
}
if (!isset($_POST["path"]) || !is_numeric($_POST["path"])) {
    sendError(400);
}
$paths = Access::getAllowedPaths();
$pathID = (int) $_POST["path"];
if (!isset($paths[$pathID])) {
    sendError(404);
}
$fullFilename = $paths[$pathID]["path"] . $_POST["filename"];
if (!file_exists($fullFilename)) {
    sendError(404);
}

return $fullFilename;
