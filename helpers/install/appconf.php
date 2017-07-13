<?php

$io = PicCLI::getIO();

$appConf = array(
    "constants" => array(
        "APP_NAME" => PicCLI::getGetopt("--appname", "Pictorials"),
    ),
    "assets_through_php" => PicCLI::getGetopt("--php-static-assets", false),
    "image_sizes" => array(
        "small" => array("width" => 250, "height" => 250),
        "medium" => array("width" => 400, "height" => 400),
        "large" => array("width" => 750, "height" => 750),
        "xlarge" => array("width" => 1000, "height" => 1000),
    ),
    "image_types" => array("jpg", "png"),
);

$cachedir = PicCLI::getGetopt("--cachedir");
if (!$cachedir) {
    $io->errln("You must supply the --cachedir option.");
    exit(PicCLI::EXIT_USAGE);
}
if ($cachedir[0] !== "/") {
    $io->errln("The path for the --cachedir setting must be absolute.");
    exit(PicCLI::EXIT_USAGE);
}
$appConf["constants"]["CACHE_DIR"] = $cachedir;

$assetBaseUrl = PicCLI::getGetopt("--asset-baseurl");
if (!$assetBaseUrl) {
    $io->errln("You must supply the --asset-baseurl option.");
    exit(PicCLI::EXIT_USAGE);
}
if ($assetBaseUrl === "default") {
    if ($appConf["assets_through_php"]) {
        $appConf["constants"]["ASSET_BASE_URL"] = "/pictorials-static.php";
    } else {
        $appConf["constants"]["ASSET_BASE_URL"] = "/pictorials/";
    }
} else {
    if ($assetBaseUrl[0] !== "/") {
        $io->errln("The path for the --asset-url-template setting must be absolute.");
        exit(PicCLI::EXIT_USAGE);
    }
    if ($appConf["assets_through_php"]) {
        $appConf["constants"]["ASSET_BASE_URL"] = $assetBaseUrl;
    } else {
        $appConf["constants"]["ASSET_BASE_URL"] = rtrim($assetBaseUrl, "/") . "/";
    }
}

$scriptBaseUrl = PicCLI::getGetopt("--script-baseurl");
if (!$scriptBaseUrl) {
    $io->errln("You must supply the --script-baseurl option.");
    exit(PicCLI::EXIT_USAGE);
}
if ($scriptBaseUrl === "default") {
    $appConf["constants"]["SCRIPT_BASE_URL"] = "/pictorials.php";
} else {
    if ($scriptBaseUrl[0] !== "/") {
        $io->errln("The path for the --script-baseurl setting must be absolute.");
        exit(PicCLI::EXIT_USAGE);
    }
    $appConf["constants"]["SCRIPT_BASE_URL"] = $scriptBaseUrl;
}

return $appConf;
