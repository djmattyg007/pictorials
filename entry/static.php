<?php

require(BASE_PATH . "main/bootstrap.php");

loadPicFile("main/logging.php");
loadPicFile("classes/mrmime.php");

if (empty($_GET["type"]) || empty($_GET["file"]) || empty($_GET["version"])) {
    sendError(400);
} elseif ($_GET["version"] !== VERSION) {
    sendError(400);
}

switch ($_GET["type"]) {
    case "css":
    case "img":
    case "js":
        $filename = BASE_PATH . "assets/{$_GET["type"]}/{$_GET["file"]}";
        break;
    default:
        sendError(400);
}
if (is_readable($filename) === false) {
    sendError(404);
}

header("Content-Type: " . MrMime::resolveMimeType($filename));
header("Content-Length: " . filesize($filename));
readfile($filename);

Logger::debug("main", "Asset downloaded", array("fullFilename" => $filename));
