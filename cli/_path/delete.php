<?php

PicCLI::initGetopt(array());
$io = PicCLI::getIO();

if (!($pathID = PicCLI::getGetopt(1))) {
    $io->errln("No path ID specified.");
    exit(PicCLI::EXIT_USAGE);
}
if (!is_numeric($pathID)) {
    $io->errln("Invalid path ID supplied.");
    exit(PicCLI::EXIT_INPUT);
}
$pathID = (int) $pathID;

loadPicFile("classes/db.php");
PicDB::initDB();
if (!loadPicFile("helpers/id/path.php", array("id" => $pathID))) {
    $io->errln(sprintf("Path %d does not exist.", $pathID));
    exit(PicCLI::EXIT_INPUT);
}

$delete = PicDB::newDelete();
$delete->from("paths")
    ->where("id = :id")
    ->bindValue("id", $pathID);
PicDB::crud($delete);

PicConfCache::remove("pathauth.json");
PicCLI::success();
