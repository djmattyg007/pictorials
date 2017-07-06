<?php

try {
    loadPicFile("cli/_mode/_access.php", array("authType" => "deny"));
} catch (PicModeAccessException $e) {
    if ($e->action === "add") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already denied access to this mode.', $e->idLabel, $e->label));
    } elseif ($e->action === "remove") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already not explicitly denied access to this mode.', $e->idLabel, $e->label));
    }
}
