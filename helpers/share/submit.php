<?php

sort($files);
$partsEncoded = implode(PATH_SEPARATOR, $files);
$shareID = strtolower(sha1($pathID . PATH_SEPARATOR . $partsEncoded));

$row = loadPicFile("helpers/share/receive.php", array("shareID" => $shareID));
if ($row) {
    return $shareID;
}

$insert = PicDB::newInsert();
$insert->into("shares")
    ->cols(array(
        "share_id" => $shareID,
        "path_id" => $pathID,
        "files" => $partsEncoded,
    ));
PicDB::crud($insert);
return $shareID;
