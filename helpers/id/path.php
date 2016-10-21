<?php

$select = PicDB::newSelect();
$select->cols(array("id"))
    ->from("paths")
    ->where("id = :id")
    ->bindValue("id", $id);
if (PicDB::fetch($select, "one")) {
    return true;
} else {
    return false;
}
