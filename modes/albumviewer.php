<?php

if (Access::modeCheckAny("view_album") === false) {
    sendError(404);
}

if (empty($_POST)) {
    $albumSelect = PicDB::newSelect();
    $albumSelect->cols(array("id", "name"))
        ->from("albums")
        ->where("id IN (:album_ids)")
        ->bindValue("album_ids", Access::getAllowedViewAlbums());
    $templateVars = array(
        "albums" => PicDB::fetch($albumSelect, "pairs"),
    );
    loadPicTemplate("albumviewer.phtml", $templateVars);
    exit();
}
