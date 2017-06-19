<?php

if (empty($_POST)) {
    loadPicTemplate("albummanager.phtml");
    exit();
}

if (empty($_GET["action"])) {
    sendError(400);
}

if ($_GET["action"] === "create") {
    if (empty($_POST["name"])) {
        sendError(400);
    }
    $pathID = Access::verifyCurrentPathAccess();

    $insert = PicDB::newInsert();
    $insert->into("albums")
        ->cols(array(
            "name" => $_POST["name"],
            "user_id" => USER_ID,
            "path_id" => $pathID,
        ));
    PicDB::crud($insert);

    header("Content-type: text/plain");
    echo PicDB::lastInsertId();
} elseif ($_GET["action"] === "edit") {
    if (empty($_POST["album"]) || empty($_POST["name"])) {
        sendError(400);
    }
    $albumDetails = loadPicFile("helpers/albums/load.php", array("albumID" => (int) $_POST["album"]));
    if (!$albumDetails) {
        sendError(404);
    } elseif ($albumDetails["user_id"] !== USER_ID) {
        sendError(404);
    }

    $update = PicDB::newUpdate();
    $update->table("albums")
        ->cols(array("name" => $_POST["name"]))
        ->where("id = :id")
        ->bindValue("id", (int) $_POST["album"]);
    PicDB::crud($update);
} else {
    sendError(404);
}
