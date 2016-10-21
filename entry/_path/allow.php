<?php

try {
    loadPicFile("entry/_path/_access.php", array("authType" => "allow"));
} catch (PicPathAccessException $e) {
    if ($e->mode === "add") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already allowed to access this path.', ucwords($e->idType), $e->label));
    } elseif ($e->mode === "remove") {
        PicCLI::warn(sprintf('%1$s \'%2$s\' is already not explicitly allowed to access this path.', ucwords($e->idType), $e->label));
    }
}
