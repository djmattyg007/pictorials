<?php

PicCLI::initGetopt(array("path:", "user:", "sort::"));
$io = PicCLI::getIO();

loadPicFile("classes/db.php");
PicDB::initDB();

$select = PicDB::newSelect();
$select->cols(array("id", "name"))
    ->from("albums");
if ($username = PicCLI::getGetopt("--user")) {
    $userID = loadPicFile("helpers/id/user.php", array("username" => $username));
    if (!$userID) {
        $io->errln(sprintf("User '%s' does not exist.", $username));
        exit(PicCLI::EXIT_INPUT);
    }
    $select->where("user_id = :user_id")
        ->bindValue("user_id", $userID);
}
if ($pathID = PicCLI::getGetopt("--path")) {
    if (!is_numeric($pathID)) {
        $io->errln("Invalid path ID supplied.");
        exit(PicCLI::EXIT_INPUT);
    }
    $select->where("path_id = :path_id")
        ->bindValue("path_id", (int) $pathID);
}
/*$sortOption = PicCLI::getGetopt("--sort");
if ($sortOption === true) {
    $select->orderBy(array("name ASC"));
}*/
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
