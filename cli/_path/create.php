<?php

PicCLI::initGetopt(array("sortorder:"));
$io = PicCLI::getIO();

if (!($name = PicCLI::getGetopt(1))) {
    $name = PicCLI::prompt("Name");
    if (!$name) {
        $io->errln("No name specified.");
        exit(PicCLI::EXIT_INPUT);
    }
}
if (!($path = PicCLI::getGetopt(2))) {
    $path = PicCLI::prompt("Path");
    if (!$path) {
        $io->errln("No path specified.");
        exit(PicCLI::EXIT_INPUT);
    }
}
if ($path[0] !== "/") {
    $io->errln("Paths must be absolute, not relative.");
    exit(PicCLI::EXIT_INPUT);
}
$path = rtrim($path, "/") . "/";

loadPicFile("classes/db.php");
PicDB::initDB();

if ($sortOrder = PicCLI::getGetopt("--sortorder")) {
    $sortOrder = (int) $sortOrder;
    if ($sortOrder <= 0) {
        $io->errln("Sort orders must be above zero.");
        exit(PicCLI::EXIT_INPUT);
    }
} else {
    $soSelect = PicDB::newSelect();
    $soSelect->cols(array("MAX(sort_order)"))
        ->from("paths");
    $sortOrder = (int) PicDB::fetch($soSelect, "value");
    if ($sortOrder) {
        $sortOrder = max($sortOrder, 1) + 1;
    } else {
        $sortOrder = 1;
    }
}

$insert = PicDB::newInsert();
$insert->into("paths")
    ->cols(array(
        "name" => $name,
        "path" => $path,
        "sort_order" => $sortOrder,
    ));
PicDB::crud($insert);
$io->outln(sprintf("<<blue>>Path ID:<<reset>> %d", PicDB::lastInsertId()));
PicConfCache::remove("pathauth.json");
PicCLI::success();
