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

$groupId = loadPicFile("helpers/id/group.php", array("name" => $name));
if (!$groupId) {
    $io->errln(sprintf("Group '%s' does not exist.", $name));
    exit(PicCLI::EXIT_INPUT);
}

$delete = PicDB::newDelete();
$delete->from("groups")
    ->where("id = :id")
    ->bindValue("id", $groupId);
PicDB::crud($delete);
PicCLI::success();
