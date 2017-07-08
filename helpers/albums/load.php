<?php

/** @var $albumID int */

$select = PicDB::newSelect();
$select->cols(array("name", "path_id"))
    ->from("albums")
    ->where("id = :id")
    ->bindValue("id", $albumID);
$row = PicDB::fetch($select, "one");
if ($row) {
    return new PicAlbum($albumID, $row["name"], (int) $row["path_id"]);
} else {
    return null;
}
