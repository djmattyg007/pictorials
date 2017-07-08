<?php

PicCLI::initGetopt(array("add", "remove", "user", "group"));
$io = PicCLI::getIO();

if (PicCLI::getGetopt("--add")) {
    $action = "add";
} elseif (PicCLI::getGetopt("--remove")) {
    $action = "remove";
} else {
    $io->errln("No action specified.");
    exit(PicCLI::EXIT_USAGE);
}

if (!($albumID = PicCLI::getGetopt(1))) {
    $io->errln("No album ID specified.");
    exit(PicCLI::EXIT_USAGE);
}
if (!is_numeric($albumID)) {
    $io->errln("Invalid album ID supplied.");
    exit(PicCLI::EXIT_INPUT);
}
$albumID = (int) $albumID;
if ($albumID <= 0) {
    $io->errln("Invalid album ID supplied.");
    exit(PicCLI::EXIT_INPUT);
}

loadPicFile("classes/db.php");
PicDB::initDB();
if (!loadPicFile("helpers/id/album.php", array("id" => $albumID))) {
    $io->errln(sprintf("Album %d does not exist.", $albumID));
    exit(PicCLI::EXIT_INPUT);
}

if (PicCLI::getGetopt("--user")) {
    if (!($username = PicCLI::getGetopt(2))) {
        $username = PicCLI::prompt("Username");
        if (!$username) {
            $io->errln("No username specified.");
            exit(PicCLI::EXIT_INPUT);
        }
    }
    $id = loadPicFile("helpers/id/user.php", array("username" => $username));
    if (!$id) {
        $io->errln(sprintf("User '%s' does not exist.", $username));
        exit(PicCLI::EXIT_INPUT);
    }
    $idType = "users";
    $idLabel = "User";
    $label = $username;
} elseif (PicCLI::getGetopt("--group")) {
    if (!($name = PicCLI::getGetopt(2))) {
        $name = PicCLI::prompt("Name");
        if (!$name) {
            $io->errln("No group name specified.");
            exit(PicCLI::EXIT_INPUT);
        }
    }
    $id = loadPicFile("helpers/id/group.php", array("name" => $name));
    if (!$id) {
        $io->errln(sprintf("Group '%s' does not exist.", $name));
        exit(PicCLI::EXIT_INPUT);
    }
    $idType = "groups";
    $idLabel = "Group";
    $label = $name;
} else {
    $io->errln("No ID type specified.");
    exit(PicCLI::EXIT_USAGE);
}

$select = PicDB::newSelect();
$select->cols(array("id"))
    ->from("manage_album_access")
    ->where("album_id = :album_id")
    ->where("auth_type = :auth_type")
    ->where("id_type = :id_type")
    ->where("auth_id = :auth_id")
    ->bindValues(array(
        "album_id" => $albumID,
        "auth_type" => $authType,
        "id_type" => $idType,
        "auth_id" => $id,
    ));
$row = PicDB::fetch($select, "one");

class PicManageAlbumAccessException extends Exception
{
    public $action;
    public $idType;
    public $idLabel;
    public $label;

    public static function initE($action, $idType, $idLabel, $label)
    {
        $e = new self();
        $e->action = $action;
        $e->idType = $idType;
        $e->idLabel = $idLabel;
        $e->label = $label;
        throw $e;
    }
}

if ($row && $action === "add") {
    PicManageAlbumAccessException::initE($action, $idType, $idLabel, $label);
} elseif ((!$row) && $action === "remove") {
    PicManageAlbumAccessException::initE($action, $idType, $idLabel, $label);
}

if ($action === "add") {
    $insert = PicDB::newInsert();
    $insert->into("manage_album_access")
        ->cols(array(
            "album_id" => $albumID,
            "auth_type" => $authType,
            "id_type" => $idType,
            "auth_id" => $id,
        ));
    PicDB::crud($insert);
} elseif ($action === "remove") {
    $delete = PicDB::newDelete();
    $delete->from("manage_album_access")
        ->where("id = :id")
        ->bindValue("id", $row["id"]);
    PicDB::crud($delete);
}
PicConfCache::remove("managealbumauth.json");
PicCLI::success();
