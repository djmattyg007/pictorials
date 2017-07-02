<?php

require(BASE_PATH . "main/bootstrap.php");

loadPicFile("main/logging.php");
loadPicFile("classes/db.php");
loadPicFile("classes/accesscontrol.php");
loadPicFile("classes/image.php");
loadPicFile("classes/mrmime.php");
PicDB::initDB();
loadPicFile("main/auth.php");

if (empty($_GET["mode"])) {
    loadPicFile("modes/home.php");
    exit();
}

switch ($_GET["mode"]) {
    case "download":
    case "filebrowser":
    case "loadimage":
    case "share":
    case "sysload":
    case "albummanager":
    case "albumdetails":
    case "albumfiles":
        try {
            loadPicFile("modes/{$_GET["mode"]}.php");
        } catch (Exception $e) {
            sendError(500);
        }
        break;
    default:
        sendError(404);
}
