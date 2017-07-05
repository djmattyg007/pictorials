<?php

if (Access::modeCheckAny(array("manage", "view_album")) === false) {
    sendError(404);
}

if (empty($_POST["album"])) {
    $albumSelect = PicDB::newSelect();
    $albumSelect->cols(array("id", "name", "path_id"))
        ->from("albums")
        ->where("user_id = :user_id")
        ->bindValue("user_id", USER_ID);
    if (!empty($_POST["path"])) {
        $path = Access::getCurrentPath();
        $albumSelect->where("path_id = :path_id")
            ->bindValue("path_id", $path->id);
    }
    $albums = PicDB::fetch($albumSelect, "all");
    header("Content-type: application/json");
    echo json_encode($albums);
} else {
    $album = Access::getCurrentAlbum();
    header("Content-type: application/json");
    echo json_encode($album);
}
