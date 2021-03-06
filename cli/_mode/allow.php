<?php

try {
    loadPicFile("cli/_mode/_access.php", array("authType" => "allow"));
} catch (PicModeAccessException $e) {
    if ($e->action === "add") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already allowed to access this mode.', $e->idLabel, $e->label));
    } elseif ($e->action === "remove") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already not explicitly allowed to access this mode.', $e->idLabel, $e->label));
    }
}
