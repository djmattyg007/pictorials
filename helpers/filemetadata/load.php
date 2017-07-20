<?php

/** @var $filename string */
/** @var $pathID int */

$select = PicDB::newSelect();
$select->cols(array("id", "title", "description", "author", "location"))
    ->from("file_metadata")
    ->where("file = :file")
    ->where("path_id = :path_id")
    ->bindValue("file", $filename)
    ->bindValue("path_id", $pathID);
$row = PicDB::fetch($select, "one");
if ($row) {
    return new PicFile((int) $row["id"], $filename, $pathID, $row["title"], $row["description"], $row["author"], $row["location"]);
} else {
    return null;
}
