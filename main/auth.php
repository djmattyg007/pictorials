<?php

$authConfig = json_decode(loadSGFile("conf/auth.json"), true);

$vendorAuthConfig = array_combine(array_column($authConfig, "username"), array_column($authConfig, "password"));
$basic = new \Uauth\Basic("Secured Area", $vendorAuthConfig);
$basic->auth();
