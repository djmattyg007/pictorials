<?php

if ($authConfigJSON = PicConfCache::get("managealbumauth.json")) {
    $authConfig = json_decode($authConfigJSON, true);
    goto finalise;
}

$authConfigTemplate = array(
    "allow" => array("users" => array(), "groups" => array()),
    "deny" => array("users" => array(), "groups" => array()),
);
$albumIDSelect = PicDB::newSelect();
$albumIDSelect->cols(array("id"))
    ->from("albums");
$albumIDs = PicDB::fetch($albumIDSelect, "col");
$authConfig = array_fill_keys($albumIDs, $authConfigTemplate);

$accessSelect = PicDB::newSelect();
$accessSelect->cols(array("album_id", "id_type", "auth_id"))
    ->from("manage_album_access")
    ->where("auth_type = :auth_type");

$accessSelect->bindValue("auth_type", "allow");
$allowRows = PicDB::fetch($accessSelect, "group", PDO::FETCH_NAMED);
$accessSelect->bindValue("auth_type", "deny");
$denyRows = PicDB::fetch($accessSelect, "group", PDO::FETCH_NAMED);

foreach ($allowRows as $path => $allowRow) {
    foreach ($allowRow as $auth) {
        $authConfig[$path]["allow"][$auth["id_type"]][] = $auth["auth_id"];
    }
}
foreach ($denyRows as $path => $denyRow) {
    foreach ($denyRow as $auth) {
        $authConfig[$path]["deny"][$auth["id_type"]][] = $auth["auth_id"];
    }
}

PicConfCache::set("managealbumauth.json", $authConfig);

finalise:
if (isset($selectedAlbumID)) {
    return $authConfig[$selectedAlbumID];
} else {
    return $authConfig;
}
