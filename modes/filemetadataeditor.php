<?php

if (Access::modeCheckAny("manage") === false) {
    sendError(404);
}

if (empty($_GET["action"])) {
    sendError(404);
}

$validateData = function($field) {
    if (isset($_POST[$field]) && is_string($_POST[$field]) && !empty(trim($_POST[$field]))) {
        return trim($_POST[$field]);
    } else {
        return "";
    }
};
$validateArrayData = function($field) {
    if (isset($_POST[$field]) && is_array($_POST[$field])) {
        return array_unique(array_filter(array_map("trim", $_POST[$field])));
    } else {
        return array();
    }
};

$path = Access::getCurrentPath();
if ($_GET["action"] === "getform") {
    loadPicFile("helpers/checkfilepath.php");
    $filename = $_POST["filename"];

    $file = loadPicFile("helpers/filemetadata/load.php", array("pathID" => $path->id, "filename" => $filename));
    if ($file === null) {
        // Prepare dummy file object
        $file = new PicFile(0, $filename, $path->id, "", "", "", "");
    }
    loadPicTemplate("filemetadataeditor.phtml", array("file" => $file));
} elseif ($_GET["action"] === "update") {
    if (isset($_POST["fileid"]) === false) {
        sendError(400);
    }
    loadPicFile("helpers/checkfilepath.php");
    $filename = $_POST["filename"];

    $file = loadPicFile("helpers/filemetadata/load.php", array("pathID" => $path->id, "filename" => $filename));
    if ($file === null && $_POST["fileid"] !== "0") {
        sendError(400);
    } elseif ($file !== null && $_POST["fileid"] === "0") {
        sendError(400);
    } elseif ($file !== null && ((int) $_POST["fileid"]) !== $file->id) {
        sendError(400);
    }

    PicDB::beginTransaction();
    if ($file === null) {
        $insert = PicDB::newInsert();
        $insert->into("file_metadata")
            ->cols(array(
                "path_id" => $path->id,
                "file" => $filename,
                "title" => $validateData("title"),
                "description" => $validateData("description"),
                "author" => $validateData("author"),
                "location" => $validateData("location"),
            ));
        PicDB::crud($insert);
        $fileId = PicDB::lastInsertId();

        if ($people = $validateArrayData("people")) {
            $peopleInsert = PicDB::newInsert();
            $peopleInsert->into("file_metadata_people")
                ->addRows(array_map(function($name) use ($fileId) {
                    return array("file_id" => $fileId, "name" => $name);
                }, $people));
            PicDB::crud($peopleInsert);
        }
        if ($tags = $validateArrayData("tags")) {
            $tagsInsert = PicDB::newInsert();
            $tagsInsert->into("file_metadata_tags")
                ->addRows(array_map(function($tag) use ($fileId) {
                    return array("file_id" => $fileId, "tag" => $tag);
                }, $tags));
            PicDB::crud($tagsInsert);
        }
    } else {
        $update = PicDB::newUpdate();
        $update->table("file_metadata")
            ->cols(array(
                "title" => $validateData("title"),
                "description" => $validateData("description"),
                "author" => $validateData("author"),
                "location" => $validateData("location"),
            ))
            ->where("id = :id")
            ->where("path_id = :path_id")
            ->where("file = :file")
            ->bindValue("id", $file->id)
            ->bindValue("path_id", $path->id)
            ->bindValue("file", $filename);
        PicDB::crud($update);

        $peopleCurrent = $validateArrayData("people");
        $peopleNew = array_diff($peopleCurrent, $file->people);
        $peopleRemove = array_diff($file->people, $peopleCurrent);

        if (!empty($peopleRemove)) {
            $peopleDelete = PicDB::newDelete();
            $peopleDelete->from("file_metadata_people")
                ->where("file_id = :file_id")
                ->where("name IN (:names)")
                ->bindValue("file_id", $file->id)
                ->bindValue("names", $peopleRemove);
            PicDB::crud($peopleDelete);
        }
        if (!empty($peopleNew)) {
            $peopleInsert = PicDB::newInsert();
            $peopleInsert->into("file_metadata_people")
                ->addRows(array_map(function($name) use ($file) {
                    return array("file_id" => $file->id, "name" => $name);
                }, $peopleNew));
            PicDB::crud($peopleInsert);
        }

        $tagsCurrent = $validateArrayData("tags");
        $tagsNew = array_diff($tagsCurrent, $file->tags);
        $tagsRemove = array_diff($file->tags, $tagsCurrent);

        if (!empty($tagsRemove)) {
            $tagsDelete = PicDB::newDelete();
            $tagsDelete->from("file_metadata_tags")
                ->where("file_id = :file_id")
                ->where("tag IN (:tags)")
                ->bindValue("file_id", $file->id)
                ->bindValue("tags", $tagsRemove);
            PicDB::crud($tagsDelete);
        }
        if (!empty($tagsNew)) {
            $tagsInsert = PicDB::newInsert();
            $tagsInsert->into("file_metadata_tags")
                ->addRows(array_map(function($tag) use ($file) {
                    return array("file_id" => $file->id, "tag" => $tag);
                }, $tagsNew));
            PicDB::crud($tagsInsert);
        }
    }
    PicDB::commit();
} elseif ($_GET["action"] === "getautocompletedata") {
    $authorSelect = PicDB::newSelect();
    $authorSelect->cols(array("author"))
        ->from("file_metadata")
        ->distinct()
        ->where("path_id = :path_id")
        ->bindValue("path_id", $path->id);

    $locationSelect = PicDB::newSelect();
    $locationSelect->cols(array("location"))
        ->from("file_metadata")
        ->distinct()
        ->where("path_id = :path_id")
        ->bindValue("path_id", $path->id);

    $peopleSelect = PicDB::newSelect();
    $peopleSelect->cols(array("p.name"))
        ->from("file_metadata_people p")
        ->distinct()
        ->join("inner", "file_metadata AS f", "f.id = p.file_id")
        ->where("f.path_id = :path_id")
        ->bindValue("path_id", $path->id);

    $tagsSelect = PicDB::newSelect();
    $tagsSelect->cols(array("t.tag"))
        ->from("file_metadata_tags t")
        ->distinct()
        ->join("inner", "file_metadata AS f", "f.id = t.file_id")
        ->where("f.path_id = :path_id")
        ->bindValue("path_id", $path->id);

    $autocompleteData = array(
        "author" => PicDB::fetch($authorSelect, "col"),
        "location" => PicDB::fetch($locationSelect, "col"),
        "people" => PicDB::fetch($peopleSelect, "col"),
        "tags" => PicDB::fetch($tagsSelect, "col"),
    );
    header("Content-type: application/json");
    echo json_encode($autocompleteData);
} else {
    sendError(404);
}
