<?php

/** @var $pathID int */

$pathSelect = PicDB::newSelect();
$pathSelect->cols(array("name", "path"))
    ->from("paths")
    ->where("id = :id")
    ->bindValue("id", $pathID);
$pathDetails = PicDB::fetch($pathSelect, "one");

$permSelect = PicDB::newSelect();
$permSelect->cols(array("permission"))
    ->from("path_permissions")
    ->where("path_id = :path_id")
    ->bindValue("path_id", $pathID);
$permissions = PicDB::fetch($permSelect, "col");

return new PicPath($pathID, $pathDetails["name"], $pathDetails["path"], $permissions);
