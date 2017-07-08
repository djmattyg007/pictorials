<?php

try {
    loadPicFile("cli/_album/_viewaccess.php", array("authType" => "allow"));
} catch (PicViewAlbumAccessException $e) {
    if ($e->action === "add") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already allowed to view this album.', $e->idLabel, $e->label));
    } elseif ($e->action === "remove") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already not explicitly allowed to view this album.', $e->idLabel, $e->label));
    }
}
