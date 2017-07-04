<?php

PicCLI::initGetopt(array("sort::"));
$io = PicCLI::getIO();

loadPicFile("classes/db.php");
PicDB::initDB();

$select = PicDB::newSelect();
$select->cols(array("id", "name"))
    ->from("groups");
$sortOption = PicCLI::getGetopt("--sort");
if ($sortOption === true) {
    $select->orderBy(array("name ASC"));
}
$select->orderBy(array("id ASC"));
$rows = PicDB::fetch($select, "assoc");
if (empty($rows)) {
    $io->outln("No groups have been created.");
} else {
    $highestId = max(array_keys($rows));
    $idWidth = strlen((string) $highestId);
    foreach ($rows as $id => $data) {
        $io->out(sprintf("<<blue>>%s<<reset>> ", str_pad($id, $idWidth)));
        $io->outln(sprintf('%1$s', $data["name"]));
    }
}
