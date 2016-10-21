<?php

$userId = null;
$basic = new Uauth\Basic("Secured Area", array());
$basic->verify(function($username, $password) use (&$userId) {
    $select = PicDB::newSelect();
    $select->cols(array("id"))
        ->from("users")
        ->where("username = :username")
        ->where("password = :password")
        ->bindValues(array(
            "username" => $username,
            "password" => $password,
        ));
    $id = PicDB::fetch($select, "value");
    if ($id) {
        $userId = (int) $id;
        return true;
    } else {
        return false;
    }
});
$basic->deny(function($username) {
    if ($username !== null) {
        Logger::notice("main", "Failed login", array("username" => $username));
    }
});
$basic->auth();

define("USERNAME", $basic->getUser());
define("USER_ID", $userId);
Logger::debug("main", "Successful authentication");

header("Content-Security-Policy: script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com");
