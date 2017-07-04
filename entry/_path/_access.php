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

if (!($pathID = PicCLI::getGetopt(1))) {
    $io->errln("No path ID specified.");
    exit(PicCLI::EXIT_USAGE);
}
if (!is_numeric($pathID)) {
    $io->errln("Invalid path ID supplied.");
    exit(PicCLI::EXIT_INPUT);
}
$pathID = (int) $pathID;
if ($pathID <= 0) {
    $io->errln("Invalid path ID supplied.");
    exit(PicCLI::EXIT_INPUT);
}

loadPicFile("classes/db.php");
PicDB::initDB();
if (!loadPicFile("helpers/id/path.php", array("id" => $pathID))) {
    $io->errln(sprintf("Path %d does not exist.", $pathID));
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
    $label = $name;
} else {
    $io->errln("No ID type specified.");
    exit(PicCLI::EXIT_USAGE);
}

$select = PicDB::newSelect();
$select->cols(array("id"))
    ->from("path_access")
    ->where("path_id = :path_id")
    ->where("auth_type = :auth_type")
    ->where("id_type = :id_type")
    ->where("auth_id = :auth_id")
    ->bindValues(array(
        "path_id" => $pathID,
        "auth_type" => $authType,
        "id_type" => $idType,
        "auth_id" => $id,
    ));
$row = PicDB::fetch($select, "one");

class PicPathAccessException extends Exception
{
    public $action;
    public $idType;
    public $label;

    public static function initE($action, $idType, $label)
    {
        $e = new self();
        $e->action = $action;
        $e->idType = $idType;
        $e->label = $label;
        throw $e;
    }
}

if ($row && $action === "add") {
    PicPathAccessException::initE($action, $idType, $label);
} elseif ((!$row) && $action === "remove") {
    PicPathAccessException::initE($action, $idType, $label);
}

if ($action === "add") {
    $insert = PicDB::newInsert();
    $insert->into("path_access")
        ->cols(array(
            "path_id" => $pathID,
            "auth_type" => $authType,
            "id_type" => $idType,
            "auth_id" => $id,
        ));
    PicDB::crud($insert);
} elseif ($action === "remove") {
    $delete = PicDB::newDelete();
    $delete->from("path_access")
        ->where("id = :id")
        ->bindValue("id", $row["id"]);
    PicDB::crud($delete);
}
PicConfCache::remove("pathauth.json");
PicCLI::success();
