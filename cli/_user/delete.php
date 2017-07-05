<?php

PicCLI::initGetopt(array());
$io = PicCLI::getIO();

if (!($username = PicCLI::getGetopt(1))) {
    $username = PicCLI::prompt("Username");
    if (!$username) {
        $io->errln("No username specified.");
        exit(PicCLI::EXIT_INPUT);
    }
}

loadPicFile("classes/db.php");
PicDB::initDB();

$userID = loadPicFile("helpers/id/user.php", array("username" => $username));
if (!$userID) {
    $io->errln(sprintf("User '%s' does not exist.", $username));
    exit(PicCLI::EXIT_INPUT);
}

PicDB::beginTransaction();

$delete = PicDB::newDelete();
$delete->from("users")
    ->where("id = :id")
    ->bindValue("id", $userID);
PicDB::crud($delete);

$modeAccessDelete = PicDB::newDelete();
$modeAccessDelete->from("mode_access")
    ->where("id_type = :id_type")
    ->where("auth_id = :auth_id")
    ->bindValue("id_type", "users")
    ->bindValue("auth_id", $userID);
PicDB::crud($modeAccessDelete);

$pathAccessDelete = PicDB::newDelete();
$pathAccessDelete->from("path_access")
    ->where("id_type = :id_type")
    ->where("auth_id = :auth_id")
    ->bindValue("id_type", "users")
    ->bindValue("auth_id", $userID);
PicDB::crud($pathAccessDelete);

PicDB::commit();
PicCLI::success();
