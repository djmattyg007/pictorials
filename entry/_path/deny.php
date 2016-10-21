<?php

try {
    loadPicFile("entry/_path/_access.php", array("authType" => "deny"));
} catch (PicPathAccessException $e) {
    if ($e->mode === "add") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already denied access to this path.', ucwords($e->idType), $e->label));
    } elseif ($e->mode === "remove") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already not explicitly denied access to this path.', ucwords($e->idType), $e->label));
    }
}
