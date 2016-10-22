<?php

$select = PicDB::newSelect();
$select->cols(array("path_id", "files"))
    ->from("shares")
    ->where("share_id = :share_id")
    ->bindValue("share_id", $shareID);
$row = PicDB::fetch($select, "one");
if ($row) {
    return array($row["path_id"], explode(PATH_SEPARATOR, $row["files"]));
} else {
    return null;
}
