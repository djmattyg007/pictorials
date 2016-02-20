<?php

$authConfig = json_decode(loadPicFile("conf/auth.json"), true);
$userConfig = $authConfig["users"];

$vendorAuthConfig = array_combine(array_column($userConfig, "username"), array_column($userConfig, "password"));
$basic = new \Uauth\Basic("Secured Area", $vendorAuthConfig);
$basic->deny(function($username) {
    if ($username !== null) {
        Logger::notice("main", "Failed login", array("username" => $username));
    }
});
$basic->auth();

define("USERNAME", $basic->getUser());
Logger::debug("main", "Successful authentication");

header("Content-Security-Policy: script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com");
