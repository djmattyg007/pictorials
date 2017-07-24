<?php

if (Access::modeCheckAny("manage") === false) {
    sendError(404);
}

if (empty($_GET["action"])) {
    sendError(404);
}

$validateData = function($field) {
    if (isset($_POST[$field]) && !empty(trim($_POST[$field]))) {
        return trim($_POST[$field]);
    } else {
        return "";
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
    }
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
