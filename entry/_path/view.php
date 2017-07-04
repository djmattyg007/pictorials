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

$mainSelect = PicDB::newSelect();
$mainSelect->cols(array("name", "path", "sort_order"))
    ->from("paths")
    ->where("id = :id")
    ->bindValue("id", $pathID);
$mainRow = PicDB::fetch($mainSelect, "one");

$permSelect = PicDB::newSelect();
$permSelect->cols(array("permission"))
    ->from("path_permissions")
    ->where("path_id = :path_id")
    ->orderBy(array("permission ASC"))
    ->bindValue("path_id", $pathID);
$permissions = PicDB::fetch($permSelect, "col");

$accessSelect = PicDB::newSelect();
$accessSelect->cols(array("id_type", "auth_id"))
    ->from("path_access")
    ->where("path_id = :path_id")
    ->where("auth_type = :auth_type")
    ->bindValue("path_id", $pathID);

$accessSelect->bindValue("auth_type", "allow");
$allowRows = PicDB::fetch($accessSelect, "group");
$accessSelect->bindValue("auth_type", "deny");
$denyRows = PicDB::fetch($accessSelect, "group");

$io->outln(sprintf("<<blue>>Name:<<reset>> %s", $mainRow["name"]));
$io->outln(sprintf("<<blue>>Path:<<reset>> %s", $mainRow["path"]));
$io->outln(sprintf("<<blue>>Sort order:<<reset>> %s", $mainRow["sort_order"]));
if (empty($permissions)) {
    $io->outln("<<blue>>Permissions:<<reset>> None");
} else {
    $io->outln(sprintf("<<blue>>Permissions:<<reset>> %s", implode(", ", $permissions)));
}

$gSelect = PicDB::newSelect();
$gSelect->cols(array("name"))
    ->from("groups")
    ->where("id IN (:ids)");

$uSelect = PicDB::newSelect();
$uSelect->cols(array("name", "username"))
    ->from("users")
    ->where("id IN (:ids)");

$io->outln("<<blue>>Allowed access:<<reset>>");
$io->out("  <<blue>>Groups:<<reset>>");
if (empty($allowRows["groups"])) {
    $io->outln(" None");
} else {
    $io->outln("");
    $gSelect->bindValue("ids", array_map("intval", $allowRows["groups"]));
    $groupNames = PicDB::fetch($gSelect, "col");
    foreach ($groupNames as $groupName) {
        $io->outln(sprintf("   - %s", $groupName));
    }
}
$io->out("  <<blue>>Users:<<reset>>");
if (empty($allowRows["users"])) {
    $io->outln(" None");
} else {
    $io->outln("");
    $uSelect->bindValue("ids", array_map("intval", $allowRows["users"]));
    $userRows = PicDB::fetch($uSelect, "all");
    foreach ($userRows as $userRow) {
        $io->outln(sprintf('   - %1$s (%2$s)', $userRow["name"], $userRow["username"]));
    }
}

$io->outln("<<blue>>Denied access:<<reset>>");
$io->out("  <<blue>>Groups:<<reset>> ");
if (empty($denyRows["groups"])) {
    $io->outln("None");
} else {
    $io->outln("");
    $gSelect->bindValue("ids", array_map("intval", $denyRows["groups"]));
    $groupNames = PicDB::fetch($gSelect, "col");
    foreach ($groupNames as $groupName) {
        $io->outln(sprintf("   - %s", $groupName));
    }
}
$io->out("  <<blue>>Users:<<reset>>");
if (empty($denyRows["users"])) {
    $io->outln(" None");
} else {
    $io->outln("");
    $uSelect->bindValue("ids", array_map("intval", $denyRows["users"]));
    $userRows = PicDB::fetch($uSelect, "all");
    foreach ($userRows as $userRow) {
        $io->outln(sprintf('   - %1$s (%2$s)', $userRow["name"], $userRow["username"]));
    }
}
