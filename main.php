<?php

/**
 * @param string $includePicFilename
 * @param array $extractVars
 */
function loadPicFile($includePicFilename, array $extractVars = array())
{
    if (!in_array(pathinfo($includePicFilename, PATHINFO_EXTENSION), ["php", "phtml"])) {
        return file_get_contents(BASE_PATH . $includePicFilename);
    }
    if (!empty($extractVars)) {
        extract($extractVars);
    }
    return require(BASE_PATH . $includePicFilename);
}
loadPicFile("main/app.php");
loadPicFile("main/func.php");
loadPicFile("vendor/autoload.php");
loadPicFile("classes/accesscontrol.php");

loadPicFile("main/auth.php");

if (empty($_GET["mode"])) {
    loadPicFile("modes/filebrowser.php");
    exit();
}

switch ($_GET["mode"]) {
    case "download":
    case "filebrowser":
    case "loadimage":
    case "sysload":
        loadPicFile("modes/{$_GET["mode"]}.php");
        break;
    default:
        sendError(404);
}
