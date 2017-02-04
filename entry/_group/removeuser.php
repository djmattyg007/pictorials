<?php

PicCLI::initGetopt(array());
$io = PicCLI::getIO();

if (!($groupName = PicCLI::getGetopt(1))) {
    $groupName = PicCLI::prompt("Group");
    if (!$groupName) {
        $io->errln("No group specified.");
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

loadPicFile("classes/db.php");
PicDB::initDB();

$groupId = loadPicFile("helpers/id/group.php", array("name" => $groupName));
if (!$groupId) {
    $io->errln(sprintf("Group '%s' does not exist.", $groupName));
    exit(PicCLI::EXIT_INPUT);
}
$userId = loadPicFile("helpers/id/user.php", array("username" => $username));
if (!$userId) {
    $io->errln(sprintf("User '%s' does not exist.", $username));
    exit(PicCLI::EXIT_INPUT);
}

$select = PicDB::newSelect();
$select->cols(array("id"))
    ->from("group_memberships")
    ->where("group_id = :group_id")
    ->where("user_id = :user_id")
    ->bindValues(array(
        "group_id" => $groupId,
        "user_id" => $userId,
    ));
if (!PicDB::fetch($select, "one")) {
    PicCLI::warn(sprintf('User \'%1$s\' is not a member of group \'%2$s\'.', $username, $groupName));
    exit();
}

$delete = PicDB::newDelete();
$delete->from("group_memberships")
    ->where("group_id = :group_id")
    ->where("user_id = :user_id")
    ->bindValues(array(
        "group_id" => $groupId,
        "user_id" => $userId,
    ));
PicDB::crud($delete);
PicCLI::success();
