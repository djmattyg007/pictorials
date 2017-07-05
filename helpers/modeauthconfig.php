<?php

if ($authConfigJSON = PicConfCache::get("modeauth.json")) {
    $authConfig = json_decode($authConfigJSON, true);
    goto finalise;
}

$authConfigTemplate = array(
    "allow" => array("users" => array(), "groups" => array()),
    "deny" => array("users" => array(), "groups" => array()),
);
$modeTypes = array("manage", "view_album");
$authConfig = array_fill_keys($modeTypes, $authConfigTemplate);

$accessSelect = PicDB::newSelect();
$accessSelect->cols(array("mode_type", "id_type", "auth_id"))
    ->from("mode_access")
    ->where("auth_type = :auth_type");

$accessSelect->bindValue("auth_type", "allow");
$allowRows = PicDB::fetch($accessSelect, "group", PDO::FETCH_NAMED);
$accessSelect->bindValue("auth_type", "deny");
$denyRows = PicDB::fetch($accessSelect, "group", PDO::FETCH_NAMED);

foreach ($allowRows as $modeType => $allowRow) {
    foreach ($allowRow as $auth) {
        $authConfig[$modeType]["allow"][$auth["id_type"]][] = $auth["auth_id"];
    }
}
foreach ($denyRows as $modeType => $denyRow) {
    foreach ($denyRow as $auth) {
        $authConfig[$modeType]["deny"][$auth["id_type"]][] = $auth["auth_id"];
    }
}

PicConfCache::set("modeauth.json", $authConfig);

finalise:
if (isset($selectedModeType)) {
    return $authConfig[$selectedModeType];
} else {
    return $authConfig;
}
