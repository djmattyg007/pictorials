<?php

function loadPicFile($filename, array $vars = array())
{
    if (!in_array(pathinfo($filename, PATHINFO_EXTENSION), ["php", "phtml"])) {
        return file_get_contents(BASE_PATH . $filename);
    }
    if (!empty($vars)) {
        extract($vars);
    }
    return require(BASE_PATH . $filename);
}
loadPicFile("main/app.php");
loadPicFile("main/func.php");
loadPicFile("vendor/autoload.php");

loadPicFile("main/auth.php");

if (empty($_GET["mode"])) {
    loadPicFile("modes/filebrowser.php");
    exit();
}

switch ($_GET["mode"]) {
    case "filebrowser":
        loadPicFile("modes/filebrowser.php");
        break;
    case "loadimage":
        loadPicFile("modes/loadimage.php");
        break;
    case "sysload":
        loadPicFile("modes/sysload.php");
        break;
    case "download":
        loadPicFile("modes/download.php");
        break;
    default:
        sendError(404);
}
