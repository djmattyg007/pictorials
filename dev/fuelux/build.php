<?php

require(__DIR__ . "/vendor/autoload.php");

define("FUELUX_VERSION", "3.16.1");
define("BUILD_DIR", __DIR__ . "/build");
define("DIST_DIR", __DIR__ . "/dist");

exec("mkdir -p " . BUILD_DIR . " " . DIST_DIR);
exec("rm -Rf " . BUILD_DIR . "/* " . BUILD_DIR . "/.*");
exec("wget https://github.com/ExactTarget/fuelux/archive/" . FUELUX_VERSION . ".tar.gz -O " . BUILD_DIR . "/fuelux.tar.gz");
exec("tar -x --directory=" . BUILD_DIR . " --strip-components=1 -f " . BUILD_DIR . "/fuelux.tar.gz");

$licenseText = "/**\n" . file_get_contents(BUILD_DIR . "/LICENSE") . "\n*/\n";

$lessParser = new Less_Parser();
$lessParser->SetImportDirs(array(BUILD_DIR . "/less/" => ""));
$lessParser->parseFile(__DIR__ . "/pictorials.less");
$css = $lessParser->getCss();

$cssParser = new Sabberworm\CSS\Parser($css);
$cssDoc = $cssParser->parse();
$cssDoc->removeDeclarationBlockBySelector(".clearfix");
$cssDoc->removeDeclarationBlockBySelector(".clearfix:before, .clearfix:after");
$cssDoc->removeDeclarationBlockBySelector(".clearfix:before");
$cssDoc->removeDeclarationBlockBySelector(".clearfix:after");
file_put_contents(DIST_DIR . "/fuelux.css", $licenseText . (string) $cssDoc);

$jsFiles = array("combobox", "repeater", "repeater-list", "search", "selectlist");
$js = "";
foreach ($jsFiles as $jsFile) {
    $js .= file_get_contents(BUILD_DIR . "/js/{$jsFile}.js") . "\n";
}
file_put_contents(DIST_DIR . "/fuelux.js", $licenseText . $js);
