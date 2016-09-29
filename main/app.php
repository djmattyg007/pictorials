<?php

define("VERSION", "0.3.0");

$appConfig = json_decode(loadPicFile("conf/app.json"), true);

$constants = $appConfig["constants"];
foreach ($constants as $name => $value) {
    define($name, $value);
}
