<?php

try {
    loadPicFile("cli/_album/_viewaccess.php", array("authType" => "deny"));
} catch (PicViewAlbumAccessException $e) {
    if ($e->action === "add") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already denied access to view this album.', $e->idLabel, $e->label));
    } elseif ($e->action === "remove") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already not explicitly denied access to view this album.', $e->idLabel, $e->label));
    }
}
