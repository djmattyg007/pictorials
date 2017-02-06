<?php

define("BASE_PATH", dirname(__DIR__) . "/");
if (file_exists(BASE_PATH . "conf/app.json")) {
    fwrite(STDERR, "Pictorials is already installed.\n");
    exit(1);
}
require(BASE_PATH . "main/bootstrap-base.php");

loadPicFile("classes/cli.php");
PicCLI::initCLI();
PicCLI::initGetopt(array(
    "appname:",
    "php-static",
    "cachedir:",
    "loggingdir:",
    "disable-logging",
    "asset-baseurl:",
    "script-baseurl:",
    "webroot:",
    "dbtype:",
    "sqlite-path:"
));
$io = PicCLI::getIO();

if (!is_writeable(BASE_PATH . "/conf")) {
    $io->errln("Current user must have permission to write to conf directory.");
    exit(PicCLI::EXIT_FAIL);
}

$dbType = PicCLI::getGetopt("--dbtype");
if (!file_exists(BASE_PATH . "helpers/install/db.{$dbType}.php")) {
    $io->errln("You must specify a supported database type.");
    exit(PicCLI::EXIT_USAGE);
}

$appConf = loadPicFile("helpers/install/appconf.php");
loadPicFile("helpers/install/db.{$dbType}.php");
$dbConf = array(
    "type" => $dbType,
    "config" => PicDBInstall::configure(),
);
$loggingConf = loadPicFile("helpers/install/loggingconf.php");
$webroot = loadPicFile("helpers/install/webroot.php");

$webEntryTemplate = '<?php
define("BASE_PATH", "%s");
require(BASE_PATH . "entry/web.php");';
$staticEntryTemplate = '<?php
define("BASE_PATH", "%s");
require(BASE_PATH . "entry/static.php");';

file_put_contents(BASE_PATH . "/conf/app.json", json_encode($appConf, JSON_PRETTY_PRINT));
file_put_contents(BASE_PATH . "/conf/db.json", json_encode($dbConf, JSON_PRETTY_PRINT));
file_put_contents(BASE_PATH . "/conf/logging.json", json_encode($loggingConf, JSON_PRETTY_PRINT));
if ($webroot) {
    $webroot = rtrim($webroot, "/");
    file_put_contents($webroot . $appConf["constants"]["SCRIPT_BASE_URL"], sprintf($webEntryTemplate, BASE_PATH));
    if ($appConf["assets_through_php"]) {
        file_put_contents($webroot . $appConf["constants"]["ASSET_BASE_URL"], sprintf($staticEntryTemplate, BASE_PATH));
    } else {
        symlink(BASE_PATH . "assets", $webroot . rtrim($appConf["constants"]["ASSET_BASE_URL"], "/"));
    }
}
PicDBInstall::create($dbConf["config"]);

PicCLI::success();
