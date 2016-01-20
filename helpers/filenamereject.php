<?php

/** @var $filename string */

if (strpos($filename, "..") !== false) {
    sendError(400);
}
if (strpos($filename, "~") !== false) {
    sendError(400);
}
return trim($filename, "/\\");
