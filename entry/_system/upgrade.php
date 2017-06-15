<?php

$io = PicCLI::getIO();
loadPicFile("classes/db.php");
$conn = PicDB::initDB();
$oldVersion = PicDB::getSystemVal("version");
if (version_compare($oldVersion, VERSION, "=") === true) {
    PicCLI::warn("<<yellow>>You are already on the latest version of the software.<<reset>>");
    exit(PicCLI::EXIT_SUCCESS);
}

loadPicFile("helpers/install/db." . PicDB::getDBType() . ".php");
PicDBInstall::upgrade($conn, $oldVersion);

$update = PicDB::newUpdate();
$update->table("system")
    ->cols("value" => VERSION)
    ->where("key = :key")
    ->bindValue("key", "version");
PicDB::crud($update);
PicCLI::success();
