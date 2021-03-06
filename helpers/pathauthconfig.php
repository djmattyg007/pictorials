<?php

if ($authConfigJSON = PicConfCache::get("pathauth.json")) {
    $authConfig = json_decode($authConfigJSON, true);
    goto finalise;
}

$authConfigTemplate = array(
    "allow" => array("users" => array(), "groups" => array()),
    "deny" => array("users" => array(), "groups" => array()),
);
$pathIDSelect = PicDB::newSelect();
$pathIDSelect->cols(array("id"))
    ->from("paths");
$pathIDs = PicDB::fetch($pathIDSelect, "col");
$authConfig = array_fill_keys($pathIDs, $authConfigTemplate);

$accessSelect = PicDB::newSelect();
$accessSelect->cols(array("path_id", "id_type", "auth_id"))
    ->from("path_access")
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

PicConfCache::set("pathauth.json", $authConfig);

finalise:
if (isset($selectedPathID)) {
    return $authConfig[$selectedPathID];
} else {
    return $authConfig;
}
