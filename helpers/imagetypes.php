<?php

$imageTypes = loadPicFile("conf/app.json")["image_types"];
$allImageTypes = array();
foreach ($imageTypes as $imageType) {
    $allImageTypes = array_merge($allImageTypes, array_merge([$imageType], MrMime::getOtherExtensions($imageType)));
}
return array_map("strtolower", $allImageTypes);
