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

$insert = PicDB::newInsert();
$insert->into("groups")
    ->cols(array(
        "name" => $name,
    ));
PicDB::crud($insert);
PicCLI::success();
