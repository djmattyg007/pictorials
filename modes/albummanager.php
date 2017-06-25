<?php

if (empty($_POST)) {
    $albumSelect = PicDB::newSelect();
    $albumSelect->cols(array("id", "name"))
        ->from("albums")
        ->where("user_id = :user_id")
        ->bindValue("user_id", USER_ID);
    $pathSelect = PicDB::newSelect();
    $pathSelect->cols(array("id", "name"))
        ->from("paths")
        ->where("id IN (:ids)")
        ->bindValue("ids", Access::getAllowedPaths());
    $templateVars = array(
        "albums" => PicDB::fetch($albumSelect, "pairs"),
        "paths" => PicDB::fetch($pathSelect, "pairs"),
    );
    loadPicTemplate("albummanager.phtml", $templateVars);
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
            "name" => trim($_POST["name"]),
            "user_id" => USER_ID,
            "path_id" => $pathID,
        ));
    PicDB::crud($insert);

    header("Content-type: text/plain");
    echo PicDB::lastInsertId();
} elseif ($_GET["action"] === "edit") {
    if (empty($_POST["name"])) {
        sendError(400);
    }
    $album = Access::getCurrentAlbum();

    $update = PicDB::newUpdate();
    $update->table("albums")
        ->cols(array("name" => trim($_POST["name"])))
        ->where("id = :id")
        ->bindValue("id", $album->id);
    PicDB::crud($update);
} elseif ($_GET["action"] === "delete") {
    $album = Access::getCurrentAlbum();

    $delete = PicDB::newDelete();
    $delete->from("albums")
        ->where("id = :id")
        ->bindValue("id", $album->id);
    PicDB::crud($delete);
} else {
    sendError(404);
}
