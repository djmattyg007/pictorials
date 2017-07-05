<?php

PicCLI::initGetopt(array("sort::"));
$io = PicCLI::getIO();

loadPicFile("classes/db.php");
PicDB::initDB();

$select = PicDB::newSelect();
$select->cols(array("id", "username", "name"))
    ->from("users");
$sortOption = PicCLI::getGetopt("--sort");
if ($sortOption === true || $sortOption === "username") {
    $select->orderBy(array("username ASC"));
} elseif ($sortOption === "name") {
    $select->orderBy(array("name ASC"));
}
$select->orderBy(array("id ASC"));
$rows = PicDB::fetch($select, "assoc");
if (empty($rows)) {
    $io->outln("No users have been created.");
} else {
    $highestID = max(array_keys($rows));
    $idWidth = strlen((string) $highestID);
    foreach ($rows as $id => $data) {
        $io->out(sprintf("<<blue>>%s<<reset>> ", str_pad($id, $idWidth)));
        $io->outln(sprintf('%1$s - %2$s', $data["username"], $data["name"]));
    }
}
