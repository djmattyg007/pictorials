<?php

if (empty($_POST["album"])) {
    Access::verifyCurrentModeAccess(array("manage", "view_album"));

    $albumSelect = PicDB::newSelect();
    $albumSelect->cols(array("id", "name", "path_id"))
        ->from("albums")
        ->where("id IN (:ids)");
    if ($_GET["access_mode"] === "manage") {
        $albumSelect->bindValue("ids", Access::getAllowedManageAlbums());
    } elseif ($_GET["access_mode"] === "view_album") {
        $albumSelect->bindValue("ids", Access::getAllowedViewAlbums());
    } else {
        sendError(404);
    }
    if (!empty($_POST["path"])) {
        $path = Access::getCurrentPath();
        $albumSelect->where("path_id = :path_id")
            ->bindValue("path_id", $path->id);
    }
    $albums = PicDB::fetch($albumSelect, "all");
    header("Content-type: application/json");
    echo json_encode($albums);
    exit();
}

Access::verifyCurrentModeAccess(array("manage"));

$album = Access::getCurrentAlbum();
header("Content-type: application/json");
echo json_encode($album);
