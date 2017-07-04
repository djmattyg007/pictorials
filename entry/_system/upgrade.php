<?php

$io = PicCLI::getIO();
loadPicFile("classes/db.php");
$conn = PicDB::initDB();
$oldVersion = PicDB::getSystemVal("version");
if (version_compare($oldVersion, VERSION, ">") === true) {
    $io->errln("It looks like you've attempted to downgrade Pictorials to an earlier version.");
    $io->errln("This is not a supported action. In future, you should back up your database");
    $io->errln("so you can roll back to an earlier version if an upgrade fails.");
    exit(1); // TOOD: Find an appropriate exit code
}
if (version_compare($oldVersion, VERSION, "=") === true) {
    PicCLI::warn("You are already on the latest version of the software.");
    exit(PicCLI::EXIT_SUCCESS);
}

loadPicFile("helpers/install/db." . PicDB::getDBType() . ".php");
PicDBInstall::upgrade($conn, $oldVersion);

$update = PicDB::newUpdate();
$update->table("system")
    ->cols(array("value" => VERSION))
    ->where("key = :key")
    ->bindValue("key", "version");
PicDB::crud($update);
PicCLI::success();
