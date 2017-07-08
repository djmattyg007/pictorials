<?php

if (Access::modeCheckAny("manage") === false) {
    sendError(404);
}

if (empty($_POST)) {
    $albumSelect = PicDB::newSelect();
    $albumSelect->cols(array("id", "name"))
        ->from("albums")
        ->where("id IN (:ids)")
        ->bindValue("ids", Access::getAllowedManageAlbums());
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

    PicDB::beginTransaction();
    $insert = PicDB::newInsert();
    $insert->into("albums")
        ->cols(array(
            "name" => trim($_POST["name"]),
            "path_id" => $pathID,
        ));
    PicDB::crud($insert);
    $albumID = PicDB::lastInsertId();

    $manageAccessInsert = PicDB::newInsert();
    $manageAccessInsert->into("manage_album_access")
        ->cols(array(
            "album_id" => $albumID,
            "auth_type" => "allow",
            "id_type" => "users",
            "auth_id" => USER_ID,
        ));
    PicDB::crud($manageAccessInsert);
    PicDB::commit();
    PicConfCache::remove("managealbumauth.json");

    header("Content-type: text/plain");
    echo PicDB::lastInsertId();
} elseif ($_GET["action"] === "edit") {
    if (empty($_POST["name"])) {
        sendError(400);
    }
    $_GET["access_mode"] = "manage";
    $album = Access::getCurrentAlbum();

    $update = PicDB::newUpdate();
    $update->table("albums")
        ->cols(array("name" => trim($_POST["name"])))
        ->where("id = :id")
        ->bindValue("id", $album->id);
    PicDB::crud($update);
} elseif ($_GET["action"] === "delete") {
    $_GET["access_mode"] = "manage";
    $album = Access::getCurrentAlbum();

    $delete = PicDB::newDelete();
    $delete->from("albums")
        ->where("id = :id")
        ->bindValue("id", $album->id);
    PicDB::crud($delete);
    PicConfCache::remove("managealbumauth.json");
} else {
    sendError(404);
}
