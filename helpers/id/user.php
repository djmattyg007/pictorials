<?php

$select = PicDB::newSelect();
$select->cols(array("id"))
    ->from("users")
    ->where("username = :username")
    ->bindValue("username", $username);
$id = PicDB::fetch($select, "value");
if ($id) {
    return (int) $id;
} else {
    return null;
}
