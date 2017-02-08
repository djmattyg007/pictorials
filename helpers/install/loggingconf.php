<?php

$io = PicCLI::getIO();

if (PicCLI::getGetopt("--disable-logging", false)) {
    return loadPicFile("docs/examples/logging.disabled-example.json");
}

$loggingDir = PicCLI::getGetopt("--loggingdir");
if (!$loggingDir) {
    $io->errln("You must supply the --loggingdir option.");
    exit(PicCLI::EXIT_USAGE);
}
if ($loggingDir[0] !== "/") {
    $io->errln("The path for the --loggingdir setting must be absolute.");
    exit(PicCLI::EXIT_USAGE);
}

$loggingConf = loadPicFile("docs/examples/logging.example.json");
$loggingConf["handlers"]["mainFile"]["stream"] = rtrim($loggingDir, "/") . "/main.log";
$loggingConf["handlers"]["errorFile"]["stream"] = rtrim($loggingDir, "/") . "/error.log";
return $loggingConf;
