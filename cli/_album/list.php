<?php

PicCLI::initGetopt(array("path:"));
$io = PicCLI::getIO();

loadPicFile("classes/db.php");
PicDB::initDB();

$select = PicDB::newSelect();
$select->cols(array("id", "name"))
    ->from("albums");
if ($pathID = PicCLI::getGetopt("--path")) {
    if (!is_numeric($pathID)) {
        $io->errln("Invalid path ID supplied.");
        exit(PicCLI::EXIT_INPUT);
    }
    $select->where("path_id = :path_id")
        ->bindValue("path_id", (int) $pathID);
}
$select->orderBy(array("id ASC"));
$rows = PicDB::fetch($select, "assoc");
if (empty($rows)) {
    if (isset($userID) || isset($pathID)) {
        $io->outln("No albums match the search criteria.");
    } else {
        $io->outln("No albums have been created.");
    }
} else {
    $highestID = max(array_keys($rows));
    $idWidth = strlen((string) $highestID);
    foreach ($rows as $id => $data) {
        $io->out(sprintf("<<blue>>%s<<reset>> ", str_pad($id, $idWidth)));
        $io->outln(sprintf('%1$s', $data["name"]));
    }
}
