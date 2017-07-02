<?php

if (empty($_GET["action"])) {
    $album = Access::getCurrentAlbum();
    $files = array_map(function($relpath) {
        return array("relpath" => $relpath);
    }, $album->sortedFiles);
    header("Content-type: application/json");
    echo json_encode($files);
    exit();
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
        $sortOrderSelect = PicDB::newSelect();
        $sortOrderSelect->cols(array("MAX(sort_order) as max_sort_order"))
            ->from("album_files")
            ->where("album_id = :album_id")
            ->bindValue("album_id", $album->id);
        $nextSortOrder = ((int) PicDB::fetch($sortOrderSelect, "value")) + 1;

        $insert = PicDB::newInsert();
        $insert->into("album_files");
        $insert->addRows(array_map(function($file) use ($album, &$nextSortOrder) {
            return array("album_id" => $album->id, "file" => $file, "sort_order" => $nextSortOrder++);
        }, $filesToAdd));
        PicDB::crud($insert);
    }

    header("Content-type: text/plain");
    echo count($filesToAdd);
} elseif ($_GET["action"] === "save") {
    if (empty($_POST["files"]) || is_array($_POST["files"]) === false) {
        sendError(400);
    }
    $album = Access::getCurrentAlbum();

    PicDB::beginTransaction();

    $delete = PicDB::newDelete();
    $delete->from("album_files")
        ->where("album_id = :album_id")
        ->where("file NOT IN (:still_alive_files)")
        ->bindValue("album_id", $album->id)
        ->bindValue("still_alive_files", $_POST["files"]);
    PicDB::crud($delete);

    $update = PicDB::newUpdate();
    $update->table("album_files")
        ->where("file = :file")
        ->where("album_id = :album_id")
        ->bindValue("album_id", $album->id);
    for ($x = 0; $x < count($_POST["files"]); $x++) {
        $fileUpdate = clone $update;
        $fileUpdate->cols(array("sort_order" => ($x + 1)))
            ->bindValue("file", $_POST["files"][$x]);
        PicDB::crud($fileUpdate);
    }

    PicDB::commit();
} else {
    sendError(404);
}
