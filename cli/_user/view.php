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

$userId = loadPicFile("helpers/id/user.php", array("username" => $username));
if (!$userId) {
    $io->errln(sprintf("User '%s' does not exist.", $username));
    exit(PicCLI::EXIT_INPUT);
}

$select = PicDB::newSelect();
$select->cols(array("name"))
    ->from("users")
    ->where("username = :username")
    ->bindValue("username", $username);
$name = PicDB::fetch($select, "value");

$gidSelect = PicDB::newSelect();
$gidSelect->cols(array("group_id"))
    ->from("group_memberships")
    ->where("user_id = :user_id")
    ->bindValue("user_id", $userId);
$groupIds = PicDB::fetch($gidSelect, "col");

$io->outln(sprintf("<<blue>>Name:<<reset>> %s", $name));
if (empty($groupIds)) {
    $io->outln("Not assigned to any groups.");
} else {
    $gSelect = PicDB::newSelect();
    $gSelect->cols(array("name"))
        ->from("groups")
        ->where("id IN (:ids)")
        ->bindValue("ids", array_map("intval", $groupIds));
    $groupNames = PicDB::fetch($gSelect, "col");
    $io->outln("<<blue>>Groups:<<reset>>");
    foreach ($groupNames as $groupName) {
        $io->outln(sprintf(' - %s', $groupName));
    }
}
