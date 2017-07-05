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

loadPicFile("classes/db.php");
PicDB::initDB();

if (PicCLI::getGetopt("--user")) {
    if (!($username = PicCLI::getGetopt(1))) {
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
    if (!($name = PicCLI::getGetopt(1))) {
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

if (!($modeType = PicCLI::getGetopt(2))) {
    $modeType = PicCLI::prompt("Mode Type");
    if (!$modeType) {
        $io->errln("No mode type specified.");
        exit(PicCLI::EXIT_INPUT);
    }
}
if (!in_array($modeType, array("manage", "view_album"))) {
    $io->errln("Invalid mode type supplied.");
    exit(PicCLI::EXIT_INPUT);
}

$select = PicDB::newSelect();
$select->cols(array("id"))
    ->from("mode_access")
    ->where("mode_type = :mode_type")
    ->where("auth_type = :auth_type")
    ->where("id_type = :id_type")
    ->where("auth_id = :auth_id")
    ->bindValues(array(
        "mode_type" => $modeType,
        "auth_type" => $authType,
        "id_type" => $idType,
        "auth_id" => $id,
    ));
$row = PicDB::fetch($select, "one");

class PicModeAccessException extends Exception
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
    PicModeAccessException::initE($action, $idType, $idLabel, $label);
} elseif ((!$row) && $action === "remove") {
    PicModeAccessException::initE($action, $idType, $idLabel, $label);
}

if ($action === "add") {
    $insert = PicDB::newInsert();
    $insert->into("mode_access")
        ->cols(array(
            "mode_type" => $modeType,
            "auth_type" => $authType,
            "id_type" => $idType,
            "auth_id" => $id,
        ));
    PicDB::crud($insert);
} elseif ($action === "remove") {
    $delete = PicDB::newDelete();
    $delete->from("mode_access")
        ->where("id = :id")
        ->bindValue("id", $row["id"]);
    PicDB::crud($delete);
}
PicCLI::success();
