<?php

header("Content-type: application/json");
if (empty($_POST["album"])) {
    $albumSelect = PicDB::newSelect();
    $albumSelect->cols(array("id", "name"))
        ->from("albums")
        ->where("user_id = :user_id")
        ->bindValue("user_id", USER_ID);
    if (!empty($_POST["path"])) {
        $path = Access::getCurrentPath();
        $albumSelect->where("path_id = :path_id")
            ->bindValue("path_id", $path->id);
    }
    echo json_encode(PicDB::fetch($albumSelect, "pairs"));
} else {
    $album = Access::getCurrentAlbum();
    echo json_encode($album);
}
