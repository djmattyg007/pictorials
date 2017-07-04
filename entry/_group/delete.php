<?php

PicCLI::initGetopt(array());
$io = PicCLI::getIO();

if (!($name = PicCLI::getGetopt(1))) {
    $name = PicCLI::prompt("Name");
    if (!$name) {
        $io->errln("No name specified.");
        exit(PicCLI::EXIT_INPUT);
    }
}

loadPicFile("classes/db.php");
PicDB::initDB();

$groupID = loadPicFile("helpers/id/group.php", array("name" => $name));
if (!$groupID) {
    $io->errln(sprintf("Group '%s' does not exist.", $name));
    exit(PicCLI::EXIT_INPUT);
}

PicDB::beginTransaction();

$delete = PicDB::newDelete();
$delete->from("groups")
    ->where("id = :id")
    ->bindValue("id", $groupID);
PicDB::crud($delete);

$pathAccessDelete = PicDB::newDelete();
$pathAccessDelete->from("path_access")
    ->where("id_type = :id_type")
    ->where("auth_id = :auth_id")
    ->bindValue("id_type", "groups")
    ->bindValue("auth_id", $groupID);
PicDB::crud($pathAccessDelete);

PicDB::commit();
PicCLI::success();
