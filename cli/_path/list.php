<?php

PicCLI::initGetopt(array("sort::"));
$io = PicCLI::getIO();

loadPicFile("classes/db.php");
PicDB::initDB();

$select = PicDB::newSelect();
$select->cols(array("id", "name", "path"))
    ->from("paths");
$sortOption = PicCLI::getGetopt("--sort");
if ($sortOption === true || $sortOption === "sortorder") {
    $select->orderBy(array("sort_order ASC"));
} elseif ($sortOption === "name") {
    $select->orderBy(array("name ASC"));
}
$select->orderBy(array("id ASC"));
$rows = PicDB::fetch($select, "assoc");
if (empty($rows)) {
    $io->outln("No paths have been created.");
} else {
    $highestId = max(array_keys($rows));
    $idWidth = strlen((string) $highestId);
    foreach ($rows as $id => $data) {
        $io->out(sprintf("<<blue>>%s<<reset>> ", str_pad($id, $idWidth)));
        $io->outln(sprintf('%1$s - %2$s', $data["name"], $data["path"]));
    }
}
