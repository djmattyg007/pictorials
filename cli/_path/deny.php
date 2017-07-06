<?php

try {
    loadPicFile("cli/_path/_access.php", array("authType" => "deny"));
} catch (PicPathAccessException $e) {
    if ($e->action === "add") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already denied access to this path.', ucwords($e->idType), $e->label));
    } elseif ($e->action === "remove") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already not explicitly denied access to this path.', ucwords($e->idType), $e->label));
    }
}
