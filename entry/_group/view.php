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

$uidSelect = PicDB::newSelect();
$uidSelect->cols(array("user_id"))
    ->from("group_memberships")
    ->where("group_id = :group_id")
    ->bindValue("group_id", $groupId);
$userIds = PicDB::fetch($uidSelect, "col");

$io->outln(sprintf("<<blue>>Group:<<reset>> %s", $name));
if (empty($userIds)) {
    $io->outln("No users assigned.");
} else {
    $uSelect = PicDB::newSelect();
    $uSelect->cols(array("name", "username"))
        ->from("users")
        ->where("id IN (:ids)")
        ->bindValue("ids", array_map("intval", $userIds));
    $userDetails = PicDB::fetch($uSelect, "all");
    $io->outln("<<blue>>Users:<<reset>>");
    foreach ($userDetails as $user) {
        $io->outln(sprintf(' - %1$s (%2$s)', $user["name"], $user["username"]));
    }
}
