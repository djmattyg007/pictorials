<?php

if (Access::modeCheckAny(array("manage", "view_album")) === false) {
    sendError(404);
}

header("Content-type: text/plain");

$cores = ((int) exec("nproc")) * 100;
$load = (int) str_replace(".", "", strstr(file_get_contents("/proc/loadavg"), " ", true));

if ($load > $cores) {
    echo "0";
} elseif ($load > ($cores / 2)) {
    echo "1";
} else {
    echo "2";
}
