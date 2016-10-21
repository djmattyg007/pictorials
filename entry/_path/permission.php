<?php

PicCLI::initGetopt(array("add", "remove"));
$io = PicCLI::getIO();

if (PicCLI::getGetopt("--add")) {
    $mode = "add";
} elseif (PicCLI::getGetopt("--remove")) {
    $mode = "remove";
} else {
    $io->errln("No mode specified.");
    exit(PicCLI::EXIT_USAGE);
}

if (!($pathID = PicCLI::getGetopt(1))) {
    $io->errln("No path ID specified.");
    exit(PicCLI::EXIT_USAGE);
}
if (!is_numeric($pathID)) {
    $io->errln("Invalid path ID specified.");
    exit(PicCLI::EXIT_INPUT);
}
$pathID = (int) $pathID;

loadPicFile("classes/db.php");
PicDB::initDB();
if (!loadPicFile("helpers/id/path.php", array("id" => $pathID))) {
    $io->errln(sprintf("Path %d does not exist.", $pathID));
    exit(PicCLI::EXIT_INPUT);
}

if (!($permission = PicCLI::getGetopt(2))) {
    $permission = PicCLI::prompt("Permission");
    if (!$permission) {
        $io->errln("No permission specified.");
        exit(PicCLI::EXIT_INPUT);
    }
}
if (!in_array($permission, array("gps", "metadata", "nsfw", "symlinks"))) {
    $io->errln("Invalid permission supplied.");
    exit(PicCLI::EXIT_INPUT);
}

$select = PicDB::newSelect();
$select->cols(array("id"))
    ->from("path_permissions")
    ->where("path_id = :path_id")
    ->where("permission = :permission")
    ->bindValues(array(
        "path_id" => $pathID,
        "permission" => $permission,
    ));
$row = PicDB::fetch($select, "one");

if ($row && $mode === "add") {
    PicCLI::warn(sprintf('Path \'%1$s\' already has the \'%2$s\' permission.', $pathID, $permission));
    exit();
} elseif ((!$row) && $mode === "remove") {
    PicCLI::warn(sprintf('Path \'%1$s\' already doesn\'t have the \'%2$s\' permission.', $pathID, $permission));
    exit();
}

if ($mode === "add") {
    $insert = PicDB::newInsert();
    $insert->into("path_permissions")
        ->cols(array(
            "path_id" => $pathID,
            "permission" => $permission,
        ));
    PicDB::crud($insert);
} elseif ($mode === "remove") {
    $delete = PicDB::newDelete();
    $delete->from("path_permissions")
        ->where("id = :id")
        ->bindValue("id", $row["id"]);
    PicDB::crud($delete);
}
PicCLI::success();
