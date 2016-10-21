<?php

$appConfig = loadPicFile("conf/app.json");

$constants = $appConfig["constants"];
foreach ($constants as $name => $value) {
    define($name, $value);
}
