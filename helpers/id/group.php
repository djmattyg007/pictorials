<?php

$select = PicDB::newSelect();
$select->cols(array("id"))
    ->from("groups")
    ->where("name = :name")
    ->bindValue("name", $name);
$id = PicDB::fetch($select, "value");
if ($id) {
    return (int) $id;
} else {
    return null;
}
