<?php

PicCLI::initGetopt(array("name:", "path:", "sortorder:"));
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

$updateValues = array();

if ($name = PicCLI::getGetopt("--name")) {
    $updateValues["name"] = $name;
}
if ($path = PicCLI::getGetopt("--path")) {
    if ($path[0] !== "/") {
        $io->errln("Paths must be absolute, not relative.");
        exit(PicCLI::EXIT_INPUT);
    }
    $updateValues["path"] = rtrim($path, "/") . "/";
}
if ($sortOrder = PicCLI::getGetopt("--sortorder")) {
    $sortOrder = (int) $sortOrder;
    if ($sortOrder <= 0) {
        $io->errln("Sort orders must be above zero.");
        exit(PicCLI::EXIT_INPUT);
    }
    $updateValues["sort_order"] = $sortOrder;
}

if (empty($updateValues)) {
    $io->errln("No updates specified.");
    exit(PicCLI::EXIT_USAGE);
}

$update = PicDB::newUpdate();
$update->table("paths")
    ->cols($updateValues)
    ->where("id = :id")
    ->bindValues(array("id" => $pathID));
PicDB::crud($update);
PicCLI::success();
