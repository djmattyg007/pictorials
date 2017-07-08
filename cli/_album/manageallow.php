<?php

try {
    loadPicFile("cli/_album/_manageaccess.php", array("authType" => "allow"));
} catch (PicManageAlbumAccessException $e) {
    if ($e->action === "add") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already allowed to manage this album.', $e->idLabel, $e->label));
    } elseif ($e->action === "remove") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already not explicitly allowed to manage this album.', $e->idLabel, $e->label));
    }
}
