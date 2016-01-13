<?php

$appConfig = json_decode(loadSGFile("conf/app.json"), true);

$constants = $appConfig["constants"];
foreach ($constants as $name => $value) {
    define($name, $value);
}
