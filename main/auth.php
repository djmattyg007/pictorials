<?php

$userId = null;
$basic = new Uauth\Basic("Secured Area", array());
$basic->verify(function($username, $password) use (&$userId) {
    $select = PicDB::newSelect();
    $select->cols(array("id", "password"))
        ->from("users")
        ->where("username = :username")
        ->bindValues(array(
            "username" => $username,
        ));
    $row = PicDB::fetch($select, "one");
    if (!$row) {
        return false;
    }
    if (!password_verify($password, $row["password"])) {
        return false;
    }
    if (password_needs_rehash($row["password"], PASSWORD_DEFAULT)) {
        $newHash = password_hash($password, PASSWORD_DEFAULT);
        $update = PicDB::newUpdate();
        $update->table("users")
            ->cols(array("password" => $newHash))
            ->where("id = :id")
            ->bindValue("id", (int) $row["id"]);
        PicDB::crud($update);
    }
    $userId = (int) $row["id"];
    return true;
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
