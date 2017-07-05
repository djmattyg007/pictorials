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
if (!($username = PicCLI::getGetopt(2))) {
    $username = PicCLI::prompt("Username");
    if (!$username) {
        $io->errln("No username specified.");
        exit(PicCLI::EXIT_INPUT);
    }
}
if (!($password = PicCLI::getGetopt(3))) {
    $password = PicCLI::prompt("Password");
    if (!$password) {
        $io->errln("No password specified.");
        exit(PicCLI::EXIT_INPUT);
    }
}

loadPicFile("classes/db.php");
PicDB::initDB();

$insert = PicDB::newInsert();
$insert->into("users")
    ->cols(array(
        "name" => $name,
        "username" => $username,
        "password" => password_hash($password, PASSWORD_DEFAULT),
    ));
PicDB::crud($insert);
PicCLI::success();
