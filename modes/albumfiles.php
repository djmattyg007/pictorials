<?php

if (empty($_GET["action"])) {
    sendError(400);
}

if ($_GET["action"] === "add") {
    if (empty($_POST["files"]) || is_array($_POST["files"]) === false) {
        sendError(400);
    }
    $album = Access::getCurrentAlbum();

    $select = PicDB::newSelect();
    $select->cols(array("file"))
        ->from("album_files")
        ->where("album_id = :album_id")
        ->where("file IN (:files)")
        ->bindValue("album_id", $album->id)
        ->bindValue("files", $_POST["files"]);
    $alreadyAddedFiles = PicDB::fetch($select, "col");

    $filesToAdd = array_diff($_POST["files"], $alreadyAddedFiles);

    if (count($filesToAdd)) {
        $insert = PicDB::newInsert();
        $insert->into("album_files");
        $insert->addRows(array_map(function($file) use ($album) {
            return array("album_id" => $album->id, "file" => $file);
        }, $filesToAdd));
        PicDB::crud($insert);
    }

    header("Content-type: text/plain");
    echo count($filesToAdd);
} else {
    sendError(404);
}
