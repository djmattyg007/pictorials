<?php

function loadSGFile($filename, array $vars = array())
{
    if (!in_array(pathinfo($filename, PATHINFO_EXTENSION), ["php", "phtml"])) {
        return file_get_contents(BASE_PATH . $filename);
    }
    if (!empty($vars)) {
        extract($vars);
    }
    return require(BASE_PATH . $filename);
}
loadSGFile("main/func.php");
loadSGFile("vendor/autoload.php");

loadSGFile("main/auth.php");

if (empty($_GET["mode"])) {
    loadSGFile("modes/filebrowser.php");
    exit();
}

switch ($_GET["mode"]) {
    case "filebrowser":
        loadSGFile("modes/filebrowser.php");
        break;
    case "loadimage":
        loadSGFile("modes/loadimage.php");
        break;
    case "sysload":
        loadSGFile("modes/sysload.php");
        break;
    case "download":
        loadSGFile("modes/download.php");
        break;
    default:
        sendError(404);
}
