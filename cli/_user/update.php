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

if (!($name = PicCLI::getGetopt(2))) {
    $name = PicCLI::prompt("New name");
    if (!$name) {
        $io->errln("No new name specified.");
        exit(PicCLI::EXIT_INPUT);
    }
}

loadPicFile("classes/db.php");
PicDB::initDB();

$userId = loadPicFile("helpers/id/user.php", array("username" => $username));
if (!$userId) {
    $io->errln(sprintf("User '%s' does not exist.", $username));
    exit(PicCLI::EXIT_INPUT);
}

$update = PicDB::newUpdate();
$update->table("users")
    ->cols(array("name" => $name))
    ->where("id = :id")
    ->bindValue("id", $userId);
PicDB::crud($update);
PicCLI::success();
