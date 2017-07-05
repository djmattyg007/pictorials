<?php

if (Access::modeCheckAny(array("manage", "view_album")) === false) {
    sendError(404);
}

if (empty($_GET["action"])) {
    $album = Access::getCurrentAlbum();
    $canNSFW = $album->path->hasPermission("nsfw");
    $files = array_map(function($relpath) use ($canNSFW) {
        if ($canNSFW === false) {
            $nsfwRegexPathTest = preg_match("/.*\/NSFW\/.*/", $relpath);
            if ($nsfwRegexPathTest !== 0) {
                sendError(500);
            }
            $nsfwRegexPathTest = preg_match("/NSFW\/.*/", $relpath);
            if ($nsfwRegexPathTest !== 0) {
                sendError(500);
            }
        }
        return array(
            "filename" => basename($relpath),
            "relpath" => $relpath,
        );
    }, $album->sortedFiles);
    header("Content-type: application/json");
    echo json_encode($files);
    exit();
}

if (Access::modeCheckAny("manage") === false) {
    sendError(404);
}

if ($_GET["action"] === "add") {
    if (empty($_POST["files"]) || is_array($_POST["files"]) === false) {
        sendError(400);
    }
    $album = Access::getCurrentAlbum();
    $files = $_POST["files"];

    if ($album->path->hasPermission("nsfw") === false) {
        foreach ($files as $file) {
            $nsfwRegexPathTest = preg_match("/.*\/NSFW\/.*/", $file);
            if ($nsfwRegexPathTest !== 0) {
                sendError(400);
            }
            $nsfwRegexPathTest = preg_match("/NSFW\/.*/", $file);
            if ($nsfwRegexPathTest !== 0) {
                sendError(400);
            }
        }
    }

    $select = PicDB::newSelect();
    $select->cols(array("file"))
        ->from("album_files")
        ->where("album_id = :album_id")
        ->where("file IN (:files)")
        ->bindValue("album_id", $album->id)
        ->bindValue("files", $files);
    $alreadyAddedFiles = PicDB::fetch($select, "col");

    $filesToAdd = array_diff($files, $alreadyAddedFiles);

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
    $files = $_POST["files"];

    if ($album->path->hasPermission("nsfw") === false) {
        foreach ($files as $file) {
            $nsfwRegexPathTest = preg_match("/.*\/NSFW\/.*/", $file);
            if ($nsfwRegexPathTest !== 0) {
                sendError(400);
            }
            $nsfwRegexPathTest = preg_match("/NSFW\/.*/", $file);
            if ($nsfwRegexPathTest !== 0) {
                sendError(400);
            }
        }
    }

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
