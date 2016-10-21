<?php

$io = PicCLI::getIO();

$appConf = array(
    "constants" => array(
        "APP_NAME" => PicCLI::getGetopt("--appname", "Pictorials"),
    ),
    "image_sizes" => array(
        "small" => array("width" => 250, "height" => 250),
        "medium" => array("width" => 400, "height" => 400),
        "large" => array("width" => 750, "height" => 750),
    ),
    "image_types" => array("jpg", "png"),
);

$constantsKeys = array(
    "cachedir" => "CACHE_DIR",
    "asset-baseurl" => "ASSET_BASE_URL",
    "script-baseurl" => "SCRIPT_BASE_URL",
);
foreach ($constantsKeys as $key => $const) {
    $val = PicCLI::getGetopt("--{$key}");
    if (!$val) {
        $io->errln("You must supply the --{$key} option.");
        exit(PicCLI::EXIT_USAGE);
    }
    if ($val[0] !== "/") {
        $io->errln("The path for the --{$key} setting must be absolute.");
        exit(PicCLI::EXIT_USAGE);
    }
    $appConf["constants"][$const] = $val;
}
$appConf["constants"]["ASSET_BASE_URL"] = rtrim($appConf["constants"]["ASSET_BASE_URL"], "/") . "/";

return $appConf;
