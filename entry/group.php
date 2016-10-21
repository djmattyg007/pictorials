<?php

define("BASE_PATH", dirname(__DIR__) . "/");
if (!file_exists(BASE_PATH . "conf/app.json")) {
    fwrite(STDERR, "Pictorials is not installed.\n");
    exit(1);
}
if (empty($argv[1])) {
    fwrite(STDERR, "No sub-command specified.\n");
    exit(1);
}
require(BASE_PATH . "main/bootstrap.php");

loadPicFile("classes/cli.php");
try {
    $command = PicCLI::initCommandCLI(array("create", "update", "delete", "view", "adduser"));
} catch (Exception $e) {
    PicCLI::getIO()->errln($e->getMessage());
    exit(PicCLI::EXIT_USAGE);
}

loadPicFile("entry/_group/{$command}.php");
