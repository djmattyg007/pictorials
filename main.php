<?php

/**
 * @param string $includePicFilename
 * @param array $extractVars
 * @param bool $getContentsOverride
 */
function loadPicFile($includePicFilename, array $extractVars = array(), $getContentsOverride = false)
{
    if ($getContentsOverride === true || !in_array(pathinfo($includePicFilename, PATHINFO_EXTENSION), ["php", "phtml"])) {
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
loadPicFile("main/logging.php");
loadPicFile("classes/accesscontrol.php");
//loadPicFile("classes/hoamimewrapper.php");
loadPicFile("classeses/mrmime.php");

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
