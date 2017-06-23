<?php

/** @var $albumID int */

$select = PicDB::newSelect();
$select->cols(array("name", "path_id", "user_id"))
    ->from("albums")
    ->where("id = :id")
    ->bindValue("id", $albumID);
$row = PicDB::fetch($select, "one");
if ($row) {
    return array("name" => $row["name"], "path_id" => (int) $row["path_id"], "path_id" => (int) $row["user_id"]);;
} else {
    return null;
}
