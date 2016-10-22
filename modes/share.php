<?php

if (empty($_GET["share"]) || empty($_POST)) {
    sendError(400);
}

if ($_GET["share"] === "submit") {
    if (empty($_POST["files"]) || is_array($_POST["files"]) === false) {
        sendError(400);
    }
    $pathID = Access::verifyCurrentPathAccess();
    $shareID = loadPicFile("helpers/share/submit.php", array("pathID" => $pathID, "files" => $_POST["files"]));
    if (!$shareID) {
        sendError(500);
    }

    header("Content-type: text/plain");
    echo $shareID;
} elseif ($_GET["share"] === "receive") {
    if (empty($_POST["shareID"])) {
        sendError(400);
    }
    $decodedShareID = loadPicFile("helpers/share/receive.php", array("shareID" => $_POST["shareID"]));
    if (!$decodedShareID) {
        sendError(404);
    }
    list($pathID, $files) = $decodedShareID;
    $allowedPaths = Access::getAllowedPaths();
    if (!isset($allowedPaths[$pathID])) {
        sendError(404);
    }

    header("Content-type: application/json");
    echo json_encode(array("path" => $pathID, "files" => $files));
} else {
    sendError(404);
}
